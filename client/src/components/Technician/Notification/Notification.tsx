import { createApiError, privateFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@/types/notification";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileNotification from "./MobileNotification";
import { mapNotification, sortNotificationsByNewest } from "@/utils/notification";

export default function Notification() {
    const userId = localStorage.getItem("id");
    const isMobile = useMediaQuery("(max-width: 767px)");

    const { data: notifications = [], isLoading, isError } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/notifications/user?user-id=${userId}`);

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status,
                    data.message || "Failed to fetch notifications.");
            }

            const notificationList = Array.isArray(data) ? data : data.notifications;

            return sortNotificationsByNewest(notificationList.map(mapNotification));
        },
        // refetchInterval: 10000,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col py-3 gap-y-3">
                <p className="px-3 text-sm secondary-text-color">Loading notifications...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col py-3 gap-y-3">
                <p className="px-3 text-sm text-red-600">Failed to load notifications.</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col py-3 gap-y-3">
                <p className="px-3 text-sm secondary-text-color">No notifications yet.</p>
            </div>
        );
    }

    return (
        <>
            {isMobile ? <MobileNotification notifications={notifications} /> : null}
        </>
    );
}
