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
import ManageTicketSkeleton from "@/components/ManageTicketSkeleton/ManageTicketSkeleton";
import TicketDetails from "./TicketDetails";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ResponsivePagination from "@/components/ResponsivePagination/ResponsivePagination";
import ArchiveTicketDialog from "@/components/Admin/ManageTicket/ArchiveTicketDialog/ArchiveTicketDialog";
import { appToast } from "@/utils/appToast";
import { CircleX, RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type ManageTicketProps = {
  statusFilter: StatusFilter;
  typeFilter: TicketTypeFilter;
  searchQuery: string;
};

const ITEMS_PER_PAGE = 10;
const FACULTY_TICKETS_QUERY_KEY = ["tickets"] as const;
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

export default function ManageTicket({ statusFilter, typeFilter, searchQuery }: ManageTicketProps) {
  const queryClient = useQueryClient();
  const ticketSocketRef = useRef<WebSocket | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketToArchive, setTicketToArchive] = useState<Ticket | null>(null);
  const [recentlyArchivedTicket, setRecentlyArchivedTicket] = useState<Ticket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const notificationTicketId = searchParams.get("ticket");

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: FACULTY_TICKETS_QUERY_KEY,
    queryFn: async () => {
      const res = await privateFetch(buildApiUrl("/api/tickets/"));
      const data = await res.json();

      if (!res.ok) {
        throw createApiError(res.status, data.message || "Failed to fetch tickets.");
      }

      return (data as ApiTicket[]).map(mapTicket);
    },
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
      queryClient.setQueryData<Ticket[]>(
        FACULTY_TICKETS_QUERY_KEY,
        (currentTickets = []) => currentTickets.filter((item) => item.id !== ticket.id)
      );
      setRecentlyArchivedTicket(ticket);
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
    onSuccess: () => {
      setRecentlyArchivedTicket(null);
      void queryClient.invalidateQueries({ queryKey: FACULTY_TICKETS_QUERY_KEY });
      appToast.success("Ticket resubmitted successfully.");
    },
    onError: (error: Error) => appToast.error(error.message),
  });

  useEffect(() => {
    let socket: WebSocket | null = null;
    const connectSocket = window.setTimeout(async () => {
      const accessToken = await getFreshAccessToken();

      if (!accessToken) {
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
            parsedMessage.ticket.map(mapTicket)
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
          setSelectedTicketId(null);
          setSheetOpen(false);
          return;
        }

        if (parsedMessage.event === "ticket_unarchived") {
          const restoredTicket = parsedMessage.ticket;
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

        queryClient.setQueryData<Ticket[]>(
          FACULTY_TICKETS_QUERY_KEY,
          (currentTickets = []) =>
            upsertTicket(currentTickets, parsedMessage.ticket)
        );
      });
    }, 0);

    return () => {
      window.clearTimeout(connectSocket);
      socket?.close();

      if (ticketSocketRef.current === socket) {
        ticketSocketRef.current = null;
      }
    };
  }, [queryClient]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return [...tickets]
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

        return (statusFilter === "All" || status === statusFilter)
          && (typeFilter === "All" || type === typeFilter)
          && (normalizedQuery === "" || searchableText.includes(normalizedQuery));
      });
  }, [tickets, statusFilter, typeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const manuallySelectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  const notificationTicket = useMemo(() => {
    const ticketId = Number(notificationTicketId);

    if (!notificationTicketId || !Number.isInteger(ticketId)) {
      return null;
    }

    return tickets.find((ticket) => ticket.id === ticketId) ?? null;
  }, [notificationTicketId, tickets]);
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
      {recentlyArchivedTicket && (
        <div className="mx-3 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
          <span>{recentlyArchivedTicket.ticketCode} was canceled.</span>
          <button type="button" disabled={unarchiveTicketMutation.isPending}
            onClick={() => unarchiveTicketMutation.mutate(recentlyArchivedTicket)}
            className="inline-flex items-center gap-2 font-semibold primary-text-color disabled:opacity-50">
            <RotateCcw size={16} /> Resubmit
          </button>
        </div>
      )}
      <div className="flex w-full flex-col gap-3 px-3 pt-3 pb-10 sm:grid sm:grid-cols-2">
        {isLoading && <ManageTicketSkeleton />}
        {!isLoading && paginatedTickets.length === 0 && <p className="col-span-full py-8 text-center secondary-text-color">No tickets found.</p>}
        {!isLoading && paginatedTickets.map((ticket) => {
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
              onArchive={ticket.status.toLowerCase() === "open"
                ? () => setTicketToArchive(ticket)
                : undefined}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className={`px-3 ${isMobile ? "mb-23" : "mb-10"}`}>
          <ResponsivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
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
        description="This open ticket and its related history will be archived. You can resubmit it afterward."
      />
    </>
  );
}
