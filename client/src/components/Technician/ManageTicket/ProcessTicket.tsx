import { createApiError, privateFetch } from "@/lib/api";
import type { Ticket } from "@/types/ticket";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";


export default function ProcessTicket() {

    const { id } = useParams();

    const { data: ticket, isLoading, isError } = useQuery<Ticket>({
        queryKey: ["ticket", id],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/tickets/${id}`);

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status, data.message || "Failed to fetch ticket.");
            }

            return data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (isError || !ticket) {
        return <Navigate to="/manage-ticket" replace />;
    }

    if (ticket.status !== "ongoing") {
        return <Navigate to="/manage-ticket" replace />;
    }

    return (
        <>
            <div>
                <span>{id}</span>
            </div>
        </>
    );
}