import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Ticket } from "lucide-react";

import { privateFetch } from "@/lib/api";
import type { Notification as NotificationType } from "@/types/notification";
import {
  NOTIFICATIONS_QUERY_KEY,
  useNotifications,
} from "@/components/Technician/Notification/useNotifications";
import { formatDateTime } from "@/utils/string";

type NotificationFilter = "All" | "Read" | "Unread";

const notificationFilters: NotificationFilter[] = ["All", "Read", "Unread"];

export default function Notification() {
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>("All");
  const { notifications, isLoading, isError } = useNotifications();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "All") {
      return notifications;
    }

    return notifications.filter((notification) => {
      const status = notification.status.toLowerCase();

      return selectedFilter === "Unread" ? status === "unread" : status === "read";
    });
  }, [notifications, selectedFilter]);

  const changeStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await privateFetch(
        `https://ilabcict-backend.onrender.com/api/notifications/${id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "read" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update notification status");
      }
    },
    onSuccess: (_data, id) => {
      const notificationId = Number(id);

      queryClient.setQueryData<NotificationType[]>(
        NOTIFICATIONS_QUERY_KEY,
        (currentNotifications = []) =>
          currentNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, status: "read" }
              : notification
          )
      );
    },
  });

  if (isLoading) {
    return <NotificationMessage message="Loading notifications..." />;
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
              onClick={() => {
                navigate(`/manage-ticket?ticket=${notification.ticket.id}`);
                changeStatusMutation.mutate(notification.id.toString());
              }}
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
}: {
  notification: NotificationType;
  onClick: () => void;
}) {
  const displayUser = notification.ticket.assignedTo;
  const displayName = displayUser
    ? `${displayUser.firstName} ${displayUser.lastName}`.trim()
    : "Unassigned technician";
  const isUnread = notification.status.toLowerCase() === "unread";
  const summary = notification.activitySummary?.actor
    ? `${notification.activitySummary.actor} ${notification.eventType.replace(/_/g, " ")} ${notification.activitySummary.entityTitle}`
    : `${displayName} updated ${notification.ticket.title}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full cursor-pointer items-start gap-4 rounded-xl bg-white px-4 py-4 text-left shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] ${
        isUnread ? "ring-1 ring-orange-200" : ""
      }`}
      aria-label={`Open ticket: ${notification.ticket.title}`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Ticket size={18} />
      </div>

      <div className="min-w-0 flex-1 pr-4">
        <h2 className="truncate text-base font-bold leading-snug text-zinc-950">
          {notification.title}
        </h2>
        <p className="mt-1.5 line-clamp-1 text-sm font-medium leading-relaxed text-zinc-500">
          {summary}
        </p>
        <p className="mt-3 text-sm font-semibold text-zinc-400">
          {formatDateTime(notification.createdAt)}
        </p>
      </div>

      {isUnread && (
        <span className="absolute right-3.5 top-4 size-2.5 rounded-full bg-orange-500" />
      )}
    </button>
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
