import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { createApiError, privateFetch } from "@/lib/api";
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
import WeeklyReportDetails from "./WeeklyReportDetails";

const ITEMS_PER_PAGE = 8;

export default function WeeklyReport() {
    const isMobile = useMediaQuery("(max-width: 767px)");
    const technicianId = Number(localStorage.getItem("id"));
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        data: reports = [],
        isLoading,
        isError,
    } = useQuery<WeeklyReportType[]>({
        queryKey: ["technician-weekly-reports", technicianId],
        queryFn: async () => {
            const response = await privateFetch("https://ilabcict-backend.onrender.com/api/reports/");
            const data = await response.json();

            if (!response.ok) {
                throw createApiError(
                    response.status,
                    data.message || "Failed to fetch weekly reports."
                );
            }

            return (data as ApiWeeklyReport[])
                .map(mapWeeklyReport)
                .filter((report) => report.technicianId === technicianId);
        },
        enabled: Number.isInteger(technicianId) && technicianId > 0,
    });

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
                <div className="primary-border-color rounded-2xl border bg-white p-4">
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
                            <div className="rounded-xl bg-muted/50 px-3 py-2">
                                <span className="secondary-text-color">Reports</span>
                                <span className="ml-2 font-semibold">{reports.length}</span>
                            </div>
                            <div className="rounded-xl bg-muted/50 px-3 py-2">
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
                            className="primary-border-color w-full rounded-xl border bg-white py-2 pl-10 pr-10 outline-none focus:border-black!"
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

                <div className="grid gap-3 md:grid-cols-2">
                    {isLoading && (
                        <p className="col-span-full py-8 text-center secondary-text-color">
                            Loading weekly reports...
                        </p>
                    )}

                    {isError && (
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
                        <WeeklyReportCard
                            key={report.id}
                            report={report}
                            onClick={() => openReport(report)}
                        />
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
