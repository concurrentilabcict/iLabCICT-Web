import type { ApiTicket } from "@/types/ticket";

/**
 * The ticket consumer broadcasts both the past-tense and the bare-tense
 * spelling of the archive events, so both are accepted here.
 */
export const TICKET_ARCHIVED_EVENT = "ticket_archived";
export const TICKET_ARCHIVE_EVENT = "ticket_archive";

export const TICKET_UNARCHIVED_EVENT = "ticket_unarchived";
export const TICKET_UNARCHIVE_EVENT = "ticket_unarchive";

type TicketArchiveEventMessage<TEvent extends string> = {
    event: TEvent;
    /**
     * The archive broadcast identifies the ticket with a bare id. A full record
     * is only sent when the server has one to hand, so both are accepted.
     */
    ticket?: ApiTicket | number;
    ticket_id?: number;
    id?: number;
};

export type TicketArchivedMessage =
    | TicketArchiveEventMessage<typeof TICKET_ARCHIVED_EVENT>
    | TicketArchiveEventMessage<typeof TICKET_ARCHIVE_EVENT>;

export type TicketUnarchivedMessage =
    | TicketArchiveEventMessage<typeof TICKET_UNARCHIVED_EVENT>
    | TicketArchiveEventMessage<typeof TICKET_UNARCHIVE_EVENT>;

export type InitialTicketsMessage = {
    event: "initial_tickets";
    ticket: ApiTicket[];
    next?: string | null;
};

export type TicketChangeMessage = {
    event: "ticket_created" | "ticket_updated" | "ticket_reassigned";
    ticket: ApiTicket;
};

export type TicketWebSocketMessage =
    | InitialTicketsMessage
    | TicketChangeMessage
    | TicketArchivedMessage
    | TicketUnarchivedMessage;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

export const isTicketArchivedMessage = (
    message: TicketWebSocketMessage
): message is TicketArchivedMessage =>
    message.event === TICKET_ARCHIVED_EVENT || message.event === TICKET_ARCHIVE_EVENT;

export const isTicketUnarchivedMessage = (
    message: TicketWebSocketMessage
): message is TicketUnarchivedMessage =>
    message.event === TICKET_UNARCHIVED_EVENT || message.event === TICKET_UNARCHIVE_EVENT;

const isTicketArchiveEventName = (event: string): boolean =>
    event === TICKET_ARCHIVED_EVENT ||
    event === TICKET_ARCHIVE_EVENT ||
    event === TICKET_UNARCHIVED_EVENT ||
    event === TICKET_UNARCHIVE_EVENT;

/**
 * The archive broadcast carries the ticket id as a bare number under `ticket`,
 * mirroring the computer archive event. Older payloads send the full record
 * under `ticket`, or the id under `ticket_id` / `id`.
 */
export const getTicketArchiveEventId = (
    message: TicketArchivedMessage | TicketUnarchivedMessage
): number | undefined => {
    if (typeof message.ticket === "number") {
        return message.ticket;
    }

    if (isRecord(message.ticket) && typeof message.ticket.id === "number") {
        return message.ticket.id;
    }

    return message.ticket_id ?? message.id;
};

/** The full ticket record, when the broadcast included one. */
export const getTicketArchiveEventTicket = (
    message: TicketArchivedMessage | TicketUnarchivedMessage
): ApiTicket | undefined =>
    isRecord(message.ticket) ? (message.ticket as ApiTicket) : undefined;

export const isTicketWebSocketMessage = (
    value: unknown
): value is TicketWebSocketMessage => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_tickets") {
        return Array.isArray(value.ticket);
    }

    if (isTicketArchiveEventName(value.event)) {
        return (
            typeof value.ticket === "number" ||
            isRecord(value.ticket) ||
            typeof value.ticket_id === "number" ||
            typeof value.id === "number"
        );
    }

    return (
        ["ticket_created", "ticket_updated", "ticket_reassigned"].includes(
            value.event
        ) && isRecord(value.ticket)
    );
};
