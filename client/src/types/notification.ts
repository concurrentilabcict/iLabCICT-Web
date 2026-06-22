import type { TicketType } from "@/utils/ticketType";


export type Notification = {
    id: number;
    title: string;
    header: string;
    ticketType: TicketType;
    status: string;
    createdAt: string;
}

export type NotificationProps = {
    notification: Notification;
}
