import type { NotificationProps } from "@/types/notification";
import { formatDateTime } from "@/utils/string";
import { useAuth } from "@/auth/useAuth";
import { Archive, Ticket } from "lucide-react";

type NotificationCardProps = NotificationProps & {
    onClick: () => void;
    onArchive: () => void;
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

    return (
        <div className={`relative flex w-full items-start gap-3 rounded-xl bg-white px-4 py-4 text-left shadow-[0_4px_14px_rgba(15,23,42,0.08)] ${
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
