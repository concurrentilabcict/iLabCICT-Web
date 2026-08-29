import { BarChart3, ClipboardList, FileText, Info } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";

type FacultyTicketsPerDay = {
  day: string;
  count: number;
  date: string;
};

type FacultyProfileStatsResponse = {
  id: number;
  stats: {
    tickets_per_day: FacultyTicketsPerDay[];
    tickets_submitted_today: {
      request_tickets: number;
      report_tickets: number;
    };
    total_tickets_today: number;
  };
};

export default function FacultyProfile() {
  const facultyId = Number(localStorage.getItem("id"));

  const {
    data: profileStats,
    isError,
  } = useQuery<FacultyProfileStatsResponse>({
    queryKey: ["faculty-profile-ticket-stats", facultyId],
    enabled: Number.isInteger(facultyId) && facultyId > 0,
    queryFn: async () => {
      const response = await privateFetch(
        buildApiUrl(`/api/users/${facultyId}/?include=faculty-stats`)
      );
      const data: FacultyProfileStatsResponse & { message?: string } =
        await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || "Failed to load ticket stats."
        );
      }

      return data;
    },
  });

  const stats = useMemo(() => {
    const fallbackDays = ["M", "T", "W", "TH", "F", "SA", "SU"].map(
      (label) => ({
        label,
        count: 0,
      })
    );
    const apiStats = profileStats?.stats;
    const reports = apiStats?.tickets_submitted_today.report_tickets ?? 0;
    const requests = apiStats?.tickets_submitted_today.request_tickets ?? 0;
    const total = apiStats?.total_tickets_today ?? 0;
    const reportPercentage = total > 0 ? Math.round((reports / total) * 100) : 0;
    const requestPercentage = total > 0 ? 100 - reportPercentage : 0;

    return {
      total,
      reports,
      requests,
      reportPercentage,
      requestPercentage,
      createdByDay:
        apiStats?.tickets_per_day.map((day) => ({
          label: day.day,
          count: day.count,
        })) ?? fallbackDays,
    };
  }, [profileStats]);

  const highestCount = Math.max(1, ...stats.createdByDay.map((day) => day.count));

  return (
    <section className="flex flex-col gap-4 px-3">
      <div>
        <h2 className="text-xl font-bold">My Tickets</h2>
        <p className="mt-1 text-sm font-medium secondary-text-color">
          Monitor your daily ticket submissions this week.
        </p>
      </div>
      {isError && (
        <p className="text-sm text-red-600">Failed to load ticket stats.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Activity
              </p>
              <h3 className="text-lg font-bold">Last 7 Days</h3>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Tickets Submitted
            </div>
          </div>

          <div className="mt-5 grid h-24 grid-cols-7 items-end gap-2">
            {stats.createdByDay.map((day) => {
              const barHeight =
                day.count > 0
                  ? Math.max(12, Math.round((day.count / highestCount) * 48))
                  : 4;

              return (
                <div
                  key={day.label}
                  className="flex h-full flex-col items-center justify-end gap-1"
                >
                  <span className="text-xs font-semibold text-zinc-500">
                    {day.count}
                  </span>
                  <div className="flex h-12 w-full items-end justify-center">
                    <div
                      className={`w-7 rounded-full ${
                        day.count > 0 ? "primary-bg-color" : "bg-gray-200"
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Today
              </p>
              <h3 className="text-lg font-bold">Submitted</h3>
            </div>
            <div className="rounded-xl bg-[#fbf2f0] p-2.5 text-[#bf3419]">
              <ClipboardList size={20} />
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold secondary-text-color">
            <span className="text-xl font-bold primary-text-color">
              {stats.total}
            </span>{" "}
            tickets
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs font-semibold">
            <StatusCount label="Reports" value={stats.reports} color="bg-blue-500" />
            <StatusCount label="Requests" value={stats.requests} color="bg-emerald-500" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="primary-bg-color rounded-xl p-3 text-white">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Submitted Work
              </p>
              <h3 className="text-lg font-bold">Today&apos;s Tickets</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold primary-text-color">{stats.total}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total
            </p>
          </div>
        </div>

        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="primary-bg-color"
            style={{ width: `${stats.reportPercentage}%` }}
          />
          <div
            className="bg-emerald-400"
            style={{ width: `${stats.requestPercentage}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <TicketType
            icon={Info}
            label="Reports"
            value={stats.reports}
            percentage={stats.reportPercentage}
            tone="report"
          />
          <TicketType
            icon={FileText}
            label="Requests"
            value={stats.requests}
            percentage={stats.requestPercentage}
            tone="request"
          />
        </div>
      </div>
    </section>
  );
}

type StatusCountProps = {
  label: string;
  value: number;
  color: string;
};

function StatusCount({ label, value, color }: StatusCountProps) {
  return (
    <div>
      <p className="text-base font-bold">{value}</p>
      <div className="mt-1 flex items-center justify-center gap-1">
        <span className={`size-2 rounded-full ${color}`} />
        <span className="uppercase text-zinc-400">{label}</span>
      </div>
    </div>
  );
}

type TicketTypeProps = {
  icon: typeof FileText;
  label: string;
  value: number;
  percentage: number;
  tone: "report" | "request";
};

function TicketType({
  icon: Icon,
  label,
  value,
  percentage,
  tone,
}: TicketTypeProps) {
  const isReport = tone === "report";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`rounded-xl p-2.5 ${
          isReport ? "bg-[#fbf2f0] text-[#bf3419]" : "bg-emerald-50 text-emerald-600"
        }`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {label}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${
              isReport ? "primary-bg-color" : "bg-emerald-400"
            }`}
          >
            {percentage}%
          </span>
        </div>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
