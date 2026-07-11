import type { TicketType } from "@/utils/ticketType";

export type NotificationUser = {
    id: number;
    firstName: string;
    lastName: string;
}

export type NotificationTicket = {
    id: number;
    type: TicketType;
    title: string;
    reportedBy: NotificationUser;
    assignedTo: NotificationUser | null;
}

export type Notification = {
    id: number;
    title: string;
    ticket: NotificationTicket;
    status: string;
    createdAt: string;
}

export type NotificationProps = {
    notification: Notification;
}
