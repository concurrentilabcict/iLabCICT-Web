import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  CalendarDays,
  FileText,
  Layers2,
  MapPin,
  Monitor,
  User,
  Wrench,
} from "lucide-react";
import { formatDateTime } from "@/utils/string";
import type { RepairLog } from "@/types/repairLog";
import type { ReactNode } from "react";

type RepairLogDetailsProps = {
  repairLog: RepairLog;
  closeSheet: () => void;
};

const formatLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default function RepairLogDetails({
  repairLog,
  closeSheet,
}: RepairLogDetailsProps) {
  void closeSheet;

  const ticket = repairLog.ticket;
  const reportedBy = `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`;
  const technician = `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`.trim();
  const ticketCode = ticket.ticketCode || `TK${String(ticket.id).padStart(8, "0")}`;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="mb-2 text-lg font-semibold">
          {repairLog.title}
        </SheetTitle>

        <div className="flex items-center justify-between">
          <SheetDescription>#{repairLog.repairLogCode}</SheetDescription>
        </div>
      </SheetHeader>

      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
        <Section icon={FileText} title="Repair Notes">
          <p className="leading-7">{repairLog.repairNotes}</p>
        </Section>

        <Section icon={Layers2} title="Ticket Details">
          <InfoRow label="Ticket Code" value={ticketCode} />
          <InfoRow label="Type" value={formatLabel(ticket.type)} />
          <InfoRow label="Status" value={formatLabel(ticket.status || "resolved")} />
          <InfoRow label="Title" value={ticket.title || repairLog.title} />
          <InfoRow
            label="Created"
            value={ticket.createdAt ? formatDateTime(ticket.createdAt) : "Not available"}
          />
          <InfoRow label="Resolved" value={formatDateTime(repairLog.createdAt)} />
        </Section>

        <Section icon={FileText} title="Complaint Description">
          <p className="leading-7">
            {ticket.complaintDescription || "No complaint description available."}
          </p>
        </Section>

        <Section icon={MapPin} title="Location & Equipment">
          <InfoRow label="Building" value={ticket.room?.buildingName || "Not available"} />
          <InfoRow label="Room" value={ticket.room?.roomName || "Not available"} />
          <InfoRow
            label="Floor"
            value={ticket.room ? `Floor ${ticket.room.floorNumber}` : "Not available"}
          />
          <InfoRow
            label="Computer"
            value={ticket.computer?.computerCode || "Not available"}
            icon={Monitor}
          />
        </Section>

        <Section icon={User} title="Personnel">
          <InfoRow label="Reported By" value={reportedBy} />
          <InfoRow
            label="Technician"
            value={technician || "Unassigned"}
            icon={Wrench}
          />
        </Section>

        <Section icon={CalendarDays} title="Repair Log Date">
          <InfoRow label="Created" value={formatDateTime(repairLog.createdAt)} />
        </Section>
      </div>
    </>
  );
}

type SectionProps = {
  icon: typeof FileText;
  title: string;
  children: ReactNode;
};

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-y-3">
      <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
        <Icon size={14} />
        <h3>{title}</h3>
      </div>
      <div className="rounded-lg bg-muted/30 p-4 text-sm">
        {children}
      </div>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  icon?: typeof FileText;
};

function InfoRow({ label, value, icon: Icon }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 last:border-b-0">
      <span className="secondary-text-color flex items-center gap-x-1.5">
        {Icon && <Icon size={13} />}
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
