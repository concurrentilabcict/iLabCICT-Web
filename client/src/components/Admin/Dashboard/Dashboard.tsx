import {
    CircleCheckBig,
    Clock3,
    Inbox,
    Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import SummaryCard from "./SummaryCard";
import TicketChart from "./TicketChart";
import LaboratoryStatus from "./LaboratoryStatus";
import RecentTicket from "./RecentTicket";
import RecentUser from "./RecentUser";
import {
    fetchDashboardUsers,
    mapDashboardRoom,
    mapDashboardTicket,
    type ApiRoom,
} from "./dashboardData";
import { buildWebSocketUrl, getFreshAccessToken } from "@/lib/api";
import type { User } from "@/types/manageUser";
import type { Room } from "@/types/room";
import type { ApiTicket, Ticket } from "@/types/ticket";

type TicketStatus = "open" | "ongoing" | "resolved";
type DashboardTicketEvent =
    | {
        event: "initial_tickets";
        ticket: ApiTicket[];
        next?: string | null;
    }
    | {
        event: "ticket_created" | "ticket_updated" | "ticket_reassigned";
        ticket: ApiTicket;
    };
type DashboardRoomEvent =
    | {
        event: "initial_rooms";
        room?: ApiRoom[];
        rooms?: ApiRoom[];
        next?: string | null;
    }
    | {
        event: "room_created" | "room_updated" | "room_deleted";
        room: ApiRoom;
};

const DASHBOARD_TICKETS_QUERY_KEY = ["admin-dashboard-tickets"] as const;
const DASHBOARD_TICKETS_READY_QUERY_KEY = [
    "admin-dashboard-tickets-ready",
] as const;
const DASHBOARD_ROOMS_QUERY_KEY = ["admin-dashboard-rooms"] as const;
const DASHBOARD_ROOMS_READY_QUERY_KEY = [
    "admin-dashboard-rooms-ready",
] as const;
const DASHBOARD_TICKETS_WS_ENDPOINT = "/ws/tickets/";
const DASHBOARD_ROOMS_WS_ENDPOINT = "/ws/rooms/";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isDashboardTicketEvent = (
    value: unknown
): value is DashboardTicketEvent => {
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

const isDashboardRoomEvent = (value: unknown): value is DashboardRoomEvent => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_rooms") {
        return Array.isArray(value.room) || Array.isArray(value.rooms);
    }

    return (
            ["room_created", "room_updated", "room_deleted"].includes(value.event) &&
        isRecord(value.room)
    );
};

const upsertTicket = (tickets: Ticket[], apiTicket: ApiTicket) => {
    const ticket = mapDashboardTicket(apiTicket);
    const hasTicket = tickets.some((currentTicket) =>
        currentTicket.id === ticket.id
    );

    if (!hasTicket) {
        return [ticket, ...tickets];
    }

    return tickets.map((currentTicket) =>
        currentTicket.id === ticket.id ? ticket : currentTicket
    );
};

const upsertRoom = (rooms: Room[], apiRoom: ApiRoom) => {
    const room = mapDashboardRoom(apiRoom);
    const hasRoom = rooms.some((currentRoom) => currentRoom.id === room.id);

    if (!hasRoom) {
        return [room, ...rooms];
    }

    return rooms.map((currentRoom) =>
        currentRoom.id === room.id ? room : currentRoom
    );
};

function ticketsInMonth(
    tickets: Ticket[],
    field: "createdAt" | "updatedAt",
    monthOffset: number
) {
    const today = new Date();
    const start = new Date(
        today.getFullYear(),
        today.getMonth() + monthOffset,
        1
    );
    const end = new Date(
        today.getFullYear(),
        today.getMonth() + monthOffset + 1,
        1
    );

    return tickets.filter((ticket) => {
        const date = new Date(ticket[field]);
        return date >= start && date < end;
    });
}

function averageResolutionMs(tickets: Ticket[]) {
    const durations = tickets
        .map((ticket) => (
            Date.parse(ticket.updatedAt) - Date.parse(ticket.createdAt)
        ))
        .filter((duration) => Number.isFinite(duration) && duration >= 0);

    if (durations.length === 0) return null;

    return durations.reduce((total, duration) => total + duration, 0)
        / durations.length;
}

