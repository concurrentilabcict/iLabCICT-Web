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
import type { RepairLog as RepairLogType } from "@/types/repairLog";
import type { TicketTypeFilter } from "@/utils/ticket";

type ApiRepairLog = {
  id: number;
  ticket: {
    id: number;
    type: string;
    reported_by: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  repair_log_code: string;
  title: string;
  repair_notes: string;
  created_at: string;
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

const mapRepairLog = (repairLog: ApiRepairLog): RepairLogType => ({
  id: repairLog.id,
  ticket: {
    id: repairLog.ticket.id,
    type: repairLog.ticket.type,
    reportedBy: {
      id: repairLog.ticket.reported_by.id,
      firstName: repairLog.ticket.reported_by.first_name,
      lastName: repairLog.ticket.reported_by.last_name,
    },
  },
  repairLogCode: repairLog.repair_log_code,
  title: repairLog.title,
  repairNotes: repairLog.repair_notes,
  createdAt: repairLog.created_at,
});

export default function RepairLog() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
  const [dateFilter, setDateFilter] = useState<Date>();

  const {
    data: repairLogs = [],
    isLoading,
    isError,
  } = useQuery<RepairLogType[]>({
    queryKey: ["admin-repair-logs"],
    queryFn: async () => {
      const response = await privateFetch(
        "https://ilabcict-backend.onrender.com/api/repair-logs/"
      );
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || "Failed to fetch repair logs."
        );
      }

      return (data as ApiRepairLog[]).map(mapRepairLog);
    },
  });

  const filteredRepairLogs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return repairLogs.filter((repairLog) => {
      const faculty = `${repairLog.ticket.reportedBy.firstName} ${repairLog.ticket.reportedBy.lastName}`;
      const type = formatLabel(repairLog.ticket.type);
      const created = formatDate(repairLog.createdAt);
      const searchableText = [
        repairLog.repairLogCode,
        repairLog.title,
        repairLog.repairNotes,
        faculty,
        type,
        created,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery === "" || searchableText.includes(normalizedQuery);
      const matchesType = typeFilter === "All" || type === typeFilter;
      const matchesDate =
        !dateFilter ||
        new Date(repairLog.createdAt).toDateString() === dateFilter.toDateString();

      return matchesSearch && matchesType && matchesDate;
    });
  }, [repairLogs, searchQuery, typeFilter, dateFilter]);

  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  const totalPages = Math.ceil(filteredRepairLogs.length / ITEMS_PER_PAGE);
  const maxPage = Math.max(totalPages, 1);
  const currentPage = Math.min(page, maxPage);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), maxPage));
  };

  const paginatedRepairLogs = filteredRepairLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="mt-5 flex w-full flex-col gap-4 p-3">
      <LogToolbar
        repairLogs={filteredRepairLogs}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchQueryChange={(query) =>
          updateFilter(() => setSearchQuery(query))
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
              <TableHead className="bg-muted">Repair Log ID</TableHead>
              <TableHead className="bg-muted">Faculty</TableHead>
              <TableHead className="bg-muted">Technician</TableHead>
              <TableHead className="bg-muted">Created</TableHead>
              <TableHead className="bg-muted text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center secondary-text-color"
                >
                  Loading repair logs...
                </TableCell>
              </TableRow>
            )}

            {isError && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-red-500"
                >
                  Failed to load repair logs.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && paginatedRepairLogs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center secondary-text-color"
                >
                  No repair logs found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              paginatedRepairLogs.map((repairLog) => {
                const faculty = `${repairLog.ticket.reportedBy.firstName} ${repairLog.ticket.reportedBy.lastName}`;

                return (
                  <TableRow key={repairLog.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {repairLog.repairLogCode}
                    </TableCell>
                    <TableCell>{faculty}</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>{formatDate(repairLog.createdAt)}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Actions for ${repairLog.repairLogCode}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Repair Log</DropdownMenuItem>
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
