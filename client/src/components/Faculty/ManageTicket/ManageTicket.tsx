import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buildApiUrl,
  buildWebSocketUrl,
  createApiError,
  getFreshAccessToken,
  privateFetch,
} from "@/lib/api";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ApiTicket, Ticket } from "@/types/ticket";
import type { Status, StatusFilter, TicketType, TicketTypeFilter } from "@/utils/ticket";
import ManageTicketCard from "./ManageTicketCard";
import type { FacultyTicketView } from "./Filter";
import ManageTicketSkeleton from "@/components/ManageTicketSkeleton/ManageTicketSkeleton";
import TicketDetails from "./TicketDetails";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ResponsivePagination from "@/components/ResponsivePagination/ResponsivePagination";
import ArchiveTicketDialog from "@/components/Admin/ManageTicket/ArchiveTicketDialog/ArchiveTicketDialog";
import { appToast } from "@/utils/appToast";
import { CircleX, RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type ManageTicketProps = {
  ticketView: FacultyTicketView;
  onTicketViewChange: (view: FacultyTicketView) => void;
  statusFilter: StatusFilter;
  typeFilter: TicketTypeFilter;
  searchQuery: string;
};

const ITEMS_PER_PAGE = 10;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FACULTY_TICKETS_QUERY_KEY = ["tickets"] as const;
const facultyArchivedTicketsKey = (facultyId: number) => ["faculty-archived-tickets", facultyId] as const;
const TICKETS_WS_ENDPOINT = "/ws/tickets/";

type TicketWebSocketMessage =
  | {
    event: "initial_tickets";
    ticket: ApiTicket[];
    next?: string | null;
  }
  | {
    event: "ticket_created" | "ticket_updated" | "ticket_reassigned";
    ticket: ApiTicket;
  }
  | {
    event: "ticket_archived";
    ticket?: ApiTicket;
    ticket_id?: number;
    id?: number;
  }
  | {
    event: "ticket_unarchived";
    ticket?: ApiTicket;
    ticket_id?: number;
    id?: number;
  };

const formatLabel = (text: string) => text
  .replace(/_/g, " ")
  .trim()
  .split(/\s+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(" ");

const ticketStatusOrder: Record<string, number> = {
  open: 0,
  ongoing: 1,
  resolved: 2,
};

const sortTickets = (firstTicket: Ticket, secondTicket: Ticket) => {
  const statusDifference =
    (ticketStatusOrder[firstTicket.status.toLowerCase()] ?? 3) -
    (ticketStatusOrder[secondTicket.status.toLowerCase()] ?? 3);

  return statusDifference !== 0
    ? statusDifference
    : Date.parse(secondTicket.createdAt) - Date.parse(firstTicket.createdAt);
};

const mapTicket = (ticket: ApiTicket): Ticket => ({
  id: ticket.id,
  ticketCode: ticket.ticket_code,
  reportedBy: {
    id: ticket.reported_by.id,
    firstName: ticket.reported_by.first_name,
    lastName: ticket.reported_by.last_name,
  },
  assignedTo: ticket.assigned_to ? {
    id: ticket.assigned_to.id,
    firstName: ticket.assigned_to.first_name,
    lastName: ticket.assigned_to.last_name,
  } : { id: 0, firstName: "Unassigned", lastName: "" },
  room: {
    id: ticket.room.id,
    roomName: ticket.room.room_name,
    buildingName: ticket.room.building_name,
    floorNumber: ticket.room.floor_number,
  },
  computer: ticket.computer ? {
    id: ticket.computer.id,
    computerCode: ticket.computer.computer_code,
  } : { id: 0, computerCode: "Not specified" },
  type: ticket.type,
  title: ticket.title,
  complaintDescription: ticket.complaint_description,
  issueImage: ticket.issue_image,
  status: ticket.status,
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTicketWebSocketMessage = (
  value: unknown
): value is TicketWebSocketMessage => {
  if (!isRecord(value) || typeof value.event !== "string") {
    return false;
  }

  if (value.event === "initial_tickets") {
    return Array.isArray(value.ticket);
  }

  if (value.event === "ticket_archived" || value.event === "ticket_unarchived") {
    return (
      ("ticket" in value && isRecord(value.ticket)) ||
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

const upsertTicket = (tickets: Ticket[], apiTicket: ApiTicket) => {
  if (apiTicket.status === "archived" || apiTicket.is_archived === true) {
    return tickets.filter((ticket) => ticket.id !== apiTicket.id);
  }
  const ticket = mapTicket(apiTicket);
  const ticketExists = tickets.some(
    (currentTicket) => currentTicket.id === ticket.id
  );

  if (!ticketExists) {
    return [ticket, ...tickets];
  }

  return tickets.map((currentTicket) =>
    currentTicket.id === ticket.id ? ticket : currentTicket
  );
};

export default function ManageTicket({ ticketView, onTicketViewChange, statusFilter, typeFilter, searchQuery }: ManageTicketProps) {
  const queryClient = useQueryClient();
  const ticketSocketRef = useRef<WebSocket | null>(null);
  const locallyArchivedIds = useRef(new Set<number>());
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [viewOpenedAt] = useState(() => Date.now());
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketToArchive, setTicketToArchive] = useState<Ticket | null>(null);
  const [ticketToResubmit, setTicketToResubmit] = useState<Ticket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const filterKey = JSON.stringify([ticketView, statusFilter, typeFilter, searchQuery]);
  const [pagination, setPagination] = useState({ page: 1, filterKey });
  const [searchParams, setSearchParams] = useSearchParams();
  const notificationTicketId = searchParams.get("ticket");
  const facultyId = Number(localStorage.getItem("id"));
  const archivedQueryKey = useMemo(() => facultyArchivedTicketsKey(facultyId), [facultyId]);

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: FACULTY_TICKETS_QUERY_KEY,
    queryFn: async () => {
      const res = await privateFetch(buildApiUrl("/api/tickets/"));
      const data = await res.json();

      if (!res.ok) {
        throw createApiError(res.status, data.message || "Failed to fetch tickets.");
      }

      return (data as ApiTicket[])
        .filter((ticket) =>
          ticket.status !== "archived" && ticket.is_archived !== true &&
          !locallyArchivedIds.current.has(ticket.id)
        )
        .map(mapTicket);
    },
  });

  const {
    data: archivedTickets = [],
    isLoading: archivedTicketsAreLoading,
    isError: archivedTicketsHaveError,
    refetch: refetchArchivedTickets,
  } = useQuery<Ticket[]>({
    queryKey: archivedQueryKey,
    queryFn: async () => {
      const response = await privateFetch(buildApiUrl("/api/tickets/archive/"));
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = isRecord(body) && typeof body.detail === "string"
          ? body.detail : "Failed to load canceled tickets.";
        throw createApiError(response.status, message);
      }
      const items = Array.isArray(body) ? body
        : isRecord(body) && Array.isArray(body.results) ? body.results : null;
      if (!items) throw createApiError(response.status, "Invalid canceled tickets response.");
      return (items as ApiTicket[])
        .filter((ticket) => ticket.reported_by.id === facultyId)
        .map((ticket) => mapTicket({ ...ticket, status: "archived" }));
    },
    enabled: ticketView === "Archived" && Number.isInteger(facultyId) && facultyId > 0,
    staleTime: 30_000,
  });

  const archiveTicketMutation = useMutation({
    mutationFn: async (ticket: Ticket) => {
      const response = await privateFetch(
        buildApiUrl(`/api/tickets/${ticket.id}/archive/`),
        { method: "POST", body: JSON.stringify({}) }
      );
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const detail = isRecord(body) && typeof body.detail === "string"
          ? body.detail
          : "We couldn't archive the ticket. Please try again.";
        throw createApiError(response.status, detail);
      }
      return ticket;
    },
    onSuccess: (ticket) => {
      locallyArchivedIds.current.add(ticket.id);
      queryClient.setQueryData<Ticket[]>(
        FACULTY_TICKETS_QUERY_KEY,
        (currentTickets = []) => currentTickets.filter((item) => item.id !== ticket.id)
      );
      void queryClient.invalidateQueries({ queryKey: archivedQueryKey });
      onTicketViewChange("Archived");
      setTicketToArchive(null);
      appToast.success("Ticket canceled successfully.");
    },
    onError: (error: Error) => appToast.error(error.message),
  });

  const unarchiveTicketMutation = useMutation({
    mutationFn: async (ticket: Ticket) => {
      const response = await privateFetch(buildApiUrl(`/api/tickets/${ticket.id}/unarchive/`), {
        method: "POST", body: JSON.stringify({}),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const detail = isRecord(body) && typeof body.detail === "string"
          ? body.detail : "We couldn't unarchive the ticket. Please try again.";
        throw createApiError(response.status, detail);
      }
    },
    onSuccess: (_, ticket) => {
      setTicketToResubmit(null);
      locallyArchivedIds.current.delete(ticket.id);
      queryClient.setQueryData<Ticket[]>(archivedQueryKey,
        (items = []) => items.filter((item) => item.id !== ticket.id));
      void queryClient.invalidateQueries({ queryKey: FACULTY_TICKETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: archivedQueryKey });
      onTicketViewChange(Date.now() - Date.parse(ticket.createdAt) < SEVEN_DAYS_MS ? "Recent" : "Older");
      appToast.success("Ticket resubmitted successfully.");
    },
    onError: (error: Error) => appToast.error(error.message),
  });

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let shouldReconnect = true;
    const connectSocket = async () => {
      const accessToken = await getFreshAccessToken();

      if (!accessToken || !shouldReconnect) {
        return;
      }

      socket = new WebSocket(
        buildWebSocketUrl(TICKETS_WS_ENDPOINT, { token: accessToken })
      );
      ticketSocketRef.current = socket;

      socket.addEventListener("message", (event: MessageEvent<string>) => {
        let parsedMessage: unknown;

        try {
          parsedMessage = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!isTicketWebSocketMessage(parsedMessage)) {
          return;
        }

        if (parsedMessage.event === "initial_tickets") {
          queryClient.setQueryData<Ticket[]>(
            FACULTY_TICKETS_QUERY_KEY,
            parsedMessage.ticket
              .filter((ticket) =>
                ticket.status !== "archived" && ticket.is_archived !== true &&
                !locallyArchivedIds.current.has(ticket.id)
              )
              .map(mapTicket)
          );
          return;
        }

        if (parsedMessage.event === "ticket_archived") {
          const archivedTicketId =
            parsedMessage.ticket?.id ?? parsedMessage.ticket_id ?? parsedMessage.id;

          if (archivedTicketId === undefined) return;

          queryClient.setQueryData<Ticket[]>(
            FACULTY_TICKETS_QUERY_KEY,
            (currentTickets = []) =>
              currentTickets.filter((ticket) => ticket.id !== archivedTicketId)
          );
          void queryClient.invalidateQueries({ queryKey: archivedQueryKey });
          setSelectedTicketId(null);
          setSheetOpen(false);
          return;
        }

        if (parsedMessage.event === "ticket_unarchived") {
          const restoredTicket = parsedMessage.ticket;
          const restoredTicketId = restoredTicket?.id ?? parsedMessage.ticket_id ?? parsedMessage.id;
          if (restoredTicketId !== undefined) locallyArchivedIds.current.delete(restoredTicketId);
          queryClient.setQueryData<Ticket[]>(archivedQueryKey,
            (items = []) => items.filter((item) => item.id !== restoredTicketId));
          void queryClient.invalidateQueries({ queryKey: archivedQueryKey });
          if (restoredTicket) {
            queryClient.setQueryData<Ticket[]>(
              FACULTY_TICKETS_QUERY_KEY,
              (currentTickets = []) => upsertTicket(currentTickets, restoredTicket)
            );
          } else {
            void queryClient.invalidateQueries({ queryKey: FACULTY_TICKETS_QUERY_KEY });
          }
          return;
        }

        if (locallyArchivedIds.current.has(parsedMessage.ticket.id)) return;

        queryClient.setQueryData<Ticket[]>(
          FACULTY_TICKETS_QUERY_KEY,
          (currentTickets = []) =>
            upsertTicket(currentTickets, parsedMessage.ticket)
        );
      });
      socket.addEventListener("close", () => {
        if (shouldReconnect) reconnectTimer = window.setTimeout(connectSocket, 1_500);
      });
    };

    const connectTimer = window.setTimeout(connectSocket, 0);

    return () => {
      shouldReconnect = false;
      window.clearTimeout(connectTimer);
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      socket?.close();

      if (ticketSocketRef.current === socket) {
        ticketSocketRef.current = null;
      }
    };
  }, [queryClient, archivedQueryKey]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const cutoff = viewOpenedAt - SEVEN_DAYS_MS;

    return [...(ticketView === "Archived" ? archivedTickets : tickets)]
      .sort(sortTickets)
      .filter((ticket) => {
        const status = formatLabel(ticket.status) as Status;
        const type = formatLabel(ticket.type) as TicketType;
        const searchableText = [
          ticket.ticketCode, ticket.title, ticket.complaintDescription,
          ticket.reportedBy.firstName, ticket.reportedBy.lastName,
          ticket.assignedTo?.firstName, ticket.assignedTo?.lastName,
          ticket.room.buildingName, ticket.room.roomName, ticket.computer?.computerCode,
          status, type,
        ].join(" ").toLowerCase();

        const isRecent = Date.parse(ticket.createdAt) > cutoff;
        const matchesView = ticketView === "Archived" ||
          (ticketView === "Recent" ? isRecent : !isRecent);

        return matchesView
          && (statusFilter === "All" || status === statusFilter)
          && (typeFilter === "All" || type === typeFilter)
          && (normalizedQuery === "" || searchableText.includes(normalizedQuery));
      });
  }, [tickets, archivedTickets, ticketView, statusFilter, typeFilter, searchQuery, viewOpenedAt]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
  const currentPage = pagination.filterKey === filterKey
    ? Math.min(pagination.page, totalPages) : 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const manuallySelectedTicket = (ticketView === "Archived" ? archivedTickets : tickets)
    .find((ticket) => ticket.id === selectedTicketId) ?? null;
  const notificationTicket = useMemo(() => {
    const ticketId = Number(notificationTicketId);

    if (!notificationTicketId || !Number.isInteger(ticketId)) {
      return null;
    }

    return (ticketView === "Archived" ? archivedTickets : tickets)
      .find((ticket) => ticket.id === ticketId) ?? null;
  }, [notificationTicketId, tickets, archivedTickets, ticketView]);
  const selectedTicket = notificationTicket ?? manuallySelectedTicket;

  const openTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open && notificationTicketId) {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-3 px-3 pt-3 pb-10 sm:grid sm:grid-cols-2">
        {(ticketView === "Archived" ? archivedTicketsAreLoading : isLoading) && <ManageTicketSkeleton />}
        {ticketView === "Archived" && archivedTicketsHaveError && (
          <div className="col-span-full flex flex-col items-center gap-2 py-8 text-center text-red-600">
            <p>Failed to load canceled tickets.</p>
            <button type="button" onClick={() => void refetchArchivedTickets()}
              className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold hover:bg-red-50">Retry</button>
          </div>
        )}
        {!(ticketView === "Archived" ? archivedTicketsAreLoading || archivedTicketsHaveError : isLoading) && paginatedTickets.length === 0 &&
          <p className="col-span-full py-8 text-center secondary-text-color">No {ticketView.toLowerCase()} tickets found.</p>}
        {!(ticketView === "Archived" ? archivedTicketsAreLoading || archivedTicketsHaveError : isLoading) && paginatedTickets.map((ticket) => {
          const status = formatLabel(ticket.status) as Status;
          const type = formatLabel(ticket.type) as TicketType;
          return (
            <ManageTicketCard
              key={ticket.id}
              status={status}
              type={type}
              title={ticket.title}
              complaintDescription={ticket.complaintDescription}
	              ticketCode={ticket.ticketCode}
	              reportedBy={`${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`}
	              assignedTo={`${ticket.assignedTo?.firstName} ${ticket.assignedTo?.lastName}`.trim()}
	              roomName={ticket.room.roomName}
	              buildingName={formatLabel(ticket.room.buildingName)}
	              floorNumber={ticket.room.floorNumber}
	              computerCode={ticket.computer?.computerCode || "No Computer"}
	              date={ticket.createdAt}
              onClick={() => openTicket(ticket)}
              onArchive={ticketView !== "Archived" && ticket.status.toLowerCase() === "open"
                ? () => setTicketToArchive(ticket)
                : undefined}
              onResubmit={ticketView === "Archived" ? () => setTicketToResubmit(ticket) : undefined}
              isResubmitting={unarchiveTicketMutation.isPending && unarchiveTicketMutation.variables?.id === ticket.id}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className={`px-3 ${isMobile ? "mb-23" : "mb-10"}`}>
          <ResponsivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setPagination({ page, filterKey })}
            className={isMobile ? "justify-center" : "justify-end"}
          />
        </div>
      )}

      <Sheet open={sheetOpen || Boolean(notificationTicket)} onOpenChange={handleSheetOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[90vh]" : "w-[1000px]!"}>
          {selectedTicket && <TicketDetails ticket={selectedTicket} />}
        </SheetContent>
      </Sheet>
      <ArchiveTicketDialog
        open={ticketToArchive !== null}
        onOpenChange={(open) => {
          if (!open && !archiveTicketMutation.isPending) setTicketToArchive(null);
        }}
        onArchive={() => {
          if (ticketToArchive) archiveTicketMutation.mutate(ticketToArchive);
        }}
        isPending={archiveTicketMutation.isPending}
        title="Cancel Ticket?"
        actionLabel="Cancel Ticket"
        actionIcon={CircleX}
        pendingLabel="Canceling..."
        description="This open ticket and its related history will be archived. You can resubmit it afterward."
      />
      <ArchiveTicketDialog
        open={ticketToResubmit !== null}
        onOpenChange={(open) => {
          if (!open && !unarchiveTicketMutation.isPending) setTicketToResubmit(null);
        }}
        onArchive={() => {
          if (ticketToResubmit) unarchiveTicketMutation.mutate(ticketToResubmit);
        }}
        isPending={unarchiveTicketMutation.isPending}
        title="Resubmit Ticket?"
        actionLabel="Resubmit"
        actionIcon={RotateCcw}
        pendingLabel="Resubmitting..."
        description="This ticket and its related history will return to the active ticket list."
      />
    </>
  );
}
