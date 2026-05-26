import { useMediaQuery } from "@/hooks/useMediaQuery";
import ManageTicketCard from "./ManageTicketCard";
import { useEffect, useMemo, useState } from "react";
import { privateFetch } from "@/lib/api";
import type { Ticket } from "@/types/ticket";

import type {
  Status,
  StatusFilter,
  TicketType,
  TicketTypeFilter,
} from "@/utils/ticket";

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

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);

            try {
                const res = await privateFetch("https://ilabcict-backend.onrender.com/api/tickets/");

                const data = await res.json();

                if (!res.ok) {
                    console.error("Failed to fetch all tickets!");
                }

                const formattedTickets = data.map(mapTicket);

                setTickets(formattedTickets);

            } catch (err) {
                console.error("Failed to fetch tickets: ", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTickets();
    }, []);

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

    return (
        <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 ${isMobile ? "mb-23" : "mb-10"}`}>
                {isLoading && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading tickets...
                    </p>
                )}

                {!isLoading && filteredTickets.length === 0 && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No tickets found.
                    </p>
                )}

                {!isLoading && filteredTickets.map((ticket) => {

                    const status = formatLabel(ticket.status) as Status;
                    const type = formatLabel(ticket.type) as TicketType;
                    const room = formatLabel(ticket.room.buildingName) + ", " + ticket.room.roomName;
                    const reportedBy = ticket.reportedBy.firstName + " " + ticket.reportedBy.lastName;

                    return (
                        <div className="w-full" key={ticket.id}>
                            <ManageTicketCard status={status} type={type} title={ticket.title}
                                complaintDescription={ticket.complaintDescription} reportedBy={reportedBy}
                                ticketCode={ticket.ticketCode} room={room} computerCode={ticket.computer.computerCode} />
                        </div>
                    );
                })}
            </div>
        </>
    );
}   
