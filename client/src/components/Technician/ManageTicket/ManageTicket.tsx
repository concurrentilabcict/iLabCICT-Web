import { useMediaQuery } from "@/hooks/useMediaQuery";
import ManageTicketCard from "./ManageTicketCard";
import { useEffect, useState } from "react";
import { privateFetch } from "@/lib/api";
import type { Tickets } from "@/types/ticket";

export default function ManageTicket() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    const [tickets, setTickets] = useState<Tickets[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);

            try {
                const ticketsRes = await privateFetch("https://ilabcict-backend.onrender.com/api/tickets/");
                const rawTickets = await ticketsRes.json();

                const formattedTickets: Tickets[] = await Promise.all(
                    rawTickets.map(async (ticket: any) => {

                        const [roomRes, computerRes, facultyRes] = await Promise.all([
                            fetch(`https://ilabcict-backend.onrender.com/api/rooms/${ticket.room}/`),
                            fetch(`https://ilabcict-backend.onrender.com/api/computers/${ticket.computer}/`),
                            fetch(`https://ilabcict-backend.onrender.com/api/users/${ticket.reported_by}/`)
                        ]);

                        const roomData = await roomRes.json();
                        const computerData = await computerRes.json();
                        const facultyData = await facultyRes.json();

                        const roomBuilding = roomData.building_name + ", " + roomData.room_name;
                        const facultyName = facultyData.first_name + " " + facultyData.last_name;

                        return {
                            id: ticket.id,
                            status: ticket.status,
                            type: ticket.type,
                            title: ticket.title,
                            complaintDescription: ticket.complaint_description,
                            reportedBy: facultyName,
                            ticketCode: ticket.ticket_code,

                            room: roomBuilding,
                            computer: computerData.computer_code,
                        };
                    })
                );
                
                console.log(formattedTickets);
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
                    return(
                        <div key={ticket.id}>
                            <ManageTicketCard />
                        </div>
                    );
                })}
            </div>
        </>
    );
}   