import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MoreHorizontal, Search, X } from "lucide-react";

import TicketDetails from "./TicketDetails";
import placeholderPicture from "@/assets/profile-placeholder.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
import type { TicketTypeFilter } from "@/utils/ticket";

type ApiTicket = {
  id: number;
  ticket_code: string;
  reported_by: {
    id: number;
    first_name: string;
    last_name: string;
    profileImage?: string;
    profile_image?: string;
  };
  assigned_to: {
    id: number;
    first_name: string;
    last_name: string;
    profileImage?: string;
    profile_image?: string;
  };
  room: {
    id: number;
    room_name: string;
    building_name: string;
    floor_number: number;
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

const TICKETS_URL = "https://ilabcict-backend.onrender.com/api/tickets/";
const RECENT_LIMIT = 8;
const typeOptions: TicketTypeFilter[] = ["All", "Request", "Report"];

const formatLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

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

const sortByLatestUpdate = (firstTicket: Ticket, secondTicket: Ticket) =>
  Date.parse(secondTicket.updatedAt) - Date.parse(firstTicket.updatedAt);

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
    id: ticket.assigned_to.id,
    firstName: ticket.assigned_to.first_name,
    lastName: ticket.assigned_to.last_name,
    profileImage:
      ticket.assigned_to.profileImage ?? ticket.assigned_to.profile_image ?? "",
  },
  room: {
    id: ticket.room.id,
    roomName: ticket.room.room_name,
    buildingName: ticket.room.building_name,
    floorNumber: ticket.room.floor_number,
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

async function fetchTickets() {
  const response = await privateFetch(TICKETS_URL);
  const data = await response.json();

  if (!response.ok) {
    throw createApiError(
      response.status,
      data.message || "Failed to fetch recent tickets."
    );
  }

  return (data as ApiTicket[]).map(mapTicket);
}

const getProfilePicture = (profileImage?: string) =>
  profileImage?.trim() ? profileImage : placeholderPicture;

export default function RecentTicket() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: tickets = [],
    isLoading,
    isError,
  } = useQuery<Ticket[]>({
    queryKey: ["admin-dashboard-recent-tickets"],
    queryFn: fetchTickets,
    staleTime: 60_000,
  });

  const recentTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tickets
      .filter((ticket) => {
        const faculty = `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`;
        const type = formatLabel(ticket.type);
        const status = formatLabel(ticket.status);
        const searchableText = [
          ticket.ticketCode,
          faculty,
          type,
          status,
          ticket.title,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          normalizedQuery === "" || searchableText.includes(normalizedQuery);
        const matchesType = typeFilter === "All" || type === typeFilter;

        return matchesSearch && matchesType;
      })
      .sort(sortByLatestUpdate)
      .slice(0, RECENT_LIMIT);
  }, [tickets, searchQuery, typeFilter]);

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
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

  return (
    <>
      <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-800">
            Recent Tickets
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[220px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tickets..."
                className="primary-border-color w-full rounded-xl border bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-black!"
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="secondary-text-color absolute right-3 top-1/2 -translate-y-1/2 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Popover open={openFilter} onOpenChange={setOpenFilter}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="primary-border-color flex min-w-32 cursor-pointer items-center justify-between gap-x-4 rounded-xl border bg-white px-3 py-2 text-sm"
                >
                  <span>{typeFilter === "All" ? "All Type" : typeFilter}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      openFilter ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-48 rounded-3xl p-1">
                <Command>
                  <CommandInput placeholder="Type" />
                  <CommandList>
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup className="p-2">
                      {typeOptions.map((type) => (
                        <CommandItem
                          key={type}
                          onSelect={() => {
                            setTypeFilter(type);
                            setOpenFilter(false);
                          }}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                            typeFilter === type
                              ? "bg-muted data-selected:bg-muted"
                              : ""
                          }`}
                        >
                          <Checkbox checked={typeFilter === type} />
                          <span>{type}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-color bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted">Ticket ID</TableHead>
                <TableHead className="bg-muted">Faculty</TableHead>
                <TableHead className="bg-muted">Type</TableHead>
                <TableHead className="bg-muted">Status</TableHead>
                <TableHead className="bg-muted text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center secondary-text-color"
                  >
                    Loading tickets...
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-red-500">
                    Failed to load tickets.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && recentTickets.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center secondary-text-color"
                  >
                    No tickets found.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                !isError &&
                recentTickets.map((ticket) => {
                  const faculty = `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`;
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
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {ticket.ticketCode}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={getProfilePicture(ticket.reportedBy.profileImage)}
                            alt={faculty}
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                          <span className="truncate">{faculty}</span>
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
                              View Ticket
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
      </section>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh]" : "w-[520px]!"}
        >
          {selectedTicket && <TicketDetails ticket={selectedTicket} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
