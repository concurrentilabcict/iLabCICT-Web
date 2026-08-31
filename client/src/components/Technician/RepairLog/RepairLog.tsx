import RepairLogCard from "./RepairLogCard";
import RepairLogSkeleton from "@/components/RepairLogSkeleton/RepairLogSkeleton";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import RepairLogDetails from "./RepairLogDetails";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { buildWebSocketUrl, getFreshAccessToken } from "@/lib/api";
import type { RepairLog } from "@/types/repairLog";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TicketTypeFilter } from "@/utils/ticket";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type RepairLogProps = {
    typeFilter: TicketTypeFilter;
    searchQuery: string;
};

type ApiRepairLog = {
    id: number;
    ticket: {
        id: number;
        ticket_code?: string;
        type: string;
        title?: string;
        complaint_description?: string;
        status?: string;
        created_at?: string;
        updated_at?: string;
        reported_by: {
            id: number;
            first_name: string;
            last_name: string;
        };
        assigned_to: {
            id: number;
            first_name: string;
            last_name: string;
        };
        room?: {
            id: number;
            room_name: string;
            building_name: string;
            floor_number: number;
        };
        computer?: {
            id: number;
            computer_code: string;
        } | null;
    };
    repair_log_code: string;
    title: string;
    repair_notes: string;
    created_at: string;
    technician?: number;
};

type InitialRepairLogsMessage = {
    event: "initial_repair_logs";
    repair_log: ApiRepairLog[];
    next?: string | null;
};

type RepairLogCreatedMessage = {
    event: "repair_log_created";
    repair_log: ApiRepairLog;
};

type RepairLogWebSocketMessage =
    | InitialRepairLogsMessage
    | RepairLogCreatedMessage;

