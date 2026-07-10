import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WeeklyReport as WeeklyReportType } from "@/types/weeklyReport";
import WeeklyReportActions from "./WeeklyReportActions";
import {
  formatDate,
  formatLabel,
  getStatusClasses,
  getTotalRepairLogs,
} from "./weeklyReportUtils";

type WeeklyReportTableProps = {
  reports: WeeklyReportType[];
  isLoading: boolean;
  isError: boolean;
  onViewReport: (report: WeeklyReportType) => void;
  onExportReport: (report: WeeklyReportType) => void;
};

export default function WeeklyReportTable({
  reports,
  isLoading,
  isError,
  onViewReport,
  onExportReport,
}: WeeklyReportTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-color bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted">Report ID</TableHead>
            <TableHead className="bg-muted">Title</TableHead>
            <TableHead className="bg-muted">Technician</TableHead>
            <TableHead className="bg-muted">Logs</TableHead>
            <TableHead className="bg-muted">Status</TableHead>
            <TableHead className="bg-muted">Created</TableHead>
            <TableHead className="bg-muted text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center secondary-text-color"
              >
                Loading weekly reports...
              </TableCell>
            </TableRow>
          )}

          {isError && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-red-500">
                Failed to load weekly reports.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && reports.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center secondary-text-color"
              >
                No weekly reports found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            reports.map((report) => (
              <TableRow
                key={report.id}
                tabIndex={0}
                role="button"
                onClick={() => onViewReport(report)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onViewReport(report);
                  }
                }}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {report.reportCode}
                </TableCell>
                <TableCell>
                  <div className="max-w-[280px]">
                    <p className="font-medium">{report.title}</p>
                    <p className="truncate text-sm secondary-text-color">
                      {report.summary}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{report.technicianName}</TableCell>
                <TableCell>
                  {getTotalRepairLogs(report.repairLogSummary)}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
                      report.status
                    )}`}
                  >
                    {formatLabel(report.status)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(report.createdAt)}</TableCell>
                <TableCell
                  className="text-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <WeeklyReportActions
                    report={report}
                    onView={onViewReport}
                    onExport={onExportReport}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
