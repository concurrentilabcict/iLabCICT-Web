import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

import LogToolbar from "./LogToolbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createApiError, privateFetch } from "@/lib/api";
import type { Ticket } from "@/types/ticket";
import type { StatusFilter, TicketTypeFilter } from "@/utils/ticket";

type ApiTicket = {
  id: number;
  ticket_code: string;
  reported_by: {
    id: number;
    first_name: string;
    last_name: string;
  };
  assigned_to: {
    id: number;
    first_name: string;
    last_name: string;
  };
  room: {
    id: number;
    room_name: string;
    building_name: string;
  };
  computer: {
    id: number;
    computer_code: string;
  };
  type: string;
  title: string;
  complaint_description: string;
  issue_image: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const ITEMS_PER_PAGE = 10;

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

const mapTicket = (ticket: ApiTicket): Ticket => ({
  id: ticket.id,
  ticketCode: ticket.ticket_code,
  reportedBy: {
    id: ticket.reported_by.id,
    firstName: ticket.reported_by.first_name,
    lastName: ticket.reported_by.last_name,
  },
  assignedTo: {
    id: ticket.assigned_to.id,
    firstName: ticket.assigned_to.first_name,
    lastName: ticket.assigned_to.last_name,
  },
  room: {
    id: ticket.room.id,
    roomName: ticket.room.room_name,
    buildingName: ticket.room.building_name,
  },
  computer: {
    id: ticket.computer.id,
    computerCode: ticket.computer.computer_code,
  },
  type: ticket.type,
  title: ticket.title,
  complaintDescription: ticket.complaint_description,
  issueImage: ticket.issue_image,
  status: ticket.status,
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
});

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
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
  const [dateFilter, setDateFilter] = useState<Date>();

  const {
    data: tickets = [],
    isLoading,
    isError,
  } = useQuery<Ticket[]>({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const response = await privateFetch(
        "https://ilabcict-backend.onrender.com/api/tickets/"
      );
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || "Failed to fetch tickets."
        );
      }

      return (data as ApiTicket[]).map(mapTicket);
    },
  });

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const faculty = `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`;
      const technician = `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`;
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
    });
  }, [tickets, searchQuery, statusFilter, typeFilter, dateFilter]);

  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const maxPage = Math.max(totalPages, 1);
  const currentPage = Math.min(page, maxPage);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), maxPage));
  };

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex w-full flex-col gap-4 p-3 mt-5">
      <LogToolbar
        tickets={filteredTickets}
        isLoading={isLoading}
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
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center secondary-text-color"
                >
                  Loading tickets...
                </TableCell>
              </TableRow>
            )}

            {isError && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-red-500"
                >
                  Failed to load tickets.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && paginatedTickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center secondary-text-color"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              paginatedTickets.map((ticket) => {
                const faculty = `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`;
                const technician = `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`;
                const status = formatLabel(ticket.status);

                return (
                  <TableRow key={ticket.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {ticket.ticketCode}
                    </TableCell>
                    <TableCell>{faculty}</TableCell>
                    <TableCell>{technician}</TableCell>
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
                    <TableCell className="text-center">
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
                          <DropdownMenuItem>View Ticket</DropdownMenuItem>
                          <DropdownMenuItem>
                            Assign Technician
                          </DropdownMenuItem>
                          <div className="my-1 h-px w-full bg-border" />
                          <DropdownMenuItem className="text-red-500">
                            Delete Ticket
                          </DropdownMenuItem>
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

            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  isActive={currentPage === index + 1}
                  onClick={() => goToPage(index + 1)}
                >
                  {index + 1}
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
  );
}
