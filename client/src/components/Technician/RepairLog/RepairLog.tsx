import RepairLogCard from "./RepairLogCard";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import RepairLogDetails from "./RepairLogDetails";
import { useQuery } from "@tanstack/react-query";
import { createApiError, privateFetch } from "@/lib/api";
import type { RepairLog } from "@/types/repairLog";
import { useMemo, useState } from "react";
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
        type: string;
        reported_by: {
            id: number;
            first_name: string;
            last_name: string;
        };
    };
    repair_log_code: string;
    title: string;
    repair_notes: string;
    created_at: string;
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

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [selectedRepairLogId, setSelectedRepairLogId] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const filterKey = JSON.stringify([typeFilter, searchQuery]);
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey,
    });

    const ITEMS_PER_PAGE = 10;

    const technicianId = localStorage.getItem("id");

    const mapRepairLog = (repairLog: ApiRepairLog): RepairLog => ({
        id: repairLog.id,
        ticket: {
            id: repairLog.ticket.id,
            type: repairLog.ticket.type,
            reportedBy: {
                id: repairLog.ticket.reported_by.id,
                firstName: repairLog.ticket.reported_by.first_name,
                lastName: repairLog.ticket.reported_by.last_name,
            },
        },
        repairLogCode: repairLog.repair_log_code,
        title: repairLog.title,
        repairNotes: repairLog.repair_notes,
        createdAt: repairLog.created_at,
    });

    const { data: repairLogs = [], isLoading } = useQuery<RepairLog[]>({
        queryKey: ["repairLogs"],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/repair-logs/?technician-id=${technicianId}`);

            const data = await res.json();
            
            if (!res.ok) {
                throw createApiError(res.status,
                    data.message || "Failed to fetch repair logs.");
            }

            return data.map(mapRepairLog);
        },
        // refetchInterval: 10000,
    });

    const selectedRepairLog = useMemo(
        () => repairLogs.find((repairLog) => repairLog.id === selectedRepairLogId) ?? null,
        [repairLogs, selectedRepairLogId]
    );

    const filteredRepairLogs = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return [...repairLogs]
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
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
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading repair logs...
                    </p>
                )}

                {!isLoading && paginatedRepairLogs.length === 0 && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No repair logs found.
                    </p>
                )}

                {!isLoading && paginatedRepairLogs.map((repairLog) => {
                    return (
                        <div className="w-full" key={repairLog.id}>
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
                            ? "h-[90vh]"
                            : "w-[1000px]!"
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
