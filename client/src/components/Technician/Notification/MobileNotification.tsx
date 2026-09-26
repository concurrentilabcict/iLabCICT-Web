import type { Notification } from "@/types/notification";
import NotificationCard from "./NotificationCard";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appToast } from "@/utils/appToast";
import { getNotificationPath } from "@/utils/notification";
import { useArchiveNotification, useMarkNotificationAsRead } from "./useNotifications";

type MobileNotificationProps = {
    notifications: Notification[];
    onNotificationOpen?: () => void;
}

type NotificationFilter = "All" | "Unread" | "Read";

const notificationFilters: NotificationFilter[] = ["All", "Unread", "Read"];

type NotificationGroup = {
    label: "New" | "Today" | "Earlier";
    notifications: Notification[];
};

export default function MobileNotification({
    notifications,
    onNotificationOpen,
}: MobileNotificationProps) {
    const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>("All");
    const navigate = useNavigate();
    const markNotificationAsRead = useMarkNotificationAsRead();
    const archiveNotification = useArchiveNotification();

    const filteredNotifications = useMemo(() => {
        if (selectedFilter === "All") {
            return notifications;
        }

        return notifications.filter((notification) => {
            return selectedFilter === "Unread"
                ? !notification.isRead
                : notification.isRead;
        });
    }, [notifications, selectedFilter]);

    const filterCounts: Record<NotificationFilter, number> = {
        All: notifications.length,
        Read: notifications.filter((notification) => notification.isRead).length,
        Unread: notifications.filter((notification) => !notification.isRead).length,
    };

    const notificationGroups = useMemo<NotificationGroup[]>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups: NotificationGroup[] = [
            { label: "New", notifications: [] },
            { label: "Today", notifications: [] },
            { label: "Earlier", notifications: [] },
        ];

        filteredNotifications.forEach((notification) => {
            if (!notification.isRead) {
                groups[0].notifications.push(notification);
                return;
            }

            const createdAt = new Date(notification.createdAt);
            const groupIndex = createdAt >= today ? 1 : 2;
            groups[groupIndex].notifications.push(notification);
        });

        return groups.filter((group) => group.notifications.length > 0);
    }, [filteredNotifications]);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markNotificationAsRead.mutate(notification.id, {
                onError: () => appToast.error("We couldn't mark this notification as read. Please try again."),
            });
        }

        navigate(getNotificationPath(notification));
        onNotificationOpen?.();
    };

    return (
        <div className="flex min-h-0 flex-col">
                <div className="sticky top-0 z-10 bg-white px-4 py-2.5">
                    <div className="flex items-center gap-2">
                    {notificationFilters.map((filter) => {
                        const isSelected = selectedFilter === filter;

                        return (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setSelectedFilter(filter)}
                                aria-pressed={isSelected}
	                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isSelected
	                                    ? "bg-[#bf3419] text-white shadow-sm"
	                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
	                                }`}
                            >
                                <span>{filter}</span>
                                <span className={`text-xs ${isSelected ? "text-white/80" : "text-zinc-400"}`}>
                                    {filterCounts[filter]}
                                </span>
                            </button>
                        );
                    })}
                    </div>
                </div>

                <div className="px-2 pb-3">
                    {notificationGroups.length > 0 ? (
                        notificationGroups.map((group) => (
                            <section key={group.label} className="mt-2 first:mt-0">
                                <h3 className="px-2 pb-1 pt-2 text-base font-bold text-zinc-900">
                                    {group.label}
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {group.notifications.map((notification) => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onClick={() => handleNotificationClick(notification)}
                                            onArchive={() => archiveNotification.mutate(notification.id, {
                                                onError: () => appToast.error("We couldn't archive this notification. Please try again."),
                                            })}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <p className="px-4 py-10 text-center text-sm secondary-text-color">
                            No {selectedFilter.toLowerCase()} notifications.
                        </p>
                    )}
                </div>
        </div>
    );
}
