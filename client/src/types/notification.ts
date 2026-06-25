import type { TicketType } from "@/utils/ticketType";

export type ReportedBy = {
    id: number;
    firstName: string;
    lastName: string;
}

export type NotificationTicket = {
    id: number;
    type: TicketType;
    title: string;
    reportedBy: ReportedBy;
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