const REPAIR_LOGS_WS_ENDPOINT = "/ws/repair-logs/";
const REPAIR_LOGS_READY_QUERY_KEY_PREFIX = "technician-repair-logs-ready";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isRepairLogWebSocketMessage = (
    value: unknown
): value is RepairLogWebSocketMessage => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_repair_logs") {
        return Array.isArray(value.repair_log);
    }

    return value.event === "repair_log_created" && isRecord(value.repair_log);
};

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export default function RepairLog({
    typeFilter,
    searchQuery,
}: RepairLogProps) {

    const queryClient = useQueryClient();
    const repairLogSocketRef = useRef<WebSocket | null>(null);
    const isMobile = useMediaQuery("(max-width: 767px)");
    const [selectedRepairLogId, setSelectedRepairLogId] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const technicianId = Number(localStorage.getItem("id"));
    const readyQueryKey = useMemo(
        () => [REPAIR_LOGS_READY_QUERY_KEY_PREFIX, technicianId] as const,
        [technicianId]
    );
    const cachedRepairLogsAreReady =
        queryClient.getQueryData<boolean>(readyQueryKey) === true;
    const [hasInitialRepairLogs, setHasInitialRepairLogs] = useState(
        cachedRepairLogsAreReady
    );

    const filterKey = JSON.stringify([typeFilter, searchQuery]);
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey,
    });

    const ITEMS_PER_PAGE = 10;

    const mapRepairLog = (repairLog: ApiRepairLog): RepairLog => ({
        id: repairLog.id,
        ticket: {
            id: repairLog.ticket.id,
            ticketCode: repairLog.ticket.ticket_code,
            type: repairLog.ticket.type,
            title: repairLog.ticket.title,
            complaintDescription: repairLog.ticket.complaint_description,
            status: repairLog.ticket.status,
            createdAt: repairLog.ticket.created_at,
            updatedAt: repairLog.ticket.updated_at,
            reportedBy: {
                id: repairLog.ticket.reported_by.id,
                firstName: repairLog.ticket.reported_by.first_name,
                lastName: repairLog.ticket.reported_by.last_name,
            },
            assignedTo: {
                id: repairLog.ticket.assigned_to.id,
                firstName: repairLog.ticket.assigned_to.first_name,
                lastName: repairLog.ticket.assigned_to.last_name,
            },
            room: repairLog.ticket.room
                ? {
                    id: repairLog.ticket.room.id,
                    roomName: repairLog.ticket.room.room_name,
                    buildingName: repairLog.ticket.room.building_name,
                    floorNumber: repairLog.ticket.room.floor_number,
                }
                : undefined,
            computer: repairLog.ticket.computer
                ? {
                    id: repairLog.ticket.computer.id,
                    computerCode: repairLog.ticket.computer.computer_code,
                }
                : repairLog.ticket.computer === null
                    ? null
                    : undefined,
        },
        repairLogCode: repairLog.repair_log_code,
        title: repairLog.title,
        repairNotes: repairLog.repair_notes,
        createdAt: repairLog.created_at,
    });

    const getRepairLogTechnicianId = (repairLog: ApiRepairLog) =>
        repairLog.technician ?? repairLog.ticket.assigned_to.id;

    const upsertRepairLog = (
        repairLogs: RepairLog[],
        apiRepairLog: ApiRepairLog
    ) => {
        const repairLog = mapRepairLog(apiRepairLog);
        const existingRepairLog = repairLogs.some((currentRepairLog) =>
            currentRepairLog.id === repairLog.id
        );

        if (!existingRepairLog) {
            return [repairLog, ...repairLogs];
        }

        return repairLogs.map((currentRepairLog) =>
            currentRepairLog.id === repairLog.id ? repairLog : currentRepairLog
        );
    };

    const canLoadRepairLogs = Number.isInteger(technicianId) && technicianId > 0;

    const { data: repairLogs = [], isPending } = useQuery<RepairLog[]>({
        queryKey: ["repairLogs", technicianId],
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<RepairLog[]>(["repairLogs", technicianId]) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<RepairLog[]>(["repairLogs", technicianId]) ?? [],
        enabled: canLoadRepairLogs,
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const isLoading = isPending || (canLoadRepairLogs && !hasInitialRepairLogs);

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            if (!canLoadRepairLogs) {
                return;
            }

            const accessToken = await getFreshAccessToken();

            if (!accessToken) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(REPAIR_LOGS_WS_ENDPOINT, { token: accessToken })
            );

            repairLogSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isRepairLogWebSocketMessage(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_repair_logs") {
                    const initialRepairLogs = parsedMessage.repair_log
                        .filter((repairLog) =>
                            getRepairLogTechnicianId(repairLog) === technicianId
                        )
                        .map(mapRepairLog);

                    setHasInitialRepairLogs(true);
                    queryClient.setQueryData(readyQueryKey, true);
                    queryClient.setQueryData<RepairLog[]>(
                        ["repairLogs", technicianId],
                        initialRepairLogs
                    );
                    return;
                }

                if (getRepairLogTechnicianId(parsedMessage.repair_log) !== technicianId) {
                    return;
                }

                queryClient.setQueryData<RepairLog[]>(
                    ["repairLogs", technicianId],
                    (currentRepairLogs = []) =>
                        upsertRepairLog(currentRepairLogs, parsedMessage.repair_log)
                );
            });
        }, 0);

        return () => {
            window.clearTimeout(connectSocket);
            socket?.close();

            if (repairLogSocketRef.current === socket) {
                repairLogSocketRef.current = null;
            }
        };
    }, [canLoadRepairLogs, queryClient, readyQueryKey, technicianId]);

    const selectedRepairLog = useMemo(
        () => repairLogs.find((repairLog) => repairLog.id === selectedRepairLogId) ?? null,
        [repairLogs, selectedRepairLogId]
    );

    const filteredRepairLogs = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return [...repairLogs]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            .filter((repairLog) => {
                const type = formatLabel(repairLog.ticket.type);
                const matchesType =
                    typeFilter === "All" || type === typeFilter;

                const searchableText = [
                    repairLog.repairLogCode,
                    repairLog.title,
                    repairLog.repairNotes,
                    type,
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    normalizedQuery === "" ||
                    searchableText.includes(normalizedQuery);

                return matchesType && matchesSearch;
            });
    }, [repairLogs, typeFilter, searchQuery]);

    const totalPages = Math.ceil(
        filteredRepairLogs.length / ITEMS_PER_PAGE
    );

    const maxPage = Math.max(totalPages, 1);
    const currentPage = pagination.filterKey === filterKey
        ? Math.min(pagination.page, maxPage)
        : 1;

    const goToPage = (page: number) => {
        setPagination({
            page: Math.min(Math.max(page, 1), maxPage),
            filterKey,
        });
    };

    const paginatedRepairLogs = filteredRepairLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 mb-3`}>
                {isLoading && (
                    <RepairLogSkeleton />
                )}

                {!isLoading && paginatedRepairLogs.length === 0 && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No repair logs found.
                    </p>
                )}

                {!isLoading && paginatedRepairLogs.map((repairLog) => {
                    return (
                        <div className="flex h-full w-full justify-center" key={repairLog.id}>
                            <RepairLogCard
                                repairLog={repairLog}
                                onClick={() => {
                                    setSelectedRepairLogId(repairLog.id);
                                    setSheetOpen(true);
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            <div className={`px-3 ${isMobile ? "mb-23" : "mb-10"}`}>
                {totalPages > 1 && (
                    <Pagination className={`flex ${isMobile ? "justify-center" : "justify-end"}`}>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => goToPage(currentPage - 1)}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem key={i + 1}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => goToPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => goToPage(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            <Sheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            >
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={
                        isMobile
                            ? "h-[90vh] overflow-hidden border-none"
                            : "w-[1000px]! overflow-hidden border-none"
                    }
                >
                    {selectedRepairLog && (
                        <RepairLogDetails
                            repairLog={selectedRepairLog}
                            closeSheet={() => setSheetOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
