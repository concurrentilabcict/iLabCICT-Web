import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

import RepairLogDetails from "./RepairLogDetails";
import LogToolbar from "./LogToolbar";
import type { TechnicianFilter } from "./LogToolbar";
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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { buildWebSocketUrl } from "@/lib/api";
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
    assigned_to: {
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
const ADMIN_REPAIR_LOGS_QUERY_KEY = ["admin-repair-logs"] as const;
const ADMIN_REPAIR_LOGS_READY_QUERY_KEY = [
  "admin-repair-logs-ready",
] as const;
const REPAIR_LOGS_WS_ENDPOINT = "/ws/repair-logs/";

type InitialRepairLogsMessage = {
  event: "initial_repair_logs";
  repair_log: ApiRepairLog[];
  next?: string | null;
};

type RepairLogCreatedMessage = {
  event: "repair_log_created";
  repair_log: ApiRepairLog;
};

type RepairLogWebSocketMessage =
  | InitialRepairLogsMessage
  | RepairLogCreatedMessage;

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

const sortByNewest = (
  firstRepairLog: RepairLogType,
  secondRepairLog: RepairLogType
) =>
  Date.parse(secondRepairLog.createdAt) -
  Date.parse(firstRepairLog.createdAt);

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
    assignedTo: {
      id: repairLog.ticket.assigned_to.id,
      firstName: repairLog.ticket.assigned_to.first_name,
      lastName: repairLog.ticket.assigned_to.last_name,
    },
  },
  repairLogCode: repairLog.repair_log_code,
  title: repairLog.title,
  repairNotes: repairLog.repair_notes,
  createdAt: repairLog.created_at,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRepairLogWebSocketMessage = (
  value: unknown
): value is RepairLogWebSocketMessage => {
  if (!isRecord(value) || typeof value.event !== "string") {
    return false;
  }

  if (value.event === "initial_repair_logs") {
    return Array.isArray(value.repair_log);
  }

  return value.event === "repair_log_created" && isRecord(value.repair_log);
};

const upsertRepairLog = (
  repairLogs: RepairLogType[],
  apiRepairLog: ApiRepairLog
) => {
  const repairLog = mapRepairLog(apiRepairLog);
  const existingRepairLog = repairLogs.some((currentRepairLog) =>
    currentRepairLog.id === repairLog.id
  );

  if (!existingRepairLog) {
    return [repairLog, ...repairLogs];
  }

  return repairLogs.map((currentRepairLog) =>
    currentRepairLog.id === repairLog.id ? repairLog : currentRepairLog
  );
};

export default function RepairLog() {
  const queryClient = useQueryClient();
  const repairLogSocketRef = useRef<WebSocket | null>(null);
  const cachedRepairLogsAreReady =
    queryClient.getQueryData<boolean>(ADMIN_REPAIR_LOGS_READY_QUERY_KEY) === true;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
  const [technicianFilter, setTechnicianFilter] =
    useState<TechnicianFilter>("All Technician");
  const [dateFilter, setDateFilter] = useState<Date>();
  const [selectedRepairLog, setSelectedRepairLog] =
    useState<RepairLogType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hasInitialRepairLogs, setHasInitialRepairLogs] =
    useState(cachedRepairLogsAreReady);

  const {
    data: repairLogs = [],
    isPending,
    isError,
  } = useQuery<RepairLogType[]>({
    queryKey: ADMIN_REPAIR_LOGS_QUERY_KEY,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<RepairLogType[]>(
          ADMIN_REPAIR_LOGS_QUERY_KEY
        ) ?? []
      ),
    initialData: () =>
      queryClient.getQueryData<RepairLogType[]>(
        ADMIN_REPAIR_LOGS_QUERY_KEY
      ) ?? [],
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const isLoading = isPending || !hasInitialRepairLogs;

  useEffect(() => {
    let socket: WebSocket | null = null;
    const connectSocket = window.setTimeout(() => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        return;
      }

      socket = new WebSocket(
        buildWebSocketUrl(REPAIR_LOGS_WS_ENDPOINT, { token: accessToken })
      );

      repairLogSocketRef.current = socket;

      socket.addEventListener("message", (event: MessageEvent<string>) => {
        let parsedMessage: unknown;

        try {
          parsedMessage = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!isRepairLogWebSocketMessage(parsedMessage)) {
          return;
        }

        if (parsedMessage.event === "initial_repair_logs") {
          setHasInitialRepairLogs(true);
          queryClient.setQueryData(ADMIN_REPAIR_LOGS_READY_QUERY_KEY, true);
          queryClient.setQueryData<RepairLogType[]>(
            ADMIN_REPAIR_LOGS_QUERY_KEY,
            parsedMessage.repair_log.map(mapRepairLog)
          );
          return;
        }

        queryClient.setQueryData<RepairLogType[]>(
          ADMIN_REPAIR_LOGS_QUERY_KEY,
          (currentRepairLogs = []) =>
            upsertRepairLog(currentRepairLogs, parsedMessage.repair_log)
        );
      });
    }, 0);

    return () => {
      window.clearTimeout(connectSocket);
      socket?.close();

      if (repairLogSocketRef.current === socket) {
        repairLogSocketRef.current = null;
      }
    };
  }, [queryClient]);

  const filteredRepairLogs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return repairLogs.filter((repairLog) => {
      const faculty = `${repairLog.ticket.reportedBy.firstName} ${repairLog.ticket.reportedBy.lastName}`;
      const technician = `${repairLog.ticket.assignedTo.firstName} ${repairLog.ticket.assignedTo.lastName}`;
      const type = formatLabel(repairLog.ticket.type);
      const created = formatDate(repairLog.createdAt);
      const searchableText = [
        repairLog.repairLogCode,
        repairLog.title,
        repairLog.repairNotes,
        faculty,
        technician,
        type,
        created,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery === "" || searchableText.includes(normalizedQuery);
      const matchesType = typeFilter === "All" || type === typeFilter;
      const matchesTechnician =
        technicianFilter === "All Technician" ||
        technician === technicianFilter;
      const matchesDate =
        !dateFilter ||
        new Date(repairLog.createdAt).toDateString() === dateFilter.toDateString();

      return matchesSearch && matchesType && matchesTechnician && matchesDate;
    }).sort(sortByNewest);
  }, [repairLogs, searchQuery, typeFilter, technicianFilter, dateFilter]);

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

  const handleRepairLogClick = (repairLog: RepairLogType) => {
    setSelectedRepairLog(repairLog);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setSelectedRepairLog(null);
    }
  };

  const paginatedRepairLogs = filteredRepairLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
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
        selectedTechnician={technicianFilter}
        onTechnicianChange={(technician) =>
          updateFilter(() => setTechnicianFilter(technician))
        }
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

            {!isLoading && isError && (
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
                const technician = `${repairLog.ticket.assignedTo.firstName} ${repairLog.ticket.assignedTo.lastName}`;

                return (
                  <TableRow
                    key={repairLog.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => handleRepairLogClick(repairLog)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleRepairLogClick(repairLog);
                      }
                    }}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {repairLog.repairLogCode}
                    </TableCell>
                    <TableCell>{faculty}</TableCell>
                    <TableCell>{technician}</TableCell>
                    <TableCell>{formatDate(repairLog.createdAt)}</TableCell>
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
                            aria-label={`Actions for ${repairLog.repairLogCode}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRepairLogClick(repairLog)}
                          >
                            View Repair Log
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

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh]" : "w-[420px]!"}
        >
          {selectedRepairLog && (
            <RepairLogDetails repairLog={selectedRepairLog} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
