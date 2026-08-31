import { useMediaQuery } from "@/hooks/useMediaQuery";
import ManageTicketCard from "./ManageTicketCard";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    buildWebSocketUrl,
    buildApiUrl,
    createApiError,
    getFreshAccessToken,
    privateFetch,
} from "@/lib/api";
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
import { appToast } from "@/utils/appToast";

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

type TicketWebSocketMessage =
    | {
        event: "initial_tickets";
        ticket: ApiTicket[];
        next?: string | null;
    }
    | {
        event: "ticket_created" | "ticket_updated" | "ticket_reassigned";
        ticket: ApiTicket;
    };

const TICKETS_QUERY_KEY = ["technician-tickets"] as const;
const TICKETS_READY_QUERY_KEY = ["technician-tickets-ready"] as const;
const TICKETS_WS_ENDPOINT = "/ws/tickets/";

const ticketStatusOrder: Record<string, number> = {
    open: 0,
    ongoing: 1,
    resolved: 2,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isTicketWebSocketMessage = (
    value: unknown
): value is TicketWebSocketMessage => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_tickets") {
        return Array.isArray(value.ticket);
    }

    return (
        ["ticket_created", "ticket_updated", "ticket_reassigned"].includes(
            value.event
        ) && isRecord(value.ticket)
    );
};

const mapTicket = (ticket: ApiTicket): Ticket => ({
    id: ticket.id,
    ticketCode: ticket.ticket_code,
    reportedBy: {
        id: ticket.reported_by.id,
        firstName: ticket.reported_by.first_name,
        lastName: ticket.reported_by.last_name,
    },
    assignedTo: ticket.assigned_to
        ? {
            id: ticket.assigned_to.id,
            firstName: ticket.assigned_to.first_name,
            lastName: ticket.assigned_to.last_name,
        }
        : { id: 0, firstName: "Unassigned", lastName: "" },
    room: {
        id: ticket.room.id,
        roomName: ticket.room.room_name,
        buildingName: ticket.room.building_name,
        floorNumber: ticket.room.floor_number,
    },
    computer: ticket.computer
        ? {
            id: ticket.computer.id,
            computerCode: ticket.computer.computer_code,
        }
        : { id: 0, computerCode: "Not specified" },
    type: ticket.type,
    title: ticket.title,
    complaintDescription: ticket.complaint_description,
    issueImage: ticket.issue_image,
    status: ticket.status,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
});

const sortTickets = (firstTicket: Ticket, secondTicket: Ticket) => {
    const statusDifference =
        (ticketStatusOrder[firstTicket.status.toLowerCase()] ?? 3) -
        (ticketStatusOrder[secondTicket.status.toLowerCase()] ?? 3);

    return statusDifference !== 0
        ? statusDifference
        : Date.parse(secondTicket.createdAt) - Date.parse(firstTicket.createdAt);
};

const upsertTicket = (tickets: Ticket[], apiTicket: ApiTicket) => {
    const ticket = mapTicket(apiTicket);
    const ticketExists = tickets.some(
        (currentTicket) => currentTicket.id === ticket.id
    );

    if (!ticketExists) {
        return [ticket, ...tickets];
    }

    return tickets.map((currentTicket) =>
        currentTicket.id === ticket.id ? ticket : currentTicket
    );
};

