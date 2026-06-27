import { ticketTypeConfig } from "@/utils/ticketType";
import { User } from "lucide-react";
import type { NotificationProps } from "@/types/notification";
import { formatRelativeTime } from "@/utils/string";

type NotificationCardProps = NotificationProps & {
    onClick: () => void;
};

export default function NotificationCard({ notification, onClick }: NotificationCardProps) {

    const config = ticketTypeConfig[notification.ticket.type];
    const Icon = config.icon;
    const reportedBy = `${notification.ticket.reportedBy.firstName} ${notification.ticket.reportedBy.lastName}`;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full cursor-pointer gap-x-3.5 items-start px-3 py-2.5 text-left transition-colors hover:bg-accent
                 ${notification.status.toLowerCase() === "unread" ? "bg-accent" : ""}`}
            aria-label={`Open ticket: ${notification.ticket.title}`}
        >
                <div className={`p-2.5 rounded-lg mt-0.5 ${config.className}`}>
                    <Icon size={18} />
                </div>

                <div className="flex flex-col w-full">
                    <h1 className="font-medium">{notification.title}</h1>
                    <p className=" text-sm mb-3">{notification.ticket.title}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-x-1 items-center secondary-text-color">
                            <User size={12} />
                            <span className='text-xs'>{reportedBy}</span>
                        </div>

                        <span className="text-xs secondary-text-color">{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                </div>
        </button>
    );
}
