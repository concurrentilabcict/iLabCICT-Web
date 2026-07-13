import { useMediaQuery } from "@/hooks/useMediaQuery";
import ManageTicketCard from "./ManageTicketCard";
import { useMemo, useState } from "react";
import { createApiError, privateFetch, type ApiError } from "@/lib/api";
import type { ApiTicket, Ticket } from "@/types/ticket";

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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

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

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const notificationTicketId = searchParams.get("ticket");
    const queryClient = useQueryClient();
    const technicianId = Number(localStorage.getItem("id"));

    const handleTicketClick = (ticket: Ticket) => {
        if (ticket.status === "ongoing") {
            navigate(`/manage-ticket/${ticket.id}`);
            return;
        }

        setSelectedTicketId(ticket.id);
        setSheetOpen(true);
    };

    const mapTicket = (ticket: ApiTicket): Ticket => ({


        id: ticket.id,

        ticketCode: ticket.ticket_code,

        reportedBy: {
            id: ticket.reported_by.id,
            firstName: ticket.reported_by.first_name,
            lastName: ticket.reported_by.last_name,
        },

        assignedTo: ticket.assigned_to ? {
            id: ticket.assigned_to.id,
            firstName: ticket.assigned_to.first_name,
            lastName: ticket.assigned_to.last_name,
        } : { id: 0, firstName: "Unassigned", lastName: "" },

        room: {
            id: ticket.room.id,
            roomName: ticket.room.room_name,
            buildingName: ticket.room.building_name,
            floorNumber: ticket.room.floor_number,
        },

        computer: ticket.computer ? {
            id: ticket.computer.id,
            computerCode: ticket.computer.computer_code,
        } : { id: 0, computerCode: "Not specified" },

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
            const res = await privateFetch("https://ilabcict-backend.onrender.com/api/tickets/");

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status,
                    data.message || "Failed to fetch tickets.");
            }

            return (data as ApiTicket[]).map(mapTicket);
        },
        // refetchInterval: 10000,
    });

    const assignToMeMutation = useMutation({
        mutationFn: async (ticketId: number) => {
            if (!Number.isInteger(technicianId) || technicianId <= 0) {
                throw createApiError(400, "Unable to identify the logged-in technician.");
            }

            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/tickets/${ticketId}/`, {
                method: "PATCH",
                body: JSON.stringify({ assigned_to: technicianId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status, data.message || "Failed to assign ticket.");
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["tickets"],
            });

            toast.success("Ticket assigned to you.");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Failed to assign ticket.");
        },
    });

    const manuallySelectedTicket = useMemo(
        () => tickets.find((t) => t.id === selectedTicketId) ?? null,
        [tickets, selectedTicketId]
    );

    const notificationTicket = useMemo(() => {
        const ticketId = Number(notificationTicketId);

        if (!notificationTicketId || !Number.isInteger(ticketId)) {
            return null;
        }

        return tickets.find((ticket) => ticket.id === ticketId) ?? null;
    }, [notificationTicketId, tickets]);

    const selectedTicket = notificationTicket ?? manuallySelectedTicket;

    const filteredTickets = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return [...tickets]
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )
            .filter((ticket) => {
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
                    ticket.assignedTo.firstName,
                    ticket.assignedTo.lastName,
                    ticket.room.buildingName,
                    ticket.room.roomName,
                    ticket.computer.computerCode,
                    status,
                    type,
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    normalizedQuery === "" ||
                    searchableText.includes(normalizedQuery);

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

    if (notificationTicket?.status.toLowerCase() === "ongoing") {
        return <Navigate to={`/manage-ticket/${notificationTicket.id}`} replace />;
    }

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);

        if (!open && notificationTicketId) {
            setSearchParams({}, { replace: true });
        }
    };

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
                    const canAssignToMe = ticket.assignedTo.id === 0;

                    return (
                        <div className="w-full" key={ticket.id}>
                            <ManageTicketCard status={status} type={type} title={ticket.title}
                                complaintDescription={ticket.complaintDescription} reportedBy={reportedBy}
                                ticketCode={ticket.ticketCode} room={room} computerCode={ticket.computer.computerCode}
                                date={ticket.createdAt}
                                canAssignToMe={canAssignToMe}
                                isAssigning={assignToMeMutation.isPending && assignToMeMutation.variables === ticket.id}
                                onAssignToMe={() => assignToMeMutation.mutate(ticket.id)}
                                onClick={() => handleTicketClick(ticket)} />
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
                open={sheetOpen || Boolean(notificationTicket)}
                onOpenChange={handleSheetOpenChange}
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
                            isAssigning={assignToMeMutation.isPending && assignToMeMutation.variables === selectedTicket.id}
                            onAssignToMe={() => assignToMeMutation.mutate(selectedTicket.id)}
                            closeSheet={() => setSheetOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}   
