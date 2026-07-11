import {
  Building2,
  CalendarDays,
  ChevronRight,
  Monitor,
  User,
  Wrench,
} from "lucide-react";

import { formatDateTime } from "@/utils/string";
import { statusConfig, typeConfig } from "@/utils/ticket";
import type { Status, TicketType } from "@/utils/ticket";

type ManageTicketCardProps = {
  status: Status;
  type: TicketType;
  title: string;
  complaintDescription: string;
  reportedBy: string;
  assignedTo: string;
  ticketCode: string;
  room: string;
  computerCode: string;
  date: string;
  onClick?: () => void;
};

export default function ManageTicketCard({
  status,
  type,
  title,
  complaintDescription,
  reportedBy,
  assignedTo,
  ticketCode,
  room,
  computerCode,
  date,
  onClick,
}: ManageTicketCardProps) {
  const statusData = statusConfig[status];
  const typeData = typeConfig[type];
  const StatusIcon = statusData.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full max-w-[600px] cursor-pointer rounded-[28px] bg-white p-5 text-left shadow-[0_3px_16px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_7px_24px_rgba(15,23,42,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:max-w-[550px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`flex h-8 w-25 items-center justify-center rounded-full px-3 text-sm font-bold tracking-wide ${typeData.className}`}>
            {type}
          </span>
          <span className="truncate text-sm font-semibold tracking-[0.08em] text-gray-400">
            {ticketCode}
          </span>
        </div>

        <div className={`flex h-8 w-25 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-bold tracking-wide ${statusData.className}`}>
          <StatusIcon className="shrink-0" size={14} />
          <span>{status}</span>
        </div>
      </div>

      <div className="mt-2.5">
        <h2 className="text-xl font-bold leading-tight text-gray-950">{title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed font-medium text-gray-500 sm:text-base">
          {complaintDescription}
        </p>
      </div>

      <div className="my-5 h-px bg-gray-100" />

      <div className="space-y-3 text-sm font-medium text-gray-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <User className="shrink-0 text-gray-400" size={19} />
            <span className="truncate">{reportedBy}</span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <Wrench className="shrink-0 text-gray-400" size={19} />
            <span className="truncate text-right">{assignedTo}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="shrink-0 text-gray-400" size={19} />
            <span className="truncate">{room}</span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <Monitor className="shrink-0 text-gray-400" size={19} />
            <span className="truncate text-right">{computerCode}</span>
          </div>
        </div>
      </div>

      <div className="my-5 h-px bg-gray-100" />

      <div className="flex items-center justify-between text-sm font-medium text-gray-400">
        <div className="flex items-center gap-2">
          <CalendarDays size={19} />
          <span>{formatDateTime(date)}</span>
        </div>
        <ChevronRight size={26} aria-hidden="true" />
      </div>
    </button>
  );
}
