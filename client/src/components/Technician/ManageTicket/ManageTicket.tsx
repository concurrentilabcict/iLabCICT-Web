import { useMediaQuery } from "@/hooks/useMediaQuery";
import ManageTicketCard from "./ManageTicketCard";
import { useMemo, useState } from "react";
import { createApiError, privateFetch } from "@/lib/api";
import type { Ticket } from "@/types/ticket";

import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import TicketDetails from "./TicketDetails";

import type {
    Status,
    StatusFilter,
    TicketType,
    TicketTypeFilter,
} from "@/utils/ticket";
import { useQuery } from "@tanstack/react-query";

type ManageTicketProps = {
    statusFilter: StatusFilter;
    typeFilter: TicketTypeFilter;
    searchQuery: string;
};

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export default function ManageTicket({
    statusFilter,
    typeFilter,
    searchQuery,
}: ManageTicketProps) {

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const filterKey = JSON.stringify([statusFilter, typeFilter, searchQuery]);
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey,
    });
    const ITEMS_PER_PAGE = 10;

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicketId(ticket.id);
        setSheetOpen(true);
    };

    const mapTicket = (ticket: any): Ticket => ({


        id: ticket.id,

        ticketCode: ticket.ticket_code,

        reportedBy: {
            id: ticket.reported_by.id,
            firstName: ticket.reported_by.first_name,
            lastName: ticket.reported_by.last_name,
        },

        assignedTo: {
            id: ticket.assigned_to.id,
            firstName: ticket.assigned_to.first_name,
            lastName: ticket.assigned_to.last_name,
        },

        room: {
            id: ticket.room.id,
            roomName: ticket.room.room_name,
            buildingName: ticket.room.building_name,
        },

        computer: {
            id: ticket.computer.id,
            computerCode: ticket.computer.computer_code,
        },

        type: ticket.type,
        title: ticket.title,

        complaintDescription: ticket.complaint_description,

        issueImage: ticket.issue_image,

        status: ticket.status,

        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
    });

    const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
        queryKey: ["tickets"],
        queryFn: async () => {
            console.log("token", localStorage.getItem("accessToken"));
            const res = await privateFetch("https://ilabcict-backend.onrender.com/api/tickets/");

            const data = await res.json();

            console.log(res.status);

            if (!res.ok) {
                throw createApiError(res.status,
                    data.message || "Failed to fetch tickets.");
            }

            return data.map(mapTicket);
        },
        // refetchInterval: 10000,
    });

    const selectedTicket = useMemo(
        () => tickets.find((t) => t.id === selectedTicketId) ?? null,
        [tickets, selectedTicketId]
    );

    const filteredTickets = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const status = formatLabel(ticket.status) as Status;
            const type = formatLabel(ticket.type) as TicketType;

            const matchesStatus =
                statusFilter === "All" || status === statusFilter;
            const matchesType =
                typeFilter === "All" || type === typeFilter;

            const searchableText = [
                ticket.ticketCode,
                ticket.title,
                ticket.complaintDescription,
                ticket.reportedBy.firstName,
                ticket.reportedBy.lastName,
                ticket.room.buildingName,
                ticket.room.roomName,
                ticket.computer.computerCode,
                status,
                type,
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                normalizedQuery === "" || searchableText.includes(normalizedQuery);

            return matchesStatus && matchesType && matchesSearch;
        });
    }, [tickets, statusFilter, typeFilter, searchQuery]);

    const totalPages = Math.ceil(
        filteredTickets.length / ITEMS_PER_PAGE
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

    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 mb-3`}>
                {isLoading && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading tickets...
                    </p>
                )}

                {!isLoading && paginatedTickets.length === 0 && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No tickets found.
                    </p>
                )}

                {!isLoading && paginatedTickets.map((ticket) => {

                    const status = formatLabel(ticket.status) as Status;
                    const type = formatLabel(ticket.type) as TicketType;
                    const room = formatLabel(ticket.room.buildingName) + ", " + ticket.room.roomName;
                    const reportedBy = ticket.reportedBy.firstName + " " + ticket.reportedBy.lastName;

                    return (
                        <div className="w-full" key={ticket.id}>
                            <ManageTicketCard status={status} type={type} title={ticket.title}
                                complaintDescription={ticket.complaintDescription} reportedBy={reportedBy}
                                ticketCode={ticket.ticketCode} room={room} computerCode={ticket.computer.computerCode}
                                date={ticket.createdAt} onClick={() => handleTicketClick(ticket)} />
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
                    {selectedTicket && (
                        <TicketDetails
                            ticket={selectedTicket}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}   
