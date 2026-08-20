import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock3,
  Monitor,
  User,
  UserCheck,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/utils/string";
import type { Status, TicketType } from "@/utils/ticket";
import ResolveRequestDialog from "./ResolveRequestDialog";

type ManageTicketCardProps = {
  status: Status;
  type: TicketType;
  title: string;
  complaintDescription: string;
  reportedBy: string;
  ticketCode: string;
  roomName: string;
  buildingName: string;
  floorNumber: number;
  computerCode: string | null;
  assignedTechnician: string;
  isAssignedToCurrentUser?: boolean;
  isAssignedToAnother?: boolean;
  date: string;
  canAssignToMe?: boolean;
  isAssigning?: boolean;
  onAssignToMe?: () => void;
  canResolveRequest?: boolean;
  isResolvingRequest?: boolean;
  onResolveRequest?: () => void;
  onClick?: () => void;
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
};

export default function ManageTicketCard({
  status,
  type,
  title,
  complaintDescription,
  reportedBy,
  ticketCode,
  roomName,
  buildingName,
  floorNumber,
  computerCode,
  assignedTechnician,
  isAssignedToCurrentUser = false,
  isAssignedToAnother = false,
  date,
  canAssignToMe = false,
  isAssigning = false,
  onAssignToMe,
  canResolveRequest = false,
  isResolvingRequest = false,
  onResolveRequest,
  onClick,
}: ManageTicketCardProps) {
  const currentStatus = statusStyle[status];
  const StatusIcon = currentStatus.icon;
  const TypeIcon = type === "Report" ? ClipboardList : Wrench;
  const typeClassName =
    type === "Report"
      ? "bg-red-50 text-red-600"
      : "bg-emerald-50 text-emerald-700";
  const actionLabel = isAssignedToAnother ? "Reassign to me" : "Assign to me";
  const shouldShowComputer = type === "Report";

  return (
    <article
      onClick={onClick}
      className="group flex h-full min-h-[430px] w-full max-w-[600px] cursor-pointer flex-col gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] md:max-w-[550px]"
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${typeClassName}`}
        >
          <TypeIcon size={14} />
          <span>{type}</span>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${currentStatus.className}`}
        >
          <StatusIcon size={14} />
          <span>{status}</span>
        </div>
      </div>

      <div>
        <h1 className="text-lg font-bold leading-snug text-zinc-950">
          {title}
        </h1>

        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm font-medium leading-relaxed text-zinc-500">
          {complaintDescription}
        </p>
      </div>

      {shouldShowComputer && (
        <InfoTile
          icon={Monitor}
          label="Affected Computer"
          value={computerCode || "Not Specified"}
          className="bg-[#fbf2f0]"
          iconClassName="bg-[#f7ded8] text-[#bf3419]"
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTile icon={User} label="Reported By" value={reportedBy} compact />
        <InfoTile
          icon={Building2}
          label="Laboratory Room"
          value={roomName}
          compact
        />
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <InfoTile
          icon={Building2}
          label="Building"
          value={buildingName}
          compact
          className="rounded-none border-r border-gray-200 bg-white shadow-none"
        />
        <InfoTile
          icon={Monitor}
          label="Floor"
          value={String(floorNumber)}
          compact
          className="rounded-none bg-white shadow-none"
        />
      </div>

      {isAssignedToAnother && (
        <InfoTile
          icon={Wrench}
          label="Assigned Technician"
          value={assignedTechnician}
          compact
          className="bg-white p-0 shadow-none"
        />
      )}

      <div className="mt-auto h-px w-full bg-gray-100" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-400">
          <CalendarDays size={17} className="shrink-0" />
          <span className="truncate">{formatDateTime(date)}</span>
          <span className="sr-only">{ticketCode}</span>
        </div>

        <div
          onClick={(event) => event.stopPropagation()}
          className="flex justify-end"
        >
          {canResolveRequest ? (
            <ResolveRequestDialog
              ticketCode={ticketCode}
              isSubmitting={isResolvingRequest}
              onResolve={() => onResolveRequest?.()}
            />
          ) : canAssignToMe ? (
            <Button
              type="button"
              onClick={() => onAssignToMe?.()}
              disabled={isAssigning}
              className="h-9 rounded-xl px-3.5 text-sm shadow-md shadow-[#bf3419]/20"
            >
              {isAssigning ? (
                <>
                  <Spinner className="size-4" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  {actionLabel}
                </>
              )}
            </Button>
          ) : isAssignedToCurrentUser ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <UserCheck size={17} />
              Assigned to you
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-zinc-500">
              Unassigned
            </div>
          )}
        </div>
      </div>
    </article>
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
      className={`flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3 shadow-sm shadow-black/[0.01] ${
        compact ? "py-2.5" : ""
      } ${className}`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400 ${iconClassName}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">
          {value}
        </p>
      </div>
    </div>
  );
}
