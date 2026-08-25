import type { Notification } from "@/types/notification";
import NotificationCard from "./NotificationCard";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl, privateFetch } from "@/lib/api";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotifications";

type MobileNotificationProps = {
    notifications: Notification[];
}

type NotificationFilter = "All" | "Unread" | "Read";

const notificationFilters: NotificationFilter[] = ["All", "Read", "Unread"];

export default function MobileNotification({ notifications }: MobileNotificationProps) {
    const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>("All");
    const navigate = useNavigate();

    const filteredNotifications = useMemo(() => {
        if (selectedFilter === "All") {
            return notifications;
        }

        return notifications.filter((notification) => {
            const status = notification.status.toLowerCase();

            return selectedFilter === "Unread"
                ? status === "unread"
                : status === "read";
        });
    }, [notifications, selectedFilter]);

    const queryClient = useQueryClient();

    const changeStatusMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await privateFetch(buildApiUrl(`/api/notifications/${id}/`), {
                method: "PATCH",
                body: JSON.stringify({ status: "read" }),
            });

            if (!res.ok) {
                throw new Error("Failed to update notification status");
            }
        },
        onSuccess: (_data, id) => {
            const notificationId = Number(id);

            queryClient.setQueryData<Notification[]>(
                NOTIFICATIONS_QUERY_KEY,
                (currentNotifications = []) =>
                    currentNotifications.map((notification) =>
                        notification.id === notificationId
                            ? { ...notification, status: "read" }
                            : notification
                    )
            );
        }
    });

    return (
        <>
            <div className="flex flex-col py-3">
                <div className="flex gap-3 overflow-x-auto px-3 pb-3">
                    {notificationFilters.map((filter) => {
                        const isSelected = selectedFilter === filter;

                        return (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setSelectedFilter(filter)}
	                                className={`shrink-0 rounded-full px-5 py-2.5 cursor-pointer text-base font-semibold transition-colors ${isSelected
	                                        ? "primary-bg-color text-white shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
	                                        : "bg-white secondary-text-color shadow-[0_3px_10px_rgba(15,23,42,0.10)] hover:bg-gray-50"
	                                    }`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 px-3 py-3">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onClick={() => {
                                    navigate(`/manage-ticket?ticket=${notification.ticket.id}`);
                                    changeStatusMutation.mutate(notification.id.toString())}}
                            />
                        ))
                    ) : (
                        <p className="px-3 text-sm secondary-text-color">
                            No {selectedFilter.toLowerCase()} notifications.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
