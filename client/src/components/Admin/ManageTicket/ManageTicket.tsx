import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Eye, MoreHorizontal, RotateCcw, UserRoundCog } from "lucide-react";

import AssignTechnicianDialog, {
  type AssignableTechnician,
} from "./AssignTechnicianDialog/AssignTechnicianDialog";
import ArchiveTicketDialog from "./ArchiveTicketDialog/ArchiveTicketDialog";
import ConfirmTicketReassignment from "@/components/ConfirmTicketReassignment/ConfirmTicketReassignment";
import TicketDetails from "./TicketDetails";
import TicketToolbar from "./TicketToolbar";
import ProfileAvatar from "@/components/ProfileAvatar/ProfileAvatar";
import { useAdminUserDirectory } from "@/hooks/useAdminUserDirectory";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableSkeleton from "@/components/TableSkeleton/TableSkeleton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  buildApiUrl,
  buildWebSocketUrl,
  createApiError,
  getFreshAccessToken,
  privateFetch,
  type ApiError,
} from "@/lib/api";
import type { ApiTicket, Ticket } from "@/types/ticket";
import { getPaginationWindow } from "@/utils/pagination";
import type { StatusFilter, TicketTypeFilter } from "@/utils/ticket";
import { appToast } from "@/utils/appToast";

const ITEMS_PER_PAGE = 10;
const ADMIN_TICKETS_QUERY_KEY = ["admin-tickets"] as const;
const ADMIN_TICKETS_READY_QUERY_KEY = ["admin-tickets-ready"] as const;
const ADMIN_ARCHIVED_TICKETS_QUERY_KEY = ["admin-archived-tickets"] as const;
const TICKETS_WS_ENDPOINT = "/ws/tickets/";

type TicketView = "active" | "archived";

type InitialTicketsMessage = {
  event: "initial_tickets";
  ticket: ApiTicket[];
  next?: string | null;
};

type TicketChangeMessage = {
  event: "ticket_created" | "ticket_updated" | "ticket_reassigned";
  ticket: ApiTicket;
};

type TicketArchivedMessage = {
  event: "ticket_archived";
  ticket?: ApiTicket;
  ticket_id?: number;
  id?: number;
};

type TicketUnarchivedMessage = {
  event: "ticket_unarchived";
  ticket?: ApiTicket;
  ticket_id?: number;
  id?: number;
};

type TicketWebSocketMessage =
  | InitialTicketsMessage
  | TicketChangeMessage
  | TicketArchivedMessage
  | TicketUnarchivedMessage;

type ApiTechnician = {
  id: number;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  role: string;
  isActive?: boolean;
  is_active?: boolean;
};

const formatLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const sortByNewest = (firstTicket: Ticket, secondTicket: Ticket) =>
  Date.parse(secondTicket.createdAt) - Date.parse(firstTicket.createdAt);

const formatName = (
  firstName?: string | null, 
  lastName?: string | null
) => {
  const name = [firstName, lastName]
    .filter(Boolean)
    .join(" ");

    return name || "Unassigned"
}

const mapTicket = (ticket: ApiTicket): Ticket => ({
  id: ticket.id,
  ticketCode: ticket.ticket_code,
  reportedBy: {
    id: ticket.reported_by.id,
    firstName: ticket.reported_by.first_name,
    lastName: ticket.reported_by.last_name,
    profileImage:
      ticket.reported_by.profileImage ?? ticket.reported_by.profile_image ?? "",
  },
  assignedTo: {
    id: ticket.assigned_to?.id ?? 0,
    firstName: ticket.assigned_to?.first_name ?? "Unassigned",
    lastName: ticket.assigned_to?.last_name ?? "",
    profileImage:
      ticket.assigned_to?.profileImage ?? ticket.assigned_to?.profile_image ?? "",
  },
  room: {
    id: ticket.room.id,
    roomName: ticket.room.room_name,
    buildingName: ticket.room.building_name,
    floorNumber: ticket.room.floor_number,
  },
  computer: {
    id: ticket.computer?.id ?? 0,
    computerCode: ticket.computer?.computer_code ?? "N/A",
  },
  type: ticket.type,
  title: ticket.title,
  complaintDescription: ticket.complaint_description,
  issueImage: ticket.issue_image,
  status: ticket.status,
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
});

