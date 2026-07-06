import {
    CircleCheckBig,
    Clock3,
    Inbox,
    Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { createApiError, privateFetch } from "@/lib/api";
import SummaryCard from "./SummaryCard";

type TicketStatus = "open" | "ongoing" | "resolved";

type ApiTicket = {
    id: number;
    created_at: string;
    updated_at: string;
};

type DashboardTickets = Record<TicketStatus, ApiTicket[]>;

const TICKETS_URL = "https://ilabcict-backend.onrender.com/api/tickets/";

async function fetchTickets(status: TicketStatus) {
    const response = await privateFetch(`${TICKETS_URL}?status=${status}`);
    const data = await response.json();

    if (!response.ok) {
        throw createApiError(
            response.status,
            data.message || `Failed to fetch ${status} tickets.`
        );
    }

    return data as ApiTicket[];
}

function ticketsInMonth(
    tickets: ApiTicket[],
    field: "created_at" | "updated_at",
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

function averageResolutionMs(tickets: ApiTicket[]) {
    const durations = tickets
        .map((ticket) => (
            Date.parse(ticket.updated_at) - Date.parse(ticket.created_at)
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

function getChange(
    current: number,
    previous: number,
    increaseIsGood: boolean
) {
    if (previous === 0) {
        if (current === 0) {
            return { change: "0%", changeStatus: "neutral" as const };
        }

        return {
            change: "New",
            changeStatus: increaseIsGood ? "good" as const : "bad" as const,
        };
    }

    const percentage = ((current - previous) / previous) * 100;
    const roundedPercentage = Math.round(percentage);
    const improved = increaseIsGood ? percentage >= 0 : percentage <= 0;

    return {
        change: `${roundedPercentage > 0 ? "+" : ""}${roundedPercentage}%`,
        changeStatus: improved ? "good" as const : "bad" as const,
    };
}

export default function Dashboard() {
    const { data, isLoading, isError } = useQuery<DashboardTickets>({
        queryKey: ["admin-dashboard-tickets"],
        queryFn: async () => {
            const [open, ongoing, resolved] = await Promise.all([
                fetchTickets("open"),
                fetchTickets("ongoing"),
                fetchTickets("resolved"),
            ]);

            return { open, ongoing, resolved };
        },
        staleTime: 60_000,
    });

    const openTickets = data?.open ?? [];
    const ongoingTickets = data?.ongoing ?? [];
    const resolvedTickets = data?.resolved ?? [];

    const openThisMonth = ticketsInMonth(openTickets, "created_at", 0).length;
    const openLastMonth = ticketsInMonth(openTickets, "created_at", -1).length;
    const ongoingThisMonth = ticketsInMonth(ongoingTickets, "created_at", 0).length;
    const ongoingLastMonth = ticketsInMonth(ongoingTickets, "created_at", -1).length;
    const resolvedThisMonth = ticketsInMonth(resolvedTickets, "updated_at", 0);
    const resolvedLastMonth = ticketsInMonth(resolvedTickets, "updated_at", -1);

    const currentAverage = averageResolutionMs(resolvedThisMonth);
    const previousAverage = averageResolutionMs(resolvedLastMonth);

    const unavailable = {
        change: isLoading ? "Loading" : "Unavailable",
        changeStatus: "neutral" as const,
        caption: "",
    };

    const summaryCards = [
        {
            title: "Open Tickets",
            value: isLoading || isError ? "—" : String(openTickets.length),
            ...(isLoading || isError
                ? unavailable
                : getChange(openThisMonth, openLastMonth, false)),
            icon: Inbox,
        },
        {
            title: "Ongoing Repairs",
            value: isLoading || isError ? "—" : String(ongoingTickets.length),
            ...(isLoading || isError
                ? unavailable
                : getChange(ongoingThisMonth, ongoingLastMonth, false)),
            icon: Wrench,
        },
        {
            title: "Resolved This Month",
            value: isLoading || isError ? "—" : String(resolvedThisMonth.length),
            ...(isLoading || isError
                ? unavailable
                : getChange(
                    resolvedThisMonth.length,
                    resolvedLastMonth.length,
                    true
                )),
            icon: CircleCheckBig,
        },
        {
            title: "Avg. Resolution Time",
            value: isLoading || isError ? "—" : formatDuration(currentAverage),
            ...(isLoading || isError
                ? unavailable
                : currentAverage === null || previousAverage === null
                    ? {
                        change: "No prior data",
                        changeStatus: "neutral" as const,
                        caption: "",
                    }
                    : getChange(currentAverage, previousAverage, false)),
            icon: Clock3,
        },
    ];

    return(
        <div className="grid grid-cols-4 gap-3">
            {summaryCards.map((card) => (
                <SummaryCard key={card.title} {...card} />
            ))}
        </div>
    );
}
