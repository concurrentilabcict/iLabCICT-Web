
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createApiError, privateFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import type { Notification } from "@/types/notification";
import MobileNotification from "./MobileNotification";

const mapNotification = (notification: any): Notification => ({
    id: notification.id,
    title: notification.title,
    header: notification.header,
    ticketType: notification.ticket_type,
    status: notification.status,
    createdAt: notification.created_at,
});

export default function DesktopNotification() {
    const userId = localStorage.getItem("id");

    const { data: notifications = [], isLoading, isError } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/notifications/user?user-id=${userId}`);
            const data = await res.json();

            if (!res.ok) {
                throw createApiError(
                    res.status,
                    data.message || "Failed to fetch notifications."
                );
            }

            const notificationList = Array.isArray(data) ? data : data.notifications;

            return notificationList.map(mapNotification);
        },
        enabled: Boolean(userId),
    });

    const unreadCount = notifications.filter(
        (notification) => notification.status.toLowerCase() === "unread"
    ).length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="relative"
                    aria-label="Open notifications"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-0 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium leading-none text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[420px]! gap-0 p-0 sm:max-w-none">
                <SheetHeader className="border-b border-b-[#e5e5e5] px-4 py-4">
                    <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {isLoading && (
                        <p className="px-3 py-4 text-sm secondary-text-color">
                            Loading notifications...
                        </p>
                    )}

                    {isError && (
                        <p className="px-3 py-4 text-sm text-red-600">
                            Failed to load notifications.
                        </p>
                    )}

                    {!isLoading && !isError && notifications.length === 0 && (
                        <p className="px-3 py-4 text-sm secondary-text-color">
                            No notifications yet.
                        </p>
                    )}

                    {!isLoading && !isError && notifications.length > 0 && (
                        <MobileNotification notifications={notifications} />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
