import { createApiError, privateFetch } from "@/lib/api";
import NotificationCard from "./NotificationCard";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@/types/notification";

export default function Notification() {

    const mapNotification = (notification: any): Notification => ({
        id: notification.id,
        title: notification.title,
        header: notification.header,
        ticketType: notification.ticket_type,
        status: notification.status,
        createdAt: notification.created_at,
    });

    const userId = localStorage.getItem("id");

    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/notifications/user?user-id=${userId}`);

            const data = await res.json();

            console.log(data);

            if (!res.ok) {
                throw createApiError(res.status,
                    data.message || "Failed to fetch notifications.");
            }

            return data.map(mapNotification);
        },
        // refetchInterval: 10000,
    });

    return(
        <>
            <div className="flex flex-col py-3 gap-y-3">
                <NotificationCard />
                <NotificationCard />
                <NotificationCard />
            </div>
        </>
    );
}