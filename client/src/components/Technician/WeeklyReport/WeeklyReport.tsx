import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Search, X } from "lucide-react";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
    buildApiUrl,
    buildWebSocketUrl,
    createApiError,
    getFreshAccessToken,
    privateFetch,
} from "@/lib/api";
import { appToast } from "@/utils/appToast";
import type {
    ApiWeeklyReport,
    WeeklyReport as WeeklyReportType,
} from "@/types/weeklyReport";
import {
    formatDate,
    exportReportToPdf,
    mapWeeklyReport,
    sortByNewest,
} from "@/components/Admin/WeeklyReport/weeklyReportUtils";
import WeeklyReportCard from "./WeeklyReportCard";
import WeeklyReportSkeleton from "@/components/WeeklyReportSkeleton/WeeklyReportSkeleton";
import WeeklyReportDetails from "./WeeklyReportDetails";

const ITEMS_PER_PAGE = 8;
const REPORTS_WS_ENDPOINT = "/ws/reports/";
const REPORTS_QUERY_KEY_PREFIX = "technician-weekly-reports";
const REPORTS_READY_QUERY_KEY_PREFIX = "technician-weekly-reports-ready";

type InitialReportsMessage = {
    event: "initial_reports";
    report: ApiWeeklyReport[];
    next?: string | null;
};

type ReportCreatedMessage = {
    event: "report_created";
    report: ApiWeeklyReport;
};

type ReportWebSocketMessage = InitialReportsMessage | ReportCreatedMessage;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isReportWebSocketMessage = (
    value: unknown
): value is ReportWebSocketMessage => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_reports") {
        return Array.isArray(value.report);
    }

    return value.event === "report_created" && isRecord(value.report);
};

const upsertReport = (
    reports: WeeklyReportType[],
    apiReport: ApiWeeklyReport
) => {
    const report = mapWeeklyReport(apiReport);
    const existingReport = reports.some((currentReport) =>
        currentReport.id === report.id
    );

    if (!existingReport) {
        return [report, ...reports];
    }

    return reports.map((currentReport) =>
        currentReport.id === report.id ? report : currentReport
    );
};

