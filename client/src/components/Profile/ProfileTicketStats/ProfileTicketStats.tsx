import { BarChart3, ClipboardList, FileText, Flag } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { createApiError, privateFetch } from "@/lib/api";
import type { ApiTicket, Ticket } from "@/types/ticket";

const mapTicket = (ticket: ApiTicket): Ticket => ({
  id: ticket.id,
  ticketCode: ticket.ticket_code,
  reportedBy: {
    id: ticket.reported_by.id,
    firstName: ticket.reported_by.first_name,
    lastName: ticket.reported_by.last_name,
  },
  assignedTo: ticket.assigned_to
    ? {
        id: ticket.assigned_to.id,
        firstName: ticket.assigned_to.first_name,
        lastName: ticket.assigned_to.last_name,
      }
    : { id: 0, firstName: "Unassigned", lastName: "" },
  room: {
    id: ticket.room.id,
    roomName: ticket.room.room_name,
    buildingName: ticket.room.building_name,
    floorNumber: ticket.room.floor_number,
  },
  computer: ticket.computer
    ? {
        id: ticket.computer.id,
        computerCode: ticket.computer.computer_code,
      }
    : null,
  type: ticket.type,
  title: ticket.title,
  complaintDescription: ticket.complaint_description,
  issueImage: ticket.issue_image,
  status: ticket.status,
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
});

const isSameDay = (date: Date, compareDate: Date) =>
  date.getFullYear() === compareDate.getFullYear() &&
  date.getMonth() === compareDate.getMonth() &&
  date.getDate() === compareDate.getDate();

const getDayLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" })
    .format(date)
    .slice(0, 2)
    .toUpperCase();

export default function ProfileTicketStats() {
  const technicianId = Number(localStorage.getItem("id"));

  const { data: tickets = [], isLoading, isError } = useQuery<Ticket[]>({
    queryKey: ["profile-ticket-stats", technicianId],
    enabled: Number.isInteger(technicianId) && technicianId > 0,
    queryFn: async () => {
      const res = await privateFetch("https://ilabcict-backend.onrender.com/api/tickets/");
      const data = await res.json();

      if (!res.ok) {
        throw createApiError(res.status, data.message || "Failed to load ticket stats.");
      }

      return (data as ApiTicket[]).map(mapTicket);
    },
  });

  const stats = useMemo(() => {
    const assignedTickets = tickets.filter((ticket) => ticket.assignedTo?.id === technicianId);
    const today = new Date();
    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      return date;
    });
    const resolvedByDay = weekDays.map((date) => ({
      label: getDayLabel(date),
      count: assignedTickets.filter((ticket) => {
        const updatedAt = new Date(ticket.updatedAt);

        return ticket.status === "resolved" && isSameDay(updatedAt, date);
      }).length,
    }));
    const todayTickets = assignedTickets.filter((ticket) =>
      isSameDay(new Date(ticket.createdAt), today)
    );
    const reports = assignedTickets.filter((ticket) => ticket.type === "report").length;
    const requests = assignedTickets.filter((ticket) => ticket.type === "request").length;
    const total = assignedTickets.length;
    const reportPercentage = total > 0 ? Math.round((reports / total) * 100) : 0;
    const requestPercentage = total > 0 ? 100 - reportPercentage : 0;

    return {
      total,
      reports,
      requests,
      reportPercentage,
      requestPercentage,
      todayTotal: todayTickets.length,
      todayOpen: todayTickets.filter((ticket) => ticket.status === "open").length,
      todayOngoing: todayTickets.filter((ticket) => ticket.status === "ongoing").length,
      todayResolved: todayTickets.filter((ticket) => ticket.status === "resolved").length,
      resolvedByDay,
    };
  }, [technicianId, tickets]);

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
