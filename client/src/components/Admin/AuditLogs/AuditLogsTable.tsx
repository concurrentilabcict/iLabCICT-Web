import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "./auditLogUtils";
import type { AuditLog } from "@/types/auditLog";

type AuditLogsTableProps = {
  auditLogs: AuditLog[];
  isLoading: boolean;
  isError: boolean;
  onSelectAuditLog: (auditLog: AuditLog) => void;
};

export default function AuditLogsTable({
  auditLogs,
  isLoading,
  isError,
  onSelectAuditLog,
}: AuditLogsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-color bg-white">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] bg-muted">Log ID</TableHead>
            <TableHead className="w-[180px] bg-muted">Performed By</TableHead>
            <TableHead className="w-[180px] bg-muted">Action</TableHead>
            <TableHead className="w-[320px] bg-muted">Summary</TableHead>
            <TableHead className="w-[140px] bg-muted">IP Address</TableHead>
            <TableHead className="w-[190px] bg-muted">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center secondary-text-color"
              >
                Loading audit logs...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && isError && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-red-500">
                Failed to load audit logs.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && auditLogs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center secondary-text-color"
              >
                No audit logs found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            auditLogs.map((auditLog) => (
              <TableRow
                key={auditLog.id}
                tabIndex={0}
                aria-label={`View details for audit log ${auditLog.id}`}
                onClick={() => onSelectAuditLog(auditLog)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectAuditLog(auditLog);
                  }
                }}
                className="cursor-pointer transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bf3419]"
              >
                <TableCell className="font-medium">#{auditLog.id}</TableCell>
                <TableCell className="truncate">{auditLog.performedBy}</TableCell>
                <TableCell className="truncate">{auditLog.actionTitle}</TableCell>
                <TableCell className="max-w-0">
                  <p className="truncate" title={auditLog.actionSummary}>
                    {auditLog.actionSummary}
                  </p>
                </TableCell>
                <TableCell>{auditLog.ipAddress}</TableCell>
                <TableCell>{formatDateTime(auditLog.createdAt)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
