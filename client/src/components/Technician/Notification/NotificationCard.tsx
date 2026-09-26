import type { NotificationProps } from "@/types/notification";
import { useAuth } from "@/auth/useAuth";
import { Archive, FileText, Ticket } from "lucide-react";

type NotificationCardProps = NotificationProps & {
    onClick: () => void;
    onArchive: () => void;
};

const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const elapsedMilliseconds = Math.max(0, Date.now() - date.getTime());
    const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedMinutes < 1) {
        return "Just now";
    }

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m`;
    }

    if (elapsedHours < 24) {
        return `${elapsedHours}h`;
    }

    if (elapsedDays < 7) {
        return `${elapsedDays}d`;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

export default function NotificationCard({
    notification,
    onClick,
    onArchive,
}: NotificationCardProps) {
    const { role } = useAuth();
    const displayUser = role === "faculty"
        ? notification.ticket.assignedTo
        : notification.ticket.reportedBy;
    const displayName = displayUser
        ? `${displayUser.firstName} ${displayUser.lastName}`.trim()
        : "Unassigned technician";
    const isUnread = !notification.isRead;
    const summaryName = notification.activitySummary?.actor ?? displayName;
    const summaryTitle = notification.activitySummary?.entityTitle ?? notification.ticket.title;
    const NotificationIcon = notification.entityType === "weekly-report" ? FileText : Ticket;

    return (
        <article className={`group relative flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                isUnread
                    ? "border-[#f2d0c8] bg-[#fff8f6] hover:bg-[#fff1ed]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
            }`}
        >
            <button
                type="button"
                onClick={onClick}
                className="absolute inset-0 z-0 cursor-pointer"
                aria-label={`Open notification: ${notification.title}`}
            />
            <div className={`pointer-events-none relative flex size-12 shrink-0 items-center justify-center rounded-full ${
                isUnread ? "bg-[#fce9e4] text-[#bf3419]" : "bg-zinc-100 text-zinc-500"
            }`}>
                <NotificationIcon className="size-5" />
            </div>

            <div className="pointer-events-none min-w-0 flex-1">
                <p className="line-clamp-2 pr-8 text-sm leading-5 text-zinc-700">
                    <span className="font-semibold text-zinc-950">{summaryName}</span>
                    <span> {notification.title}</span>
                </p>
                <p className="truncate pr-8 text-sm leading-5 text-zinc-500">
                    {summaryTitle}
                </p>
                <p className="mt-1 flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className={isUnread ? "text-[#bf3419]" : "text-zinc-400"}>
                        {formatNotificationTime(notification.createdAt)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isUnread
                            ? "bg-[#fce9e4] text-[#a92d16]"
                            : "bg-zinc-100 text-zinc-500"
                    }`}>
                        {isUnread ? "Unread" : "Read"}
                    </span>
                </p>
            </div>

            <button
                type="button"
                onClick={onArchive}
                className="absolute right-1.5 top-1.5 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-500 opacity-100 shadow-sm ring-1 ring-black/10 transition-all hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bf3419] md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                aria-label={`Archive notification: ${notification.title}`}
                title="Archive notification"
            >
                <Archive className="size-4" />
            </button>
        </article>
    );
}
