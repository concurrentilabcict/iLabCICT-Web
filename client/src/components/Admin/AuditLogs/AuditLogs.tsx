import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildWebSocketUrl } from "@/lib/api";
import AuditLogsTable from "./AuditLogsTable";
import AuditLogsToolbar from "./AuditLogsToolbar";
import {
  formatDateTime,
  isAuditLogWebSocketMessage,
  mapAuditLog,
  sortByNewest,
  upsertAuditLog,
} from "./auditLogUtils";
import type { AuditLog } from "@/types/auditLog";

const ITEMS_PER_PAGE = 10;
const ADMIN_AUDIT_LOGS_QUERY_KEY = ["admin-audit-logs"] as const;
const ADMIN_AUDIT_LOGS_READY_QUERY_KEY = ["admin-audit-logs-ready"] as const;
const AUDIT_LOGS_WS_ENDPOINT = "/ws/audit-logs/";

export default function AuditLogs() {
  const queryClient = useQueryClient();
  const auditLogSocketRef = useRef<WebSocket | null>(null);
  const cachedAuditLogsAreReady =
    queryClient.getQueryData<boolean>(ADMIN_AUDIT_LOGS_READY_QUERY_KEY) === true;
  const [hasInitialAuditLogs, setHasInitialAuditLogs] =
    useState(cachedAuditLogsAreReady);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: auditLogs = [],
    isPending,
    isError,
  } = useQuery<AuditLog[]>({
    queryKey: ADMIN_AUDIT_LOGS_QUERY_KEY,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<AuditLog[]>(ADMIN_AUDIT_LOGS_QUERY_KEY) ?? []
      ),
    initialData: () =>
      queryClient.getQueryData<AuditLog[]>(ADMIN_AUDIT_LOGS_QUERY_KEY) ?? [],
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const isLoading = isPending || !hasInitialAuditLogs;

  useEffect(() => {
    let socket: WebSocket | null = null;
    const connectSocket = window.setTimeout(() => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        return;
      }

      socket = new WebSocket(
        buildWebSocketUrl(AUDIT_LOGS_WS_ENDPOINT, { token: accessToken })
      );

      auditLogSocketRef.current = socket;

      socket.addEventListener("message", (event: MessageEvent<string>) => {
        let parsedMessage: unknown;

        try {
          parsedMessage = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!isAuditLogWebSocketMessage(parsedMessage)) {
          return;
        }

        if (
          parsedMessage.event === "initial_audit_logs" &&
          Array.isArray(parsedMessage.audit_log)
        ) {
          setHasInitialAuditLogs(true);
          queryClient.setQueryData(ADMIN_AUDIT_LOGS_READY_QUERY_KEY, true);
          queryClient.setQueryData<AuditLog[]>(
            ADMIN_AUDIT_LOGS_QUERY_KEY,
            parsedMessage.audit_log.map(mapAuditLog)
          );
          return;
        }

        if (Array.isArray(parsedMessage.audit_log)) {
          return;
        }

        const auditLog = parsedMessage.audit_log;

        queryClient.setQueryData<AuditLog[]>(
          ADMIN_AUDIT_LOGS_QUERY_KEY,
          (currentAuditLogs = []) => upsertAuditLog(currentAuditLogs, auditLog)
        );
      });
    }, 0);

    return () => {
      window.clearTimeout(connectSocket);
      socket?.close();

      if (auditLogSocketRef.current === socket) {
        auditLogSocketRef.current = null;
      }
    };
  }, [queryClient]);

  const filteredAuditLogs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return auditLogs
      .filter((auditLog) => {
        const searchableText = [
          String(auditLog.id),
          auditLog.performedBy,
          auditLog.actionTitle,
          auditLog.actionSummary,
          auditLog.ipAddress,
          auditLog.userAgent,
          formatDateTime(auditLog.createdAt),
        ]
          .join(" ")
          .toLowerCase();

        return (
          normalizedQuery === "" || searchableText.includes(normalizedQuery)
        );
      })
      .sort(sortByNewest);
  }, [auditLogs, searchQuery]);

  const totalPages = Math.ceil(filteredAuditLogs.length / ITEMS_PER_PAGE);
  const maxPage = Math.max(totalPages, 1);
  const currentPage = Math.min(page, maxPage);
  const paginatedAuditLogs = filteredAuditLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), maxPage));
  };

  return (
    <div className="mt-5 flex w-full flex-col gap-4 p-3">
      <AuditLogsToolbar
        auditLogs={filteredAuditLogs}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchQueryChange={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
      />

      <AuditLogsTable
        auditLogs={paginatedAuditLogs}
        isLoading={isLoading}
        isError={isError}
      />

      {totalPages > 1 && (
        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => goToPage(currentPage - 1)} />
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
              <PaginationNext onClick={() => goToPage(currentPage + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