export default function WeeklyReport() {
    const queryClient = useQueryClient();
    const reportSocketRef = useRef<WebSocket | null>(null);
    const isMobile = useMediaQuery("(max-width: 767px)");
    const technicianId = Number(localStorage.getItem("id"));
    const canLoadReports = Number.isInteger(technicianId) && technicianId > 0;
    const reportsQueryKey = useMemo(
        () => [REPORTS_QUERY_KEY_PREFIX, technicianId] as const,
        [technicianId]
    );
    const reportsReadyQueryKey = useMemo(
        () => [REPORTS_READY_QUERY_KEY_PREFIX, technicianId] as const,
        [technicianId]
    );
    const cachedReportsAreReady =
        queryClient.getQueryData<boolean>(reportsReadyQueryKey) === true;
    const [hasInitialReports, setHasInitialReports] = useState(cachedReportsAreReady);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        data: reports = [],
        isPending,
        isError,
    } = useQuery<WeeklyReportType[]>({
        queryKey: reportsQueryKey,
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<WeeklyReportType[]>(reportsQueryKey) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<WeeklyReportType[]>(reportsQueryKey) ?? [],
        enabled: canLoadReports,
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const isLoading = isPending || (canLoadReports && !hasInitialReports);

    const markReportAsReadMutation = useMutation({
        mutationFn: async (reportId: number) => {
            const response = await privateFetch(
                buildApiUrl(`/api/reports/${reportId}/`),
                {
                    method: "PATCH",
                    body: JSON.stringify({ status: "read" }),
                }
            );
            const data = await response.json().catch(() => null) as {
                message?: string;
                detail?: string;
            } | null;

            if (!response.ok) {
                throw createApiError(
                    response.status,
                    data?.message || data?.detail || "Failed to mark the report as read."
                );
            }
        },
        onMutate: async (reportId) => {
            await queryClient.cancelQueries({ queryKey: reportsQueryKey });
            const previousReports = queryClient.getQueryData<WeeklyReportType[]>(
                reportsQueryKey
            );

            queryClient.setQueryData<WeeklyReportType[]>(
                reportsQueryKey,
                (currentReports = []) =>
                    currentReports.map((report) =>
                        report.id === reportId ? { ...report, status: "read" } : report
                    )
            );

            return { previousReports };
        },
        onError: (_error, _reportId, context) => {
            if (context?.previousReports) {
                queryClient.setQueryData(reportsQueryKey, context.previousReports);
            }

            appToast.error("We couldn't mark this report as read. Please try again.");
        },
    });

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            if (!canLoadReports) {
                return;
            }

            const accessToken = await getFreshAccessToken();

            if (!accessToken) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(REPORTS_WS_ENDPOINT, { token: accessToken })
            );

            reportSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isReportWebSocketMessage(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_reports") {
                    const initialReports = parsedMessage.report
                        .map(mapWeeklyReport)
                        .filter((report) => report.technicianId === technicianId);

                    setHasInitialReports(true);
                    queryClient.setQueryData(reportsReadyQueryKey, true);
                    queryClient.setQueryData<WeeklyReportType[]>(
                        reportsQueryKey,
                        initialReports
                    );
                    return;
                }

                const report = mapWeeklyReport(parsedMessage.report);

                if (report.technicianId !== technicianId) {
                    return;
                }

                queryClient.setQueryData<WeeklyReportType[]>(
                    reportsQueryKey,
                    (currentReports = []) =>
                        upsertReport(currentReports, parsedMessage.report)
                );
            });
        }, 0);

        return () => {
            window.clearTimeout(connectSocket);
            socket?.close();

            if (reportSocketRef.current === socket) {
                reportSocketRef.current = null;
            }
        };
    }, [canLoadReports, queryClient, reportsQueryKey, reportsReadyQueryKey, technicianId]);

    const filteredReports = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return [...reports]
            .filter((report) => {
                const searchableText = [
                    report.reportCode,
                    report.title,
                    report.summary,
                    formatDate(report.createdAt),
                ]
                    .join(" ")
                    .toLowerCase();

                return normalizedQuery === "" || searchableText.includes(normalizedQuery);
            })
            .sort(sortByNewest);
    }, [reports, searchQuery]);

    const selectedReport = useMemo(
        () => reports.find((report) => report.id === selectedReportId) ?? null,
        [reports, selectedReportId]
    );

    const latestReportDate = useMemo(
        () => [...reports].sort(sortByNewest)[0]?.createdAt,
        [reports]
    );

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const maxPage = Math.max(totalPages, 1);
    const currentPage = Math.min(page, maxPage);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const clearSearch = () => {
        setSearchQuery("");
        setPage(1);
        searchInputRef.current?.focus();
    };

    const goToPage = (nextPage: number) => {
        setPage(Math.min(Math.max(nextPage, 1), maxPage));
    };

    const openReport = (report: WeeklyReportType) => {
        setSelectedReportId(report.id);
        setSheetOpen(true);

        if (report.status.toLowerCase() === "unread") {
            markReportAsReadMutation.mutate(report.id);
        }
    };

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);

        if (!open) {
            setSelectedReportId(null);
        }
    };

    return (
        <>
            <div className="flex w-full flex-col gap-4 px-3 py-4">
                <div className="rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-red-50 p-2.5 text-primary-color">
                                <FileText size={21} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">My Weekly Reports</h2>
                                <p className="mt-1 text-sm leading-6 secondary-text-color">
                                    Generated summaries for your completed maintenance work.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                            <div className="rounded-xl bg-muted/50 px-3 py-2 shadow-sm shadow-black/5">
                                <span className="secondary-text-color">Reports</span>
                                <span className="ml-2 font-semibold">{reports.length}</span>
                            </div>
                            <div className="rounded-xl bg-muted/50 px-3 py-2 shadow-sm shadow-black/5">
                                <span className="secondary-text-color">Latest</span>
                                <span className="ml-2 font-semibold">
                                    {latestReportDate ? formatDate(latestReportDate) : "None"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm secondary-text-color">
                        {filteredReports.length} report
                        {filteredReports.length === 1 ? "" : "s"} found
                    </p>

                    <div className="relative w-full md:w-[340px]">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search my reports..."
	                            className="w-full rounded-xl bg-white py-2 pl-10 pr-10 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none"
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={clearSearch}
                                className="secondary-text-color absolute right-3 top-1/2 -translate-y-1/2 hover:text-black"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {isLoading && (
                        <WeeklyReportSkeleton />
                    )}

                    {!isLoading && isError && (
                        <p className="col-span-full py-8 text-center text-red-500">
                            Failed to load weekly reports.
                        </p>
                    )}

                    {!isLoading && !isError && paginatedReports.length === 0 && (
                        <p className="col-span-full py-8 text-center secondary-text-color">
                            No weekly reports found.
                        </p>
                    )}

                    {!isLoading && !isError && paginatedReports.map((report) => (
                        <div key={report.id} className="flex h-full justify-center">
                            <WeeklyReportCard
                                report={report}
                                onClick={() => openReport(report)}
                            />
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <Pagination className={`flex ${isMobile ? "justify-center" : "justify-end"}`}>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => goToPage(currentPage - 1)} />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, index) => (
                                <PaginationItem key={index + 1}>
                                    <PaginationLink
                                        isActive={currentPage === index + 1}
                                        onClick={() => goToPage(index + 1)}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext onClick={() => goToPage(currentPage + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={isMobile ? "h-[90vh]" : "w-[620px]!"}
                >
                    {selectedReport && (
                        <WeeklyReportDetails
                            report={selectedReport}
                            onExport={exportReportToPdf}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
