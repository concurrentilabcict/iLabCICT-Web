import type { Notification } from "@/types/notification";
import NotificationCard from "./NotificationCard";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type MobileNotificationProps = {
    notifications: Notification[];
}

type NotificationFilter = "All" | "Unread" | "Read";

const notificationFilters: NotificationFilter[] = ["All", "Unread", "Read"];

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

    return (
        <>
            <div className="flex flex-col py-3">
                <div className="flex items-center gap-x-3 px-3 pb-3">
                    {notificationFilters.map((filter) => {
                        const isSelected = selectedFilter === filter;

                        return (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setSelectedFilter(filter)}
                                className={`rounded-full px-4 py-1.5 cursor-pointer text-base transition-colors ${
                                    isSelected
                                        ? "primary-bg-color text-white"
                                        : "text-black hover:bg-accent"
                                }`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col py-3">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onClick={() => navigate(`/manage-ticket?ticket=${notification.ticket.id}`)}
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
