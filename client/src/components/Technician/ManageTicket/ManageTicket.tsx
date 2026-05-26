import { useMediaQuery } from "@/hooks/useMediaQuery";
import ManageTicketCard from "./ManageTicketCard";
import { useEffect, useState } from "react";
import { privateFetch } from "@/lib/api";
import type { Ticket } from "@/types/ticket";
import { capitalize } from "@/utils/string";

import type {
  Status,
  TicketType,
} from "@/utils/ticket";

export default function ManageTicket() {

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

    return (
        <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 ${isMobile ? "mb-23" : "mb-10"}`}>
                {tickets.map((ticket) => {

                    const room = capitalize(ticket.room.buildingName) + ", " + ticket.room.roomName;
                    const reportedBy = ticket.reportedBy.firstName + " " + ticket.reportedBy.lastName;

                    return (
                        <div key={ticket.id}>
                            <ManageTicketCard status={capitalize(ticket.status) as Status} type={capitalize(ticket.type) as TicketType} title={ticket.title}
                                complaintDescription={ticket.complaintDescription} reportedBy={reportedBy}
                                ticketCode={ticket.ticketCode} room={room} computerCode={ticket.computer.computerCode} />
                        </div>
                    );
                })}
            </div>
        </>
    );
}   