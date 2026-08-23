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
            className={`relative flex w-full cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-4 text-left shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] ${
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
