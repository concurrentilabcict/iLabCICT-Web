import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className={`px-3 ${isMobile ? "mb-23" : "mb-10"}`}>
          <Pagination className={`flex ${isMobile ? "justify-center" : "justify-end"}`}>
            <PaginationContent>
              <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, currentPage - 1))} /></PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink isActive={currentPage === pageNumber} onClick={() => setPage(pageNumber)}>{pageNumber}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem><PaginationNext onClick={() => setPage(Math.min(totalPages, currentPage + 1))} /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Sheet open={sheetOpen || Boolean(notificationTicket)} onOpenChange={handleSheetOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[90vh]" : "w-[1000px]!"}>
          {selectedTicket && <TicketDetails ticket={selectedTicket} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
