import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CalendarDays, FileText, Layers2 } from "lucide-react";
import { capitalize, formatDateTime } from "@/utils/string";
import type { RepairLog } from "@/types/repairLog";

type TicketDetailsProps = {
  repairLog: RepairLog;
  closeSheet: () => void;
};

export default function RepairLogDetails({ repairLog, closeSheet }: TicketDetailsProps) {
  void closeSheet;

  const reportedBy = repairLog.ticket.reportedBy.firstName + " " + repairLog.ticket.reportedBy.lastName;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg font-semibold mb-2">{repairLog.title}</SheetTitle>

        <div className="flex items-center justify-between">
          <SheetDescription>
            #{repairLog.repairLogCode}
          </SheetDescription>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 px-4">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <FileText size={14} />
            <h3>Repair Notes</h3>
          </div>
          <p>{repairLog.repairNotes}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <Layers2 size={14} />
            <h3>Type</h3>
          </div>
          <span>{capitalize(repairLog.type)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <Layers2 size={14} />
            <h3>Reported By</h3>
          </div>
          <span>{reportedBy}</span>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <CalendarDays size={14} />
            <h3>Date</h3>
          </div>
          <span>{formatDateTime(repairLog.createdAt)}</span>
        </div>
      </div>
    </>
  );
}
