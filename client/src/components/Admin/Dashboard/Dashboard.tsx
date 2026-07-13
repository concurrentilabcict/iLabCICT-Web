import {
    CircleCheckBig,
    Clock3,
    Inbox,
    Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import SummaryCard from "./SummaryCard";
import TicketChart from "./TicketChart";
import LaboratoryStatus from "./LaboratoryStatus";
import RecentTicket from "./RecentTicket";
import RecentUser from "./RecentUser";
import {
    fetchDashboardData,
    type DashboardData,
} from "./dashboardData";
import type { Ticket } from "@/types/ticket";

type TicketStatus = "open" | "ongoing" | "resolved";

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
    const { data, isLoading, isError } = useQuery<DashboardData>({
        queryKey: ["admin-dashboard"],
        queryFn: fetchDashboardData,
        staleTime: 60_000,
    });

    const tickets = data?.tickets ?? [];
    const rooms = data?.rooms ?? [];
    const users = data?.users ?? [];
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
                : {
                    change: "Awaiting action",
                    changeStatus: "neutral" as const,
                    caption: "",
                }),
            icon: Inbox,
        },
        {
            title: "Ongoing Repairs",
            value: isLoading || isError ? "—" : String(ongoingTickets.length),
            ...(isLoading || isError
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
            value: isLoading || isError ? "—" : String(resolvedThisMonth.length),
            ...(isLoading || isError
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
            value: isLoading || isError ? "—" : formatDuration(currentAverage),
            ...(isLoading || isError
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
                    <SummaryCard key={card.title} {...card} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,70fr)_minmax(280px,30fr)]">
                <TicketChart
                    tickets={tickets}
                    isLoading={isLoading}
                    isError={isError}
                />
                <LaboratoryStatus
                    rooms={rooms}
                    tickets={tickets}
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,55fr)_minmax(360px,45fr)]">
                <RecentTicket
                    tickets={tickets}
                    isLoading={isLoading}
                    isError={isError}
                />
                <RecentUser
                    users={users}
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>
        </div>
    );
}