export default function ManageTicket({
    statusFilter,
    typeFilter,
    searchQuery,
}: ManageTicketProps) {

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const ticketSocketRef = useRef<WebSocket | null>(null);

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
    const cachedTicketsAreReady =
        queryClient.getQueryData<boolean>(TICKETS_READY_QUERY_KEY) === true;
    const [hasInitialTickets, setHasInitialTickets] =
        useState(cachedTicketsAreReady);

    const handleTicketClick = (ticket: Ticket) => {
        if (ticket.status === "ongoing") {
            if (ticket.type === "report") {
                navigate(`/manage-ticket/${ticket.id}`);
            }
            return;
        }

        setSelectedTicketId(ticket.id);
        setSheetOpen(true);
    };

    const { data: tickets = [], isPending } = useQuery<Ticket[]>({
        queryKey: TICKETS_QUERY_KEY,
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<Ticket[]>(TICKETS_QUERY_KEY) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<Ticket[]>(TICKETS_QUERY_KEY) ?? [],
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const isLoading = isPending || !hasInitialTickets;

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            const accessToken = await getFreshAccessToken();

            if (!accessToken) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(TICKETS_WS_ENDPOINT, { token: accessToken })
            );

            ticketSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isTicketWebSocketMessage(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_tickets") {
                    setHasInitialTickets(true);
                    queryClient.setQueryData(TICKETS_READY_QUERY_KEY, true);
                    queryClient.setQueryData<Ticket[]>(
                        TICKETS_QUERY_KEY,
                        parsedMessage.ticket.map(mapTicket)
                    );
                    return;
                }

                if (
                    parsedMessage.event === "ticket_reassigned" &&
                    parsedMessage.ticket.assigned_to?.id !== technicianId
                ) {
                    queryClient.setQueryData<Ticket[]>(
                        TICKETS_QUERY_KEY,
                        (currentTickets = []) =>
                            currentTickets.filter(
                                (ticket) => ticket.id !== parsedMessage.ticket.id
                            )
                    );
                    return;
                }

                queryClient.setQueryData<Ticket[]>(
                    TICKETS_QUERY_KEY,
                    (currentTickets = []) =>
                        upsertTicket(currentTickets, parsedMessage.ticket)
                );
            });
        }, 0);

        return () => {
            window.clearTimeout(connectSocket);
            socket?.close();

            if (ticketSocketRef.current === socket) {
                ticketSocketRef.current = null;
            }
        };
    }, [queryClient, technicianId]);

    const assignToMeMutation = useMutation({
        mutationFn: async (ticketId: number) => {
            if (!Number.isInteger(technicianId) || technicianId <= 0) {
                throw createApiError(400, "Unable to identify the logged-in technician.");
            }

            const res = await privateFetch(buildApiUrl(`/api/tickets/${ticketId}/`), {
                method: "PATCH",
                body: JSON.stringify({
                    assigned_to: technicianId,
                    status: "ongoing",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status, data.message || "Failed to assign ticket.");
            }
        },
        onSuccess: (_data, ticketId) => {
            queryClient.setQueryData<Ticket[]>(
                TICKETS_QUERY_KEY,
                (currentTickets = []) =>
                    currentTickets.map((ticket) =>
                        ticket.id === ticketId
                            ? {
                                ...ticket,
                                status: "ongoing",
                                assignedTo: {
                                    id: technicianId,
                                    firstName:
                                        ticket.assignedTo?.firstName ?? "Assigned",
                                    lastName: ticket.assignedTo?.lastName ?? "",
                                    profileImage: ticket.assignedTo?.profileImage,
                                },
                            }
                            : ticket
                    )
            );

            appToast.success("You're now assigned to this ticket.");
        },
        onError: () => {
            appToast.error("We couldn't assign the ticket. Please try again.");
        },
    });

    const resolveRequestMutation = useMutation({
        mutationFn: async (ticketId: number) => {
            const res = await privateFetch(buildApiUrl(`/api/tickets/${ticketId}/`), {
                method: "PATCH",
                body: JSON.stringify({ status: "resolved" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status, data.message || "Failed to resolve ticket.");
            }
        },
        onSuccess: (_data, ticketId) => {
            queryClient.setQueryData<Ticket[]>(
                TICKETS_QUERY_KEY,
                (currentTickets = []) =>
                    currentTickets.map((ticket) =>
                        ticket.id === ticketId
                            ? { ...ticket, status: "resolved" }
                            : ticket
                    )
            );

            appToast.success("Ticket resolved successfully.");
        },
        onError: () => {
            appToast.error("We couldn't resolve the ticket. Please try again.");
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
            .sort(sortTickets)
            .filter((ticket) => {
                const status = formatLabel(ticket.status) as Status;
                const type = formatLabel(ticket.type) as TicketType;

                const isAssigned = (ticket.assignedTo?.id ?? 0) > 0;
                const matchesStatus =
                    statusFilter === "All" ||
                    (statusFilter === "Assigned" ? isAssigned : status === statusFilter);
                const matchesType =
                    typeFilter === "All" || type === typeFilter;

                const searchableText = [
                    ticket.ticketCode,
                    ticket.title,
                    ticket.complaintDescription,
                    ticket.reportedBy.firstName,
                    ticket.reportedBy.lastName,
                    ticket.assignedTo?.firstName,
                    ticket.assignedTo?.lastName,
                    ticket.room.buildingName,
                    ticket.room.roomName,
                    ticket.computer?.computerCode,
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

    if (
        notificationTicket?.status.toLowerCase() === "ongoing" &&
        notificationTicket.type === "report"
    ) {
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
                    const reportedBy = ticket.reportedBy.firstName + " " + ticket.reportedBy.lastName;
                    const assignedTo = `${ticket.assignedTo?.firstName ?? ""} ${ticket.assignedTo?.lastName ?? ""}`.trim();
                    const canAssignToMe = ticket.assignedTo?.id !== technicianId;
                    const canResolveRequest = ticket.status === "ongoing" && ticket.type === "request";

                    return (
                        <div className="flex h-full w-full justify-center" key={ticket.id}>
                            <ManageTicketCard status={status} type={type} title={ticket.title}
                                complaintDescription={ticket.complaintDescription} reportedBy={reportedBy}
                                ticketCode={ticket.ticketCode}
                                roomName={ticket.room.roomName}
                                buildingName={formatLabel(ticket.room.buildingName)}
                                floorNumber={ticket.room.floorNumber}
                                computerCode={ticket.computer?.computerCode || "Not Specified"}
                                assignedTechnician={assignedTo || "Unassigned"}
                                isAssignedToCurrentUser={ticket.assignedTo?.id === technicianId}
                                isAssignedToAnother={(ticket.assignedTo?.id ?? 0) > 0 && ticket.assignedTo?.id !== technicianId}
                                date={ticket.createdAt}
                                canAssignToMe={canAssignToMe}
                                isAssigning={assignToMeMutation.isPending && assignToMeMutation.variables === ticket.id}
                                onAssignToMe={() => assignToMeMutation.mutate(ticket.id)}
                                canResolveRequest={canResolveRequest}
                                isResolvingRequest={resolveRequestMutation.isPending && resolveRequestMutation.variables === ticket.id}
                                onResolveRequest={() => resolveRequestMutation.mutate(ticket.id)}
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
