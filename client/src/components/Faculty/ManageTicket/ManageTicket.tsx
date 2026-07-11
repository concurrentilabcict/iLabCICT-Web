import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createApiError, privateFetch } from "@/lib/api";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ApiTicket, Ticket } from "@/types/ticket";
import type { Status, StatusFilter, TicketType, TicketTypeFilter } from "@/utils/ticket";
import ManageTicketCard from "./ManageTicketCard";
import TicketDetails from "./TicketDetails";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type ManageTicketProps = {
  statusFilter: StatusFilter;
  typeFilter: TicketTypeFilter;
  searchQuery: string;
};

const ITEMS_PER_PAGE = 10;

const formatLabel = (text: string) => text
  .replace(/_/g, " ")
  .trim()
  .split(/\s+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(" ");

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

export default function ManageTicket({ statusFilter, typeFilter, searchQuery }: ManageTicketProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await privateFetch("https://ilabcict-backend.onrender.com/api/tickets/");
      const data = await res.json();

      if (!res.ok) {
        throw createApiError(res.status, data.message || "Failed to fetch tickets.");
      }

      return (data as ApiTicket[]).map(mapTicket);
    },
  });

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return [...tickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((ticket) => {
        const status = formatLabel(ticket.status) as Status;
        const type = formatLabel(ticket.type) as TicketType;
        const searchableText = [
          ticket.ticketCode, ticket.title, ticket.complaintDescription,
          ticket.reportedBy.firstName, ticket.reportedBy.lastName,
          ticket.assignedTo.firstName, ticket.assignedTo.lastName,
          ticket.room.buildingName, ticket.room.roomName, ticket.computer.computerCode,
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
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const openTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="flex w-full flex-col gap-3 px-3 pt-3 pb-10 sm:grid sm:grid-cols-2">
        {isLoading && <p className="col-span-full py-8 text-center secondary-text-color">Loading tickets...</p>}
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
              assignedTo={`${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`.trim()}
              room={`${formatLabel(ticket.room.buildingName)}, ${ticket.room.roomName}`}
              computerCode={ticket.computer.computerCode}
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[90vh]" : "w-[1000px]!"}>
          {selectedTicket && <TicketDetails ticket={selectedTicket} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
