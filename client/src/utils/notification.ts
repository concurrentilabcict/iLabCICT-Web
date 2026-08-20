import type { Notification, NotificationUser } from "@/types/notification";
import type { TicketType } from "./ticketType";

type ApiRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ApiRecord => {
    return typeof value === "object" && value !== null;
};

const getRecord = (record: ApiRecord, key: string): ApiRecord | undefined => {
    const value = record[key];

    return isRecord(value) ? value : undefined;
};

const getString = (record: ApiRecord, key: string): string | undefined => {
    const value = record[key];

    return typeof value === "string" ? value : undefined;
};

const getNumber = (record: ApiRecord, key: string): number | undefined => {
    const value = record[key];

    return typeof value === "number" ? value : undefined;
};

const normalizeTicketType = (type?: string): TicketType => {
    return type?.toLowerCase() === "report" ? "report" : "request";
};

const mapNotificationUser = (user: unknown, fallbackFirstName: string, fallbackLastName: string): NotificationUser => {
    const source = isRecord(user) ? user : {};

    return {
        id: getNumber(source, "id") ?? 0,
        firstName: getString(source, "first_name") ?? getString(source, "firstName") ?? fallbackFirstName,
        lastName: getString(source, "last_name") ?? getString(source, "lastName") ?? fallbackLastName,
    };
};

export const mapNotification = (notification: unknown): Notification => {
    const source = isRecord(notification) ? notification : {};
    const ticket = getRecord(source, "ticket") ?? {};
    const activitySummary = getRecord(source, "activity_summary") ?? getRecord(source, "activitySummary") ?? {};
    const reportedBy = getRecord(ticket, "reported_by") ?? getRecord(ticket, "reportedBy");
    const assignedTo = getRecord(ticket, "assigned_to") ?? getRecord(ticket, "assignedTo");
    const entityId = getNumber(source, "entity_id") ?? getNumber(source, "entityId") ?? getNumber(ticket, "id") ?? getNumber(source, "ticket_id") ?? 0;
    const entityTitle =
        getString(activitySummary, "entity_title") ??
        getString(activitySummary, "entityTitle") ??
        getString(ticket, "title") ??
        getString(source, "header") ??
        "Ticket update";
    const actor = getString(activitySummary, "actor") ?? "Unknown";

    return {
        id: getNumber(source, "id") ?? 0,
        entityId,
        entityType: getString(source, "entity_type") ?? getString(source, "entityType") ?? "ticket",
        eventType: getString(source, "event_type") ?? getString(source, "eventType") ?? "",
        title: getString(source, "title") ?? "Notification",
        activitySummary: {
            actor,
            entityTitle,
        },
        ticket: {
            id: entityId,
            type: normalizeTicketType(getString(ticket, "type") ?? getString(source, "ticket_type")),
            title: entityTitle,
            reportedBy: mapNotificationUser(reportedBy, actor, ""),
            assignedTo: assignedTo ? mapNotificationUser(assignedTo, "Unassigned", "Technician") : null,
        },
        status: getString(source, "status") ?? "read",
        createdAt: getString(source, "created_at") ?? getString(source, "createdAt") ?? new Date().toISOString(),
        recipientId: getNumber(source, "recipient_id") ?? getNumber(source, "recipientId") ?? null,
    };
};

export const sortNotificationsByNewest = (notifications: Notification[]) => {
    return [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};
