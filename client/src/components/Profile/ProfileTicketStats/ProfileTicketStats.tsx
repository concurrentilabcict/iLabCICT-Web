import { BarChart3, ClipboardList, FileText, Flag } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";

type TechnicianResolvedPerDay = {
  day: string;
  count: number;
  date: string;
};

type TechnicianProfileStatsResponse = {
  id: number;
  stats: {
    total_tickets_assigned: {
      report_tickets: number;
      request_tickets: number;
      total: number;
    };
    total_tickets_assigned_today: {
      report_tickets: number;
      request_tickets: number;
      total: number;
    };
    resolved_tickets_per_day: TechnicianResolvedPerDay[];
    assigned_ticket_status_today: {
      open: number;
      ongoing: number;
      resolved: number;
    };
  };
};

export default function ProfileTicketStats() {
  const technicianId = Number(localStorage.getItem("id"));

  const { data: profileStats, isLoading, isError } = useQuery<TechnicianProfileStatsResponse>({
    queryKey: ["profile-ticket-stats", technicianId],
    enabled: Number.isInteger(technicianId) && technicianId > 0,
    queryFn: async () => {
      const res = await privateFetch(buildApiUrl(`/api/users/${technicianId}/?include=technician-stats`));
      const data: TechnicianProfileStatsResponse & { message?: string } = await res.json();

      if (!res.ok) {
        throw createApiError(res.status, data.message || "Failed to load ticket stats.");
      }

      return data;
    },
  });

  const stats = useMemo(() => {
    const fallbackDays = ["M", "T", "W", "TH", "F", "SA", "SU"].map((label) => ({
      label,
      count: 0,
    }));
    const apiStats = profileStats?.stats;
    const reports = apiStats?.total_tickets_assigned.report_tickets ?? 0;
    const requests = apiStats?.total_tickets_assigned.request_tickets ?? 0;
    const total = apiStats?.total_tickets_assigned.total ?? 0;
    const reportPercentage = total > 0 ? Math.round((reports / total) * 100) : 0;
    const requestPercentage = total > 0 ? 100 - reportPercentage : 0;

    return {
      total,
      reports,
      requests,
      reportPercentage,
      requestPercentage,
      todayTotal: apiStats?.total_tickets_assigned_today.total ?? 0,
      todayOpen: apiStats?.assigned_ticket_status_today.open ?? 0,
      todayOngoing: apiStats?.assigned_ticket_status_today.ongoing ?? 0,
      todayResolved: apiStats?.assigned_ticket_status_today.resolved ?? 0,
      resolvedByDay: apiStats?.resolved_tickets_per_day.map((day) => ({
        label: day.day,
        count: day.count,
      })) ?? fallbackDays,
    };
  }, [profileStats]);

  if (isLoading) {
    return <p className="px-3 text-sm secondary-text-color">Loading ticket stats...</p>;
  }

  if (isError) {
    return <p className="px-3 text-sm text-red-600">Failed to load ticket stats.</p>;
  }

  return (
    <section className="flex flex-col gap-4 px-3">
      <div>
        <h2 className="text-xl font-bold">My Tickets</h2>
        <p className="mt-1 text-sm font-medium secondary-text-color">
          Monitor your ticket assignments and activity.
        </p>
      </div>

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
              Tickets Resolved
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 items-end gap-2">
            {stats.resolvedByDay.map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-zinc-500">{day.count}</span>
                <div
                  className={`w-full rounded-full ${day.count > 0 ? "primary-bg-color" : "bg-gray-200"}`}
                  style={{ height: `${Math.max(6, day.count * 14)}px` }}
                />
                <span className="text-xs font-semibold text-zinc-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Today
              </p>
              <h3 className="text-lg font-bold">Assigned</h3>
            </div>
            <div className="rounded-xl bg-[#fbf2f0] p-2.5 text-[#bf3419]">
              <ClipboardList size={20} />
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold secondary-text-color">
            <span className="text-xl font-bold primary-text-color">{stats.todayTotal}</span>{" "}
            tickets
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs font-semibold">
            <StatusCount label="Open" value={stats.todayOpen} color="bg-blue-500" />
            <StatusCount label="Ongoing" value={stats.todayOngoing} color="bg-amber-500" />
            <StatusCount label="Resolved" value={stats.todayResolved} color="bg-emerald-500" />
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
                Assigned Work
              </p>
              <h3 className="text-lg font-bold">Total Tickets</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold primary-text-color">{stats.total}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total</p>
          </div>
        </div>

        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-gray-100">
          <div className="primary-bg-color" style={{ width: `${stats.reportPercentage}%` }} />
          <div className="bg-emerald-400" style={{ width: `${stats.requestPercentage}%` }} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <WorkType
            icon={FileText}
            label="Reports"
            value={stats.reports}
            percentage={stats.reportPercentage}
            tone="report"
          />
          <WorkType
            icon={Flag}
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

type WorkTypeProps = {
  icon: typeof FileText;
  label: string;
  value: number;
  percentage: number;
  tone: "report" | "request";
};

function WorkType({ icon: Icon, label, value, percentage, tone }: WorkTypeProps) {
  const isReport = tone === "report";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`rounded-xl p-2.5 ${isReport ? "bg-[#fbf2f0] text-[#bf3419]" : "bg-emerald-50 text-emerald-600"}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {label}
          </p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${isReport ? "primary-bg-color" : "bg-emerald-400"}`}>
            {percentage}%
          </span>
        </div>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
