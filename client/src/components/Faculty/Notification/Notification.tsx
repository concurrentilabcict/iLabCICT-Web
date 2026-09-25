import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Ticket } from "lucide-react";
import { appToast } from "@/utils/appToast";

import type { Notification as NotificationType } from "@/types/notification";
import {
  useMarkNotificationAsRead,
  useArchiveNotification,
  useNotifications,
} from "@/components/Technician/Notification/useNotifications";
import { getNotificationPath } from "@/utils/notification";
import { formatDateTime } from "@/utils/string";
import NotificationSkeleton from "@/components/NotificationSkeleton/NotificationSkeleton";

type NotificationFilter = "All" | "Read" | "Unread";

const notificationFilters: NotificationFilter[] = ["All", "Read", "Unread"];

export default function Notification() {
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>("All");
  const { notifications, isLoading, isError } = useNotifications();
  const navigate = useNavigate();
  const markNotificationAsRead = useMarkNotificationAsRead();
  const archiveNotification = useArchiveNotification();

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "All") {
      return notifications;
    }

    return notifications.filter((notification) => {
      return selectedFilter === "Unread" ? !notification.isRead : notification.isRead;
    });
  }, [notifications, selectedFilter]);

  const handleNotificationClick = (notification: NotificationType) => {
    if (!notification.isRead) {
      markNotificationAsRead.mutate(notification.id, {
        onError: () => appToast.error("We couldn't mark this notification as read. Please try again."),
      });
    }

    navigate(getNotificationPath(notification));
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[900px] md:px-3">
        <NotificationSkeleton />
      </div>
    );
  }

  if (isError) {
    return <NotificationMessage message="Failed to load notifications." isError />;
  }

  return (
    <section className="mx-auto w-full max-w-[900px] px-3 py-4 md:px-6 md:py-6">
      <div className="flex flex-wrap items-center gap-2 py-2">
        {notificationFilters.map((filter) => {
          const isSelected = selectedFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? "primary-bg-color text-white shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
                  : "bg-white secondary-text-color shadow-[0_3px_10px_rgba(15,23,42,0.10)] hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <FacultyNotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              onArchive={() => archiveNotification.mutate(notification.id, {
                onError: () => appToast.error("We couldn't archive this notification. Please try again."),
              })}
            />
          ))
        ) : (
          <p className="rounded-xl bg-white px-4 py-5 text-sm secondary-text-color shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
            No {selectedFilter.toLowerCase()} notifications.
          </p>
        )}
      </div>
    </section>
  );
}

function FacultyNotificationCard({
  notification,
  onClick,
  onArchive,
}: {
  notification: NotificationType;
  onClick: () => void;
  onArchive: () => void;
}) {
  const displayUser = notification.ticket.assignedTo;
  const displayName = displayUser
    ? `${displayUser.firstName} ${displayUser.lastName}`.trim()
    : "Unassigned technician";
  const isUnread = !notification.isRead;
  const summaryName = notification.activitySummary?.actor ?? displayName;
  const summaryTitle = notification.activitySummary?.entityTitle ?? notification.ticket.title;

  return (
    <div className={`relative flex w-full items-start gap-4 rounded-xl bg-white px-4 py-4 text-left shadow-[0_4px_14px_rgba(15,23,42,0.08)] ${
        isUnread ? "ring-1 ring-orange-200" : ""
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-0 cursor-pointer rounded-xl"
        aria-label={`Open notification: ${notification.title}`}
      />
      <div className="pointer-events-none flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Ticket size={18} />
      </div>

      <div className="pointer-events-none min-w-0 flex-1 pr-4">
        <h2 className="truncate text-base font-bold leading-snug text-zinc-950">
          {notification.title}
        </h2>
        <p className="mt-1.5 truncate text-sm font-medium leading-relaxed text-zinc-500">
          {summaryName}
        </p>
        <p className="truncate text-sm font-semibold leading-relaxed text-zinc-700">
          {summaryTitle}
        </p>
        <p className="mt-3 text-sm font-semibold text-zinc-400">
          {formatDateTime(notification.createdAt)}
        </p>
      </div>

      {isUnread && (
        <span className="absolute right-3.5 top-4 size-2.5 rounded-full bg-orange-500" />
      )}
      <button
        type="button"
        onClick={onArchive}
        className="absolute bottom-3 right-3 cursor-pointer rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
        aria-label={`Archive notification: ${notification.title}`}
        title="Archive notification"
      >
        <Archive className="size-4" />
      </button>
    </div>
  );
}

function NotificationMessage({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[900px] px-3 py-5 md:px-6">
      <p className={`text-sm ${isError ? "text-red-600" : "secondary-text-color"}`}>
        {message}
      </p>
    </div>
  );
}
