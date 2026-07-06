import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CalendarDays, FileText, Layers2, User, Wrench } from "lucide-react";
import { formatDateTime } from "@/utils/string";
import type { RepairLog } from "@/types/repairLog";

type RepairLogDetailsProps = {
  repairLog: RepairLog;
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
}: RepairLogDetailsProps) {
  const reportedBy = `${repairLog.ticket.reportedBy.firstName} ${repairLog.ticket.reportedBy.lastName}`;
  const technician = `${repairLog.ticket.assignedTo.firstName} ${repairLog.ticket.assignedTo.lastName}`;

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

      <div className="flex flex-1 flex-col gap-6 px-4">
        <div className="flex flex-col gap-y-2 rounded-lg border border-dashed bg-muted/30 p-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <FileText size={14} />
            <h3>Repair Notes</h3>
          </div>
          <p>{repairLog.repairNotes}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <Layers2 size={14} />
            <h3>Type</h3>
          </div>
          <span>{formatLabel(repairLog.ticket.type)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <User size={14} />
            <h3>Reported By</h3>
          </div>
          <span className="text-right">{reportedBy}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <Wrench size={14} />
            <h3>Technician</h3>
          </div>
          <span className="text-right">{technician}</span>
        </div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <CalendarDays size={14} />
            <h3>Created</h3>
          </div>
          <span className="text-right">{formatDateTime(repairLog.createdAt)}</span>
        </div>
      </div>
    </>
  );
}
