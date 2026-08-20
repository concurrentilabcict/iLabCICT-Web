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

export type NotificationActivitySummary = {
    actor: string;
    entityTitle: string;
}

export type Notification = {
    id: number;
    entityId: number;
    entityType: string;
    eventType: string;
    title: string;
    activitySummary: NotificationActivitySummary;
    ticket: NotificationTicket;
    status: string;
    createdAt: string;
    recipientId: number | null;
}

export type NotificationProps = {
    notification: Notification;
}
