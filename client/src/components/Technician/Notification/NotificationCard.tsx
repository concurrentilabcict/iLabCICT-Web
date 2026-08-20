import type { NotificationProps } from "@/types/notification";
import { formatDateTime } from "@/utils/string";
import { useAuth } from "@/auth/useAuth";
import { Ticket } from "lucide-react";

type NotificationCardProps = NotificationProps & {
    onClick: () => void;
};

export default function NotificationCard({
    notification,
    onClick,
}: NotificationCardProps) {
    const { role } = useAuth();
    const displayUser = role === "faculty"
        ? notification.ticket.assignedTo
        : notification.ticket.reportedBy;
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
            className={`relative flex w-full cursor-pointer items-start gap-4 rounded-3xl bg-white px-4 py-4 text-left shadow-sm transition hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] ${
                isUnread ? "ring-1 ring-orange-200" : ""
            }`}
            aria-label={`Open ticket: ${notification.ticket.title}`}
        >
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Ticket size={28} />
            </div>

            <div className="min-w-0 flex-1 pr-4">
                <h2 className="truncate text-lg font-bold text-zinc-950">
                    {notification.title}
                </h2>
                <p className="mt-1 line-clamp-1 text-sm font-medium text-zinc-600">
                    {summary}
                </p>
                <p className="mt-4 text-sm font-semibold text-zinc-400">
                    {formatDateTime(notification.createdAt)}
                </p>
            </div>

            {isUnread && (
                <span className="absolute right-4 top-5 size-3 rounded-full bg-orange-500" />
            )}
        </button>
    );
}
