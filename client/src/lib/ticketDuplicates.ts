import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type { ApiComputer, ApiRelatedTicket, TicketType } from "@/types/createTicket";
import { isActiveSimilarityTicket, type TicketForSimilarity } from "@/utils/ticketSimilarity";

export interface ScopedSimilarityTicket extends TicketForSimilarity {
  type: string;
  roomId: number | null;
  computerId: number | null;
}

export interface TicketDuplicateScope {
  type: TicketType;
  roomId: number;
  computerId: number | null;
}

export const scopeDuplicateTickets = (tickets: ScopedSimilarityTicket[], scope: TicketDuplicateScope) =>
  tickets.filter((ticket) => isActiveSimilarityTicket(ticket) && ticket.type === scope.type &&
    (scope.computerId !== null
      ? ticket.computerId === scope.computerId
      : ticket.computerId === null && ticket.roomId === scope.roomId));

export const getComputerRelatedTickets = (computer?: ApiComputer): ApiRelatedTicket[] => {
  if (!computer) return [];
  const tickets = [
    ...(computer.assigned_tickets ?? []), ...(computer.pending_tickets ?? []),
    ...(computer.related_tickets ?? []), ...(computer.tickets ?? []),
  ];
  return [...new Map(tickets.filter(isActiveSimilarityTicket).map((ticket) => [ticket.id, ticket])).values()];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getId = (value: unknown) => typeof value === "number" ? value
  : isRecord(value) && typeof value.id === "number" ? value.id : null;

const parseCandidate = (value: unknown): ScopedSimilarityTicket => {
  if (!isRecord(value) || typeof value.id !== "number" || typeof value.status !== "string" ||
    typeof value.title !== "string" || typeof value.complaint_description !== "string" || typeof value.type !== "string") {
    throw new Error("The server returned invalid ticket data for the duplicate check.");
  }
  return {
    id: value.id,
    ticket_code: typeof value.ticket_code === "string" ? value.ticket_code : null,
    title: value.title,
    complaint_description: value.complaint_description,
    status: value.status,
    is_archived: value.is_archived === true,
    type: value.type.toLowerCase(),
    roomId: getId(value.room),
    computerId: getId(value.computer),
  };
};

export const fetchDuplicateTicketCandidates = async (): Promise<ScopedSimilarityTicket[]> => {
  const candidates: ScopedSimilarityTicket[] = [];
  const visited = new Set<string>();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  const apiUrl = buildApiUrl("/api/tickets/");
  let url: string | null = apiUrl;
  try {
    while (url) {
      if (visited.has(url)) throw new Error("Invalid ticket pagination response.");
      visited.add(url);
      const response = await privateFetch(url, { signal: controller.signal });
      const data: unknown = await response.json();
      if (!response.ok) {
        throw createApiError(response.status, isRecord(data) && typeof data.detail === "string" ? data.detail : "Failed to check existing tickets.");
      }
      const records = Array.isArray(data) ? data
        : isRecord(data) ? data.results ?? data.ticket ?? data.data : null;
      if (!Array.isArray(records)) throw new Error("Invalid ticket list response.");
      candidates.push(...records.map(parseCandidate));
      const next: URL | null = isRecord(data) && typeof data.next === "string" ? new URL(data.next, url) : null;
      if (next && next.origin !== new URL(apiUrl).origin) throw new Error("Invalid ticket pagination URL.");
      url = next?.href ?? null;
    }
    return [...new Map(candidates.map((ticket) => [ticket.id, ticket])).values()];
  } finally {
    window.clearTimeout(timeout);
  }
};
