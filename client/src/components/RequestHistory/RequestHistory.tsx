import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type { ApiRequestHistory, RequestHistory as RequestHistoryType } from "@/types/requestHistory";
import { statusConfig, type Status } from "@/utils/ticket";
import { formatDateTime } from "@/utils/string";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Flag,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import RequestHistorySkeleton from "@/components/RequestHistorySkeleton/RequestHistorySkeleton";

type RequestHistoryProps = {
  roomId: number | null;
};

type RequestHistoryResponse = {
  histories: RequestHistoryType[];
};

type ApiRequestHistoryResponse =
  | ApiRequestHistory[]
  | {
      results?: ApiRequestHistory[];
      next?: string | null;
      message?: string;
    };

const formatLabel = (text: string) => {
  return text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const mapRequestHistory = (history: ApiRequestHistory): RequestHistoryType => ({
  id: history.id,
  room: {
    id: history.room.id,
    roomName: history.room.room_name,
    buildingName: history.room.building_name,
    floorNumber: history.room.floor_number,
  },
  ticket: {
    id: history.ticket.id,
    status: history.ticket.status,
    issueImage: history.ticket.issue_image,
    title: history.ticket.title,
    type: history.ticket.type,
    complaintDescription: history.ticket.complaint_description,
  },
  technician: history.technician
    ? {
        id: history.technician.id,
        firstName: history.technician.first_name,
        lastName: history.technician.last_name,
      }
    : null,
  datePerformed: history.date_performed,
  requestHistoryCode: history.request_history_code,
});

const getMessage = (data: ApiRequestHistoryResponse) => {
  if (Array.isArray(data)) {
    return null;
  }

  return data.message ?? null;
};

const getResults = (data: ApiRequestHistoryResponse) => {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
};

const getNextUrl = (data: ApiRequestHistoryResponse) => {
  if (Array.isArray(data)) {
    return null;
  }

  return data.next ?? null;
};

const resolveRequestHistoryUrl = (url: string) => {
  if (!url.startsWith("http")) {
    return buildApiUrl(url);
  }

  const parsedUrl = new URL(url);

  return buildApiUrl(`${parsedUrl.pathname}${parsedUrl.search}`);
};

export default function RequestHistory({ roomId }: RequestHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery<RequestHistoryResponse>({
    queryKey: ["request-history", roomId],
    enabled: Number.isInteger(roomId) && roomId !== null,
    queryFn: async () => {
      let nextUrl: string | null = buildApiUrl(`/api/request-history/?room-id=${roomId}`);
      const histories: RequestHistoryType[] = [];
      let pageCount = 0;

      while (nextUrl && pageCount < 20) {
        const res = await privateFetch(resolveRequestHistoryUrl(nextUrl));
        const responseData = (await res.json()) as ApiRequestHistoryResponse;

        if (!res.ok) {
          throw createApiError(
            res.status,
            getMessage(responseData) ?? "Failed to fetch request history."
          );
        }

        histories.push(...getResults(responseData).map(mapRequestHistory));
        nextUrl = getNextUrl(responseData);
        pageCount += 1;
      }

      return {
        histories,
      };
    },
  });

  const histories = data?.histories ?? [];

  const filteredHistories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return histories.filter((history) => {
      const technicianName = history.technician
        ? `${history.technician.firstName} ${history.technician.lastName}`
        : "No technician";

      const searchableText = [
        history.requestHistoryCode,
        history.ticket.title,
        history.ticket.complaintDescription,
        history.ticket.status,
        technicianName,
      ]
        .join(" ")
        .toLowerCase();

      return normalizedQuery === "" || searchableText.includes(normalizedQuery);
    });
  }, [histories, searchQuery]);

  const clearSearch = () => setSearchQuery("");

  if (!roomId) {
    return (
      <div className="p-4">
        <RequestHistorySkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f8fafc]">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <h2 className="text-lg font-bold leading-snug text-zinc-950">Request Histories</h2>
        <p className="mt-1 text-sm font-medium text-zinc-500">
          Resolved request activity for this laboratory.
        </p>
      </div>

      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search request history..."
            className="h-12 w-full rounded-xl bg-white pl-10 pr-10 text-sm font-medium shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none placeholder:text-zinc-400"
          />
          {searchQuery.trim() !== "" && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        {isLoading && (
          <RequestHistorySkeleton />
        )}

        {isError && (
          <div className="rounded-2xl bg-white p-4 text-center text-sm font-medium text-red-600">
            Failed to load request history.
          </div>
        )}

        {!isLoading && !isError && filteredHistories.length === 0 && (
          <p className="py-8 text-center text-sm font-medium secondary-text-color">
            No request history found.
          </p>
        )}

        {!isLoading &&
          !isError &&
          filteredHistories.map((history) => {
            const formattedStatus = formatLabel(history.ticket.status) as Status;
            const statusData = statusConfig[formattedStatus] ?? {
              icon: CheckCircle2,
              className: "bg-zinc-100 text-zinc-700",
            };
            const StatusIcon = statusData.icon;
            const technicianName = history.technician
              ? `${history.technician.firstName} ${history.technician.lastName}`
              : "No technician";

            return (
              <article
                key={history.id}
                className="flex flex-col gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <Flag size={14} className="shrink-0" />
                    <span className="truncate">{history.requestHistoryCode}</span>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${statusData.className}`}
                  >
                    <StatusIcon size={14} />
                    {formattedStatus}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold leading-snug text-zinc-950">
                    {history.ticket.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 min-h-10 text-sm font-medium leading-relaxed text-zinc-500">
                    {history.ticket.complaintDescription}
                  </p>
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div className="flex flex-col gap-3">
                  <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-zinc-400">
                      <CalendarDays size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
                        Date
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">
                        {formatDateTime(history.datePerformed)}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-zinc-400">
                      <Wrench size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
                        Technician
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">
                        {technicianName}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
