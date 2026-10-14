import {
  Archive,
  Building2,
  CalendarDays,
  CircleX,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock3,
  Layers3,
  Monitor,
  Send,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { motion } from "framer-motion";

import { CARD_SURFACE, cardMotion } from "@/lib/motion";
import { formatDateTime } from "@/utils/string";
import type { Status, TicketType } from "@/utils/ticket";

type ManageTicketCardProps = {
  index?: number;
  status: Status;
  type: TicketType;
  title: string;
  complaintDescription: string;
  reportedBy: string;
  assignedTo: string;
  ticketCode: string;
  roomName: string;
  buildingName: string;
  floorNumber: number;
  computerCode: string;
  date: string;
  onClick?: () => void;
  onArchive?: () => void;
  onResubmit?: () => void;
  isResubmitting?: boolean;
};

const statusStyle: Record<Status, { icon: LucideIcon; className: string }> = {
  Open: {
    icon: CircleDot,
    className: "border-sky-300 bg-sky-100 text-sky-700",
  },
  Ongoing: {
    icon: Clock3,
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  Resolved: {
    icon: CheckCircle2,
    className: "border-emerald-300 bg-emerald-100 text-emerald-700",
  },
  Archived: {
    icon: Archive,
    className: "border-gray-300 bg-gray-100 text-gray-700",
  },
};

export default function ManageTicketCard({
  index = 0,
  status,
  type,
  title,
  complaintDescription,
  reportedBy,
  assignedTo,
  ticketCode,
  roomName,
  buildingName,
  floorNumber,
  computerCode,
  date,
  onClick,
  onArchive,
  onResubmit,
  isResubmitting = false,
}: ManageTicketCardProps) {
  const currentStatus = statusStyle[status];
  const StatusIcon = currentStatus.icon;
  const TypeIcon = type === "Report" ? ClipboardList : Wrench;
  const typeClassName =
    type === "Report"
      ? "bg-red-50 text-red-600"
      : "bg-emerald-50 text-emerald-700";
  const isArchived = status === "Archived";
  const mutedClassName = isArchived ? "opacity-60" : "";

  return (
    <motion.article
      {...cardMotion(index)}
      onClick={onClick}
      tabIndex={0}
      aria-label={`View ticket ${ticketCode}: ${title}`}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`group flex w-full cursor-pointer flex-col gap-3 rounded-2xl p-4 text-left ${CARD_SURFACE} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary shadow-[0_14px_34px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] ${isArchived ? " bg-zinc-100" : " bg-white"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${typeClassName} ${mutedClassName}`}
        >
          <TypeIcon size={14} />
          <span>{type}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${currentStatus.className} ${mutedClassName}`}
          >
            <StatusIcon className="shrink-0" size={14} />
            <span>{isArchived ? "Canceled" : status}</span>
          </div>

          {onResubmit && (
            <button type="button" disabled={isResubmitting}
              onClick={(event) => { event.stopPropagation(); onResubmit(); }}
              className="flex h-9 items-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white shadow-md shadow-[#bf3419]/20 disabled:opacity-50">
              <Send size={16} /> Resubmit
            </button>
          )}
        </div>
      </div>

      <div className={mutedClassName}>
        <h2 className="text-lg font-bold leading-snug text-zinc-950">{title}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-relaxed text-zinc-500">
          {complaintDescription}
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-5 ${mutedClassName}`}>
      <InfoTile
        icon={Monitor}
        label="Affected Computer"
        value={computerCode}
        iconClassName="text-[#bf3419]"
      />

      <div className="contents">
        <InfoTile icon={User} label="Reported By" value={reportedBy} compact />
        <InfoTile icon={Building2} label="Laboratory Room" value={roomName} compact />
      </div>

      <div className="contents">
        <InfoTile
          icon={Building2}
          label="Building"
          value={buildingName}
          compact
        />
        <InfoTile
          icon={Layers3}
          label="Floor"
          value={String(floorNumber)}
          compact
        />
      </div>
      </div>

      <div className="h-px w-full bg-gray-100" />

      {onArchive && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onArchive();
          }}
          className="flex w-fit items-center gap-2 self-end rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <CircleX size={16} />
          Cancel Ticket
        </button>
      )}

      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${mutedClassName}`}>
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-400">
          <CalendarDays size={17} className="shrink-0" />
          <span className="truncate">{formatDateTime(date)}</span>
          <span className="sr-only">{ticketCode}</span>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-zinc-700">
          <Wrench size={17} className="shrink-0 text-zinc-400" />
          <div className="min-w-0 text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
              Assigned Technician
            </p>
            <p className="truncate">{assignedTo || "Unassigned"}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

type InfoTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  compact?: boolean;
  className?: string;
  iconClassName?: string;
};

function InfoTile({
  icon: Icon,
  label,
  value,
  compact = false,
  className = "",
  iconClassName = "",
}: InfoTileProps) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        compact ? "py-1" : "py-1.5"
      } ${className}`}
    >
      <div
        className={`flex size-5 shrink-0 items-center justify-center text-zinc-400 ${iconClassName}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-zinc-800">
          {value}
        </p>
      </div>
    </div>
  );
}
