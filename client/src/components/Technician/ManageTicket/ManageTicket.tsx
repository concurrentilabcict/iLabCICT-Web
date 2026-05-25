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
                const res = await privateFetch("https://ilabcict-backend.onrender.com/api/tickets/");

                const data = await res.json();

                if(!res.ok) {
                    console.error("Failed to fetch all tickets!");
                }

                setTickets(data);
                
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