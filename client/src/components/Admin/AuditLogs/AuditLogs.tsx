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
import {
  buildApiUrl,
  buildWebSocketUrl,
  createApiError,
  privateFetch,
} from "@/lib/api";
import AuditLogsTable from "./AuditLogsTable";
import AuditLogsToolbar from "./AuditLogsToolbar";
import {
  formatDateTime,
  isAuditLogWebSocketMessage,
  mapAuditLog,
  sortByNewest,
  upsertAuditLog,
} from "./auditLogUtils";
import type {
  ApiAuditLog,
  AuditLog,
  AuditLogsPageResponse,
} from "@/types/auditLog";
import { getPaginationWindow } from "@/utils/pagination";

const ITEMS_PER_PAGE = 10;
const ADMIN_AUDIT_LOGS_QUERY_KEY = ["admin-audit-logs"] as const;
const ADMIN_AUDIT_LOGS_READY_QUERY_KEY = ["admin-audit-logs-ready"] as const;
const AUDIT_LOGS_WS_ENDPOINT = "/ws/audit-logs/";

const getAuditLogsFromPage = (data: AuditLogsPageResponse) =>
  data.audit_log ?? data.results ?? [];

const normalizeNextUrl = (nextUrl: string) => {
  if (nextUrl.startsWith("http://") || nextUrl.startsWith("https://")) {
    const parsedUrl = new URL(nextUrl);
    return buildApiUrl(`${parsedUrl.pathname}${parsedUrl.search}`);
  }

  return buildApiUrl(nextUrl);
};

const mergeAuditLogs = (
  currentAuditLogs: AuditLog[],
  nextAuditLogs: ApiAuditLog[]
) =>
  nextAuditLogs.reduce(
    (mergedAuditLogs, auditLog) => upsertAuditLog(mergedAuditLogs, auditLog),
    currentAuditLogs
  );

export default function AuditLogs() {
  const queryClient = useQueryClient();
  const auditLogSocketRef = useRef<WebSocket | null>(null);
  const cachedAuditLogsAreReady =
    queryClient.getQueryData<boolean>(ADMIN_AUDIT_LOGS_READY_QUERY_KEY) === true;
  const [hasInitialAuditLogs, setHasInitialAuditLogs] =
    useState(cachedAuditLogsAreReady);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [nextPageError, setNextPageError] = useState(false);

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
          setNextUrl("next" in parsedMessage ? parsedMessage.next ?? null : null);
          setNextPageError(false);
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

  const loadNextAuditLogsPage = async () => {
    if (!nextUrl || isLoadingNext) {
      return false;
    }

    setIsLoadingNext(true);
    setNextPageError(false);

    try {
      const response = await privateFetch(normalizeNextUrl(nextUrl));
      const data = await response.json() as AuditLogsPageResponse;

      if (!response.ok) {
        throw createApiError(
          response.status,
          "Failed to fetch more audit logs."
        );
      }

      queryClient.setQueryData<AuditLog[]>(
        ADMIN_AUDIT_LOGS_QUERY_KEY,
        (currentAuditLogs = []) =>
          mergeAuditLogs(currentAuditLogs, getAuditLogsFromPage(data))
      );
      setNextUrl(data.next ?? null);
      return true;
    } catch {
      setNextPageError(true);
      return false;
    } finally {
      setIsLoadingNext(false);
    }
  };

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
  const visiblePages = getPaginationWindow(currentPage, totalPages);
  const paginatedAuditLogs = filteredAuditLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = async (nextPage: number) => {
    if (nextPage > maxPage && nextUrl) {
      const nextPageLoaded = await loadNextAuditLogsPage();

      if (nextPageLoaded) {
        setPage(maxPage + 1);
      }

      return;
    }

    setPage(Math.min(Math.max(nextPage, 1), maxPage));
  };
  const shouldShowPagination = totalPages > 1 || nextUrl !== null;

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
        isLoading={isLoading || isLoadingNext}
        isError={isError || nextPageError}
      />

      {shouldShowPagination && (
        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => void goToPage(currentPage - 1)} />
            </PaginationItem>

            {visiblePages.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={currentPage === pageNumber}
                  onClick={() => void goToPage(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => void goToPage(currentPage + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