const mapArchivedTicket = (ticket: ApiTicket): Ticket => ({
  ...mapTicket(ticket),
  status: "archived",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getResponseMessage = (value: unknown) => {
  if (!isRecord(value)) {
    return null;
  }

  return typeof value.message === "string"
    ? value.message
    : typeof value.detail === "string"
      ? value.detail
      : null;
};

const getTechniciansFromResponse = (
  data: ApiTechnician[] | { results?: ApiTechnician[] }
) => Array.isArray(data) ? data : data.results ?? [];

const getTicketsFromResponse = (
  data: ApiTicket[] | { results?: ApiTicket[]; ticket?: ApiTicket[] }
) => Array.isArray(data) ? data : data.results ?? data.ticket ?? [];

const mapTechnician = (technician: ApiTechnician): AssignableTechnician => ({
  id: technician.id,
  firstName: technician.firstName ?? technician.first_name ?? "",
  lastName: technician.lastName ?? technician.last_name ?? "",
});

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

const upsertMappedTicket = (tickets: Ticket[], ticket: Ticket) => {
  const existingTicket = tickets.some((currentTicket) =>
    currentTicket.id === ticket.id
  );

  if (!existingTicket) {
    return [ticket, ...tickets];
  }

  return tickets.map((currentTicket) =>
    currentTicket.id === ticket.id ? ticket : currentTicket
  );
};

const upsertTicket = (tickets: Ticket[], apiTicket: ApiTicket) =>
  upsertMappedTicket(tickets, mapTicket(apiTicket));

const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-700";
    case "ongoing":
      return "bg-yellow-100 text-yellow-700";
    case "resolved":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function ManageTicket() {
  const getProfileImage = useAdminUserDirectory();
  const queryClient = useQueryClient();
  const ticketSocketRef = useRef<WebSocket | null>(null);
  const cachedTicketsAreReady =
    queryClient.getQueryData<boolean>(ADMIN_TICKETS_READY_QUERY_KEY) === true;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [ticketView, setTicketView] = useState<TicketView>("active");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
  const [dateFilter, setDateFilter] = useState<Date>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assignmentTicket, setAssignmentTicket] = useState<Ticket | null>(null);
  const [pendingReassignment, setPendingReassignment] = useState<{
    ticket: Ticket;
    technicianId: number;
  } | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<
    number | null
  >(null);
  const [ticketToArchive, setTicketToArchive] = useState<Ticket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hasInitialTickets, setHasInitialTickets] =
    useState(cachedTicketsAreReady);

  const {
    data: tickets = [],
    isPending,
    isError,
  } = useQuery<Ticket[]>({
    queryKey: ADMIN_TICKETS_QUERY_KEY,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<Ticket[]>(ADMIN_TICKETS_QUERY_KEY) ?? []
      ),
    initialData: () =>
      queryClient.getQueryData<Ticket[]>(ADMIN_TICKETS_QUERY_KEY) ?? [],
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const isLoading = isPending || !hasInitialTickets;

  const {
    data: archivedTickets = [],
    isLoading: archivedTicketsAreLoading,
    isError: archivedTicketsHaveError,
  } = useQuery<Ticket[]>({
    queryKey: ADMIN_ARCHIVED_TICKETS_QUERY_KEY,
    queryFn: async () => {
      const response = await privateFetch(
        buildApiUrl("/api/tickets/archive/")
      );
      const data = (await response.json()) as
        | ApiTicket[]
        | { results?: ApiTicket[]; ticket?: ApiTicket[]; detail?: string };

      if (!response.ok) {
        throw createApiError(
          response.status,
          getResponseMessage(data) ?? "Failed to load archived tickets."
        );
      }

      return getTicketsFromResponse(data).map(mapArchivedTicket);
    },
    enabled: ticketView === "archived",
    staleTime: 30_000,
  });

  const {
    data: technicians = [],
    isLoading: techniciansAreLoading,
    isError: techniciansHaveError,
  } = useQuery<AssignableTechnician[]>({
    queryKey: ["admin-ticket-technicians"],
    queryFn: async () => {
      const response = await privateFetch(buildApiUrl("/api/users/"));
      const data = (await response.json()) as
        | ApiTechnician[]
        | { results?: ApiTechnician[] };

      if (!response.ok) {
        throw createApiError(
          response.status,
          getResponseMessage(data) ?? "Failed to load technicians."
        );
      }

      return getTechniciansFromResponse(data)
        .filter((user) =>
          user.role.toLowerCase() === "technician" &&
          (user.isActive ?? user.is_active ?? true)
        )
        .map(mapTechnician)
        .sort((first, second) =>
          `${first.firstName} ${first.lastName}`.localeCompare(
            `${second.firstName} ${second.lastName}`
          )
        );
    },
    enabled: assignmentTicket !== null,
  });

  const assignTechnicianMutation = useMutation({
    mutationFn: async ({
      ticketId,
      technicianId,
    }: {
      ticketId: number;
      technicianId: number;
    }) => {
      const response = await privateFetch(
        buildApiUrl(`/api/tickets/${ticketId}/reassign/`),
        {
          method: "POST",
          body: JSON.stringify({ assigned_to: technicianId }),
        }
      );
      const data = (await response.json().catch(() => null)) as {
        detail?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw createApiError(
          response.status,
          data?.detail ?? data?.message ?? "Failed to assign technician."
        );
      }

      return { ticketId, technicianId };
    },
    onSuccess: ({ ticketId, technicianId }) => {
      const technician = technicians.find((user) => user.id === technicianId);
      const updateTicket = (currentTickets: Ticket[] = []) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                assignedTo: technician
                  ? {
                      id: technician.id,
                      firstName: technician.firstName,
                      lastName: technician.lastName,
                    }
                  : ticket.assignedTo,
              }
            : ticket
        );

      queryClient.setQueryData<Ticket[]>(
        ADMIN_TICKETS_QUERY_KEY,
        updateTicket
      );
      queryClient.setQueryData<Ticket[]>(
        ["admin-dashboard-tickets"],
        updateTicket
      );
      setSelectedTicket((currentTicket) =>
        currentTicket?.id === ticketId
          ? updateTicket([currentTicket])[0]
          : currentTicket
      );
      setAssignmentTicket(null);
      setPendingReassignment(null);
      setSelectedTechnicianId(null);
      appToast.success("Technician assigned successfully.");
    },
    onError: (error: ApiError) => {
      appToast.error(
        error.message || "We couldn't assign the technician. Please try again."
      );
    },
  });

  const archiveTicketMutation = useMutation({
    mutationFn: async (ticket: Ticket) => {
      const response = await privateFetch(
        buildApiUrl(`/api/tickets/${ticket.id}/archive/`),
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw createApiError(
          response.status,
          getResponseMessage(data) ?? "Failed to archive ticket."
        );
      }

      return ticket;
    },
    onSuccess: (archivedTicket) => {
      const archivedTicketForCache: Ticket = {
        ...archivedTicket,
        status: "archived",
      };
      const removeTicket = (currentTickets: Ticket[] = []) =>
        currentTickets.filter((ticket) => ticket.id !== archivedTicket.id);

      queryClient.setQueryData<Ticket[]>(
        ADMIN_TICKETS_QUERY_KEY,
        removeTicket
      );
      queryClient.setQueryData<Ticket[]>(
        ["admin-dashboard-tickets"],
        removeTicket
      );
      queryClient.setQueryData<Ticket[]>(
        ADMIN_ARCHIVED_TICKETS_QUERY_KEY,
        (currentTickets = []) =>
          currentTickets.some((ticket) => ticket.id === archivedTicket.id)
            ? currentTickets
            : [archivedTicketForCache, ...currentTickets]
      );
      void queryClient.invalidateQueries({
        queryKey: ADMIN_ARCHIVED_TICKETS_QUERY_KEY,
      });
      setSelectedTicket((currentTicket) =>
        currentTicket?.id === archivedTicket.id ? null : currentTicket
      );
      setSheetOpen(false);
      setTicketToArchive(null);
      appToast.success("Ticket archived successfully.");
    },
    onError: (error: ApiError) => {
      appToast.error(
        error.message || "We couldn't archive the ticket. Please try again."
      );
    },
  });

  const unarchiveTicketMutation = useMutation({
    mutationFn: async (ticket: Ticket) => {
      const response = await privateFetch(
        buildApiUrl(`/api/tickets/${ticket.id}/unarchive/`),
        { method: "POST", body: JSON.stringify({}) }
      );

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw createApiError(
          response.status,
          getResponseMessage(data) ?? "Failed to unarchive ticket."
        );
      }

      return ticket;
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData<Ticket[]>(
        ADMIN_ARCHIVED_TICKETS_QUERY_KEY,
        (currentTickets = []) => currentTickets.filter((item) => item.id !== ticket.id)
      );
      queryClient.setQueryData<Ticket[]>(
        ADMIN_TICKETS_QUERY_KEY,
        (currentTickets = []) => upsertMappedTicket(currentTickets, { ...ticket, status: "open" })
      );
      queryClient.setQueryData<Ticket[]>(
        ["admin-dashboard-tickets"],
        (currentTickets = []) => upsertMappedTicket(currentTickets, { ...ticket, status: "open" })
      );
      void queryClient.invalidateQueries({ queryKey: ADMIN_ARCHIVED_TICKETS_QUERY_KEY });
      setSelectedTicket(null);
      setSheetOpen(false);
      appToast.success("Ticket unarchived successfully.");
    },
    onError: (error: ApiError) => {
      appToast.error(error.message || "We couldn't unarchive the ticket. Please try again.");
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

      socket.addEventListener("message", async (event: MessageEvent<string>) => {
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
          setHasInitialTickets(true);
          queryClient.setQueryData(ADMIN_TICKETS_READY_QUERY_KEY, true);
          queryClient.setQueryData<Ticket[]>(
            ADMIN_TICKETS_QUERY_KEY,
            parsedMessage.ticket.map(mapTicket)
          );
          return;
        }

        if (parsedMessage.event === "ticket_archived") {
          const archivedTicket = parsedMessage.ticket
            ? mapArchivedTicket(parsedMessage.ticket)
            : null;
          const archivedTicketId =
            archivedTicket?.id ?? parsedMessage.ticket_id ?? parsedMessage.id;

          if (archivedTicketId === undefined) {
            return;
          }

          const removeArchivedTicket = (currentTickets: Ticket[] = []) =>
            currentTickets.filter((ticket) => ticket.id !== archivedTicketId);

          queryClient.setQueryData<Ticket[]>(
            ADMIN_TICKETS_QUERY_KEY,
            removeArchivedTicket
          );
          queryClient.setQueryData<Ticket[]>(
            ["admin-dashboard-tickets"],
            removeArchivedTicket
          );

          if (archivedTicket) {
            queryClient.setQueryData<Ticket[]>(
              ADMIN_ARCHIVED_TICKETS_QUERY_KEY,
              (currentTickets = []) =>
                currentTickets.some((ticket) => ticket.id === archivedTicket.id)
                  ? currentTickets
                  : [archivedTicket, ...currentTickets]
            );
          } else {
            void queryClient.invalidateQueries({
              queryKey: ADMIN_ARCHIVED_TICKETS_QUERY_KEY,
            });
          }

          setSelectedTicket((currentTicket) => {
            if (currentTicket?.id !== archivedTicketId) {
              return currentTicket;
            }

            setSheetOpen(false);
            return null;
          });
          return;
        }

        if (parsedMessage.event === "ticket_unarchived") {
          const ticketId = parsedMessage.ticket?.id ?? parsedMessage.ticket_id ?? parsedMessage.id;
          if (ticketId === undefined) return;

          const cachedTicket = queryClient.getQueryData<Ticket[]>(
            ADMIN_ARCHIVED_TICKETS_QUERY_KEY
          )?.find((ticket) => ticket.id === ticketId);
          const restoredTicket = parsedMessage.ticket
            ? mapTicket(parsedMessage.ticket)
            : cachedTicket
              ? { ...cachedTicket, status: "open" }
              : null;

          queryClient.setQueryData<Ticket[]>(
            ADMIN_ARCHIVED_TICKETS_QUERY_KEY,
            (currentTickets = []) => currentTickets.filter((ticket) => ticket.id !== ticketId)
          );
          void queryClient.invalidateQueries({ queryKey: ADMIN_ARCHIVED_TICKETS_QUERY_KEY });

          if (restoredTicket) {
            queryClient.setQueryData<Ticket[]>(
              ADMIN_TICKETS_QUERY_KEY,
              (currentTickets = []) => upsertMappedTicket(currentTickets, restoredTicket)
            );
            queryClient.setQueryData<Ticket[]>(
              ["admin-dashboard-tickets"],
              (currentTickets = []) => upsertMappedTicket(currentTickets, restoredTicket)
            );
          } else {
            const response = await privateFetch(buildApiUrl(`/api/tickets/${ticketId}/`));
            if (response.ok) {
              const ticket = mapTicket(await response.json() as ApiTicket);
              queryClient.setQueryData<Ticket[]>(
                ADMIN_TICKETS_QUERY_KEY,
                (currentTickets = []) => upsertMappedTicket(currentTickets, ticket)
              );
              queryClient.setQueryData<Ticket[]>(
                ["admin-dashboard-tickets"],
                (currentTickets = []) => upsertMappedTicket(currentTickets, ticket)
              );
            }
          }
          return;
        }

        if (parsedMessage.ticket.status.toLowerCase() === "archived") {
          const ticketId = parsedMessage.ticket.id;
          queryClient.setQueryData<Ticket[]>(
            ADMIN_TICKETS_QUERY_KEY,
            (currentTickets = []) => currentTickets.filter((ticket) => ticket.id !== ticketId)
          );
          void queryClient.invalidateQueries({ queryKey: ADMIN_ARCHIVED_TICKETS_QUERY_KEY });
          return;
        }

        queryClient.setQueryData<Ticket[]>(
          ADMIN_TICKETS_QUERY_KEY,
          (currentTickets = []) =>
            upsertTicket(currentTickets, parsedMessage.ticket)
        );

        setSelectedTicket((currentTicket) => {
          if (currentTicket?.id !== parsedMessage.ticket.id) {
            return currentTicket;
          }

          return mapTicket(parsedMessage.ticket);
        });
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

  const archivedTicketIds = new Set(archivedTickets.map((ticket) => ticket.id));
  const visibleTickets = ticketView === "active"
    ? tickets.filter((ticket) => ticket.status.toLowerCase() !== "archived" && !archivedTicketIds.has(ticket.id))
    : archivedTickets;
  const ticketsAreLoading =
    ticketView === "active" ? isLoading : archivedTicketsAreLoading;
  const ticketsHaveError =
    ticketView === "active" ? isError : archivedTicketsHaveError;

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return visibleTickets.filter((ticket) => {
      const faculty = formatName(
        ticket.reportedBy.firstName,
        ticket.reportedBy.lastName
      );
      const technician = formatName(
        ticket.assignedTo?.firstName,
        ticket.assignedTo?.lastName
      )
      const type = formatLabel(ticket.type);
      const status = formatLabel(ticket.status);
      const created = formatDate(ticket.createdAt);
      const searchableText = [
        ticket.ticketCode,
        faculty,
        technician,
        type,
        status,
        created,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery === "" || searchableText.includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "All" || status === statusFilter;
      const matchesType = typeFilter === "All" || type === typeFilter;
      const matchesDate =
        !dateFilter ||
        new Date(ticket.createdAt).toDateString() === dateFilter.toDateString();

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    }).sort(sortByNewest);
  }, [visibleTickets, searchQuery, statusFilter, typeFilter, dateFilter]);

  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  const handleTicketViewChange = (view: TicketView) => {
    setTicketView(view);
    setPage(1);
    setStatusFilter("All");
    setSelectedTicket(null);
    setSheetOpen(false);
  };

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const maxPage = Math.max(totalPages, 1);
  const currentPage = Math.min(page, maxPage);
  const visiblePages = getPaginationWindow(currentPage, totalPages);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), maxPage));
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setSelectedTicket(null);
    }
  };

  const handleAssignTechnician = (ticket: Ticket) => {
    setAssignmentTicket(ticket);
    setSelectedTechnicianId(
      ticket.assignedTo?.id && ticket.assignedTo.id > 0
        ? ticket.assignedTo.id
        : null
    );
  };

  const handleAssignmentDialogOpenChange = (open: boolean) => {
    if (!open && !assignTechnicianMutation.isPending) {
      setAssignmentTicket(null);
      setSelectedTechnicianId(null);
    }
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentTicket || selectedTechnicianId === null) {
      return;
    }

    if ((assignmentTicket.assignedTo?.id ?? 0) > 0 &&
      assignmentTicket.assignedTo?.id !== selectedTechnicianId) {
      setPendingReassignment({ ticket: assignmentTicket, technicianId: selectedTechnicianId });
      setAssignmentTicket(null);
      return;
    }

    assignTechnicianMutation.mutate({
      ticketId: assignmentTicket.id,
      technicianId: selectedTechnicianId,
    });
  };

  const handleArchiveDialogOpenChange = (open: boolean) => {
    if (!open && !archiveTicketMutation.isPending) {
      setTicketToArchive(null);
    }
  };

  const handleArchiveTicket = () => {
    if (!ticketToArchive) {
      return;
    }

    archiveTicketMutation.mutate(ticketToArchive);
  };

  const reassignmentTechnician = technicians.find(
    (user) => user.id === pendingReassignment?.technicianId
  );

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="mt-5 flex w-full flex-col gap-4 p-3">
      <TicketToolbar
        tickets={filteredTickets}
        isLoading={ticketsAreLoading}
        ticketView={ticketView}
        onTicketViewChange={handleTicketViewChange}
        searchQuery={searchQuery}
        onSearchQueryChange={(query) =>
          updateFilter(() => setSearchQuery(query))
        }
        selectedStatus={statusFilter}
        onStatusChange={(status) =>
          updateFilter(() => setStatusFilter(status))
        }
        selectedType={typeFilter}
        onTypeChange={(type) => updateFilter(() => setTypeFilter(type))}
        selectedDate={dateFilter}
        onDateChange={(date) => updateFilter(() => setDateFilter(date))}
      />

      <div className="overflow-hidden rounded-2xl border border-primary-color bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted">Ticket ID</TableHead>
              <TableHead className="bg-muted">Faculty</TableHead>
              <TableHead className="bg-muted">Technician</TableHead>
              <TableHead className="bg-muted">Type</TableHead>
              <TableHead className="bg-muted">Status</TableHead>
              <TableHead className="bg-muted">Created</TableHead>
              <TableHead className="bg-muted text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {ticketsAreLoading && (
              <TableSkeleton columns={7} />
            )}

            {!ticketsAreLoading && ticketsHaveError && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-red-500"
                >
                  Failed to load {ticketView} tickets.
                </TableCell>
              </TableRow>
            )}

            {!ticketsAreLoading && !ticketsHaveError && paginatedTickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center secondary-text-color"
                >
                  No {ticketView} tickets found.
                </TableCell>
              </TableRow>
            )}

            {!ticketsAreLoading &&
              !ticketsHaveError &&
              paginatedTickets.map((ticket) => {
                const faculty = formatName(
                  ticket.reportedBy.firstName,
                  ticket.reportedBy.lastName
                );
                const technician = formatName(
                  ticket.assignedTo?.firstName,
                  ticket.assignedTo?.lastName
                );
                const status = formatLabel(ticket.status);

                return (
                  <TableRow
                    key={ticket.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => handleTicketClick(ticket)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleTicketClick(ticket);
                      }
                    }}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {ticket.ticketCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <ProfileAvatar
                          src={getProfileImage(ticket.reportedBy.id) ?? ticket.reportedBy.profileImage ?? null}
                          alt={faculty}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                        <span className="truncate">{faculty}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <ProfileAvatar
                          src={getProfileImage(ticket.assignedTo?.id) ?? ticket.assignedTo?.profileImage ?? null}
                          alt={technician || ""}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                        <span className="truncate">{technician}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatLabel(ticket.type)}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
                          ticket.status
                        )}`}
                      >
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell
                      className="text-center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Actions for ${ticket.ticketCode}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleTicketClick(ticket)}
                          >
                            <Eye className="size-4" />
                            View Ticket
                          </DropdownMenuItem>
                          {ticketView === "active" && (
                            <>
                              {(["open", "ongoing"].includes(ticket.status.toLowerCase())) && (
                                <DropdownMenuItem
                                  onClick={() => handleAssignTechnician(ticket)}
                                >
                                  <UserRoundCog className="size-4" />
                                  Assign Technician
                                </DropdownMenuItem>
                              )}
                              {ticket.status.toLowerCase() === "open" && (
                                <>
                                  <div className="my-1 h-px w-full bg-border" />
                                  <DropdownMenuItem
                                    onClick={() => setTicketToArchive(ticket)}
                                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                  >
                                    <Archive className="size-4" />
                                    Archive Ticket
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                          {ticketView === "archived" && (
                            <DropdownMenuItem
                              onClick={() => unarchiveTicketMutation.mutate(ticket)}
                              disabled={unarchiveTicketMutation.isPending}
                            >
                              <RotateCcw className="size-4" />
                              Unarchive Ticket
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          className={`flex ${isMobile ? "justify-center" : "justify-end"}`}
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
              />
            </PaginationItem>

            {visiblePages.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={currentPage === pageNumber}
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh]" : "w-[520px]!"}
        >
          {selectedTicket && <TicketDetails ticket={selectedTicket} />}
        </SheetContent>
      </Sheet>

      <AssignTechnicianDialog
        open={assignmentTicket !== null}
        onOpenChange={handleAssignmentDialogOpenChange}
        ticketCode={assignmentTicket?.ticketCode}
        technicians={technicians}
        selectedTechnicianId={selectedTechnicianId}
        onSelectTechnician={setSelectedTechnicianId}
        onAssign={handleAssignmentSubmit}
        isLoading={techniciansAreLoading}
        isError={techniciansHaveError}
        isPending={assignTechnicianMutation.isPending}
      />

      <ConfirmTicketReassignment
        open={pendingReassignment !== null}
        onOpenChange={(open) => { if (!open) setPendingReassignment(null); }}
        onConfirm={() => {
          if (pendingReassignment) assignTechnicianMutation.mutate({
            ticketId: pendingReassignment.ticket.id,
            technicianId: pendingReassignment.technicianId,
          });
        }}
        isPending={assignTechnicianMutation.isPending}
        ticketCode={pendingReassignment?.ticket.ticketCode}
        currentTechnician={pendingReassignment
          ? `${pendingReassignment.ticket.assignedTo?.firstName ?? ""} ${pendingReassignment.ticket.assignedTo?.lastName ?? ""}`.trim()
          : undefined}
        nextTechnician={reassignmentTechnician
          ? `${reassignmentTechnician.firstName} ${reassignmentTechnician.lastName}`.trim()
          : undefined}
      />

      <ArchiveTicketDialog
        open={ticketToArchive !== null}
        onOpenChange={handleArchiveDialogOpenChange}
        onArchive={handleArchiveTicket}
        isPending={archiveTicketMutation.isPending}
      />
    </>
  );
}
