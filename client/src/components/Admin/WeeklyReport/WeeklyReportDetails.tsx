import { CalendarDays, Download, FileText, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { WeeklyReport as WeeklyReportType } from "@/types/weeklyReport";
import {
  formatSummaryDate,
  getTotalRepairLogs,
} from "./weeklyReportUtils";
import { formatDateTime } from "@/utils/string";

type WeeklyReportDetailsProps = {
  report: WeeklyReportType;
  onExport: (report: WeeklyReportType) => void;
};

export default function WeeklyReportDetails({
  report,
  onExport,
}: WeeklyReportDetailsProps) {
  const totalRepairLogs = getTotalRepairLogs(report.repairLogSummary);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="mb-2 text-lg font-semibold">
          {report.title}
        </SheetTitle>
        <SheetDescription>#{report.reportCode}</SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-5">
        <Button
          type="button"
          onClick={() => onExport(report)}
          className="w-fit"
        >
          <Download className="h-4 w-4 rotate-180" />
          Export PDF
        </Button>

        <div className="flex flex-col gap-y-2 rounded-lg border border-dashed bg-muted/30 p-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <FileText size={14} />
            <h3>Report Summary</h3>
          </div>
          <p className="leading-6">{report.summary}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <User size={14} />
            <h3>Technician</h3>
          </div>
          <span className="text-right">{report.technicianName}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <CalendarDays size={14} />
            <h3>Created</h3>
          </div>
          <span className="text-right">{formatDateTime(report.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <FileText size={14} />
            <h3>Total Logs</h3>
          </div>
          <span>{totalRepairLogs}</span>
        </div>

        <div className="rounded-lg border">
          <div className="border-b bg-muted/50 px-4 py-3 font-medium">
            Repair Log Summary
          </div>
          <div className="divide-y">
            {Object.entries(report.repairLogSummary).length === 0 && (
              <p className="p-4 secondary-text-color">
                No repair log activity recorded.
              </p>
            )}

            {Object.entries(report.repairLogSummary)
              .sort(([firstDate], [secondDate]) =>
                firstDate.localeCompare(secondDate)
              )
              .map(([date, count]) => (
                <div
                  key={date}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span>{formatSummaryDate(date)}</span>
                  <span className="font-medium">{count} logs</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