function formatDuration(duration: number | null) {
    if (duration === null) return "—";

    const totalMinutes = Math.round(duration / 60_000);
    const days = Math.floor(totalMinutes / 1_440);
    const hours = Math.floor((totalMinutes % 1_440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export default function Dashboard() {
    const queryClient = useQueryClient();
    const ticketSocketRef = useRef<WebSocket | null>(null);
    const roomSocketRef = useRef<WebSocket | null>(null);
    const cachedTicketsAreReady =
        queryClient.getQueryData<boolean>(DASHBOARD_TICKETS_READY_QUERY_KEY) === true;
    const cachedRoomsAreReady =
        queryClient.getQueryData<boolean>(DASHBOARD_ROOMS_READY_QUERY_KEY) === true;
    const [hasInitialTickets, setHasInitialTickets] =
        useState(cachedTicketsAreReady);
    const [hasInitialRooms, setHasInitialRooms] =
        useState(cachedRoomsAreReady);
    const {
        data: tickets = [],
        isPending: isTicketsPending,
        isError: isTicketsError,
    } = useQuery<Ticket[]>({
        queryKey: DASHBOARD_TICKETS_QUERY_KEY,
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<Ticket[]>(DASHBOARD_TICKETS_QUERY_KEY) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<Ticket[]>(DASHBOARD_TICKETS_QUERY_KEY) ?? [],
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const {
        data: rooms = [],
        isPending: isRoomsPending,
        isError: isRoomsError,
    } = useQuery<Room[]>({
        queryKey: DASHBOARD_ROOMS_QUERY_KEY,
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<Room[]>(DASHBOARD_ROOMS_QUERY_KEY) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<Room[]>(DASHBOARD_ROOMS_QUERY_KEY) ?? [],
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const {
        data: users = [],
        isLoading: isUsersLoading,
        isError: isUsersError,
    } = useQuery<User[]>({
        queryKey: ["admin-dashboard-users"],
        queryFn: fetchDashboardUsers,
        staleTime: 60_000,
    });

    const isTicketsLoading = isTicketsPending || !hasInitialTickets;
    const isRoomsLoading = isRoomsPending || !hasInitialRooms;
    const isDashboardLoading =
        isTicketsLoading || isRoomsLoading || isUsersLoading;
    const isDashboardError = isTicketsError || isRoomsError || isUsersError;

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            const accessToken = await getFreshAccessToken();

            if (!accessToken) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(DASHBOARD_TICKETS_WS_ENDPOINT, {
                    token: accessToken,
                })
            );

            ticketSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isDashboardTicketEvent(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_tickets") {
                    setHasInitialTickets(true);
                    queryClient.setQueryData(
                        DASHBOARD_TICKETS_READY_QUERY_KEY,
                        true
                    );
                    queryClient.setQueryData<Ticket[]>(
                        DASHBOARD_TICKETS_QUERY_KEY,
                        parsedMessage.ticket.map(mapDashboardTicket)
                    );
                    return;
                }

                queryClient.setQueryData<Ticket[]>(
                    DASHBOARD_TICKETS_QUERY_KEY,
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
    }, [queryClient]);

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            const accessToken = await getFreshAccessToken();
            
            if (!accessToken) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(DASHBOARD_ROOMS_WS_ENDPOINT, {
                    token: accessToken,
                })
            );

            roomSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isDashboardRoomEvent(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_rooms") {
                    const initialRooms = parsedMessage.room ?? parsedMessage.rooms ?? [];
                    setHasInitialRooms(true);
                    queryClient.setQueryData(
                        DASHBOARD_ROOMS_READY_QUERY_KEY,
                        true
                    );
                    queryClient.setQueryData<Room[]>(
                        DASHBOARD_ROOMS_QUERY_KEY,
                        initialRooms.map(mapDashboardRoom)
                    );
                    return;
                }

                if (parsedMessage.event === "room_deleted") {
                    queryClient.setQueryData<Room[]>(
                        DASHBOARD_ROOMS_QUERY_KEY,
                        (currentRooms = []) =>
                            currentRooms.filter((room) => room.id !== parsedMessage.room.id)
                    );
                    return;
                }

                queryClient.setQueryData<Room[]>(
                    DASHBOARD_ROOMS_QUERY_KEY,
                    (currentRooms = []) =>
                        upsertRoom(currentRooms, parsedMessage.room)
                );
            });
        }, 0);

        return () => {
            window.clearTimeout(connectSocket);
            socket?.close();

            if (roomSocketRef.current === socket) {
                roomSocketRef.current = null;
            }
        };
    }, [queryClient]);

    const ticketsByStatus = tickets.reduce<Record<TicketStatus, Ticket[]>>(
        (groupedTickets, ticket) => {
            const status = ticket.status.trim().toLowerCase() as TicketStatus;

            if (status in groupedTickets) {
                groupedTickets[status].push(ticket);
            }

            return groupedTickets;
        },
        { open: [], ongoing: [], resolved: [] }
    );
    const openTickets = ticketsByStatus.open;
    const ongoingTickets = ticketsByStatus.ongoing;
    const resolvedTickets = ticketsByStatus.resolved;

    const resolvedThisMonth = ticketsInMonth(resolvedTickets, "updatedAt", 0);
    const resolvedLastMonth = ticketsInMonth(resolvedTickets, "updatedAt", -1);

    const currentAverage = averageResolutionMs(resolvedThisMonth);

    const unavailable = {
        change: isDashboardLoading ? "Loading" : "Unavailable",
        changeStatus: "neutral" as const,
        caption: "",
    };

    const summaryCards = [
        {
            title: "Open Tickets",
            value: isDashboardLoading || isDashboardError ? "—" : String(openTickets.length),
            ...(isDashboardLoading || isDashboardError
                ? unavailable
                : {
                    change: "Awaiting action",
                    changeStatus: "neutral" as const,
                    caption: "",
                }),
            icon: Inbox,
        },
        {
            title: "Ongoing Repairs",
            value: isDashboardLoading || isDashboardError ? "—" : String(ongoingTickets.length),
            ...(isDashboardLoading || isDashboardError
                ? unavailable
                : {
                    change: "Currently in progress",
                    changeStatus: "neutral" as const,
                    caption: "",
                }),
            icon: Wrench,
        },
        {
            title: "Resolved This Month",
            value: isDashboardLoading || isDashboardError ? "—" : String(resolvedThisMonth.length),
            ...(isDashboardLoading || isDashboardError
                ? unavailable
                : {
                    change: String(resolvedLastMonth.length),
                    changeStatus: "neutral" as const,
                    caption: "resolved last month",
                }),
            icon: CircleCheckBig,
        },
        {
            title: "Est. Resolution Time",
            value: isDashboardLoading || isDashboardError ? "—" : formatDuration(currentAverage),
            ...(isDashboardLoading || isDashboardError
                ? unavailable
                : {
                    change: currentAverage === null
                        ? "No resolved tickets this month"
                        : "Based on latest ticket update",
                    changeStatus: "neutral" as const,
                    caption: "",
                }),
            icon: Clock3,
        },
    ];

    return(
        <div className="space-y-3 py-3">
            <div className="grid grid-cols-4 gap-3">
                {summaryCards.map((card) => (
                    <SummaryCard
                        key={card.title}
                        {...card}
                        isLoading={isDashboardLoading}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,70fr)_minmax(280px,30fr)]">
                <TicketChart
                    tickets={tickets}
                    isLoading={isDashboardLoading}
                    isError={isDashboardError}
                />
                <LaboratoryStatus
                    rooms={rooms}
                    tickets={tickets}
                    isLoading={isDashboardLoading}
                    isError={isDashboardError}
                />
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,55fr)_minmax(360px,45fr)]">
                <RecentTicket
                    tickets={tickets}
                    isLoading={isDashboardLoading}
                    isError={isDashboardError}
                />
                <RecentUser
                    users={users}
                    isLoading={isDashboardLoading}
                    isError={isDashboardError}
                />
            </div>
        </div>
    );
}
