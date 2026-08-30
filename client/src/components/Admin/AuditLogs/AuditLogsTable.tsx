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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted">Log ID</TableHead>
            <TableHead className="bg-muted">Performed By</TableHead>
            <TableHead className="bg-muted">Action</TableHead>
            <TableHead className="bg-muted">Summary</TableHead>
            <TableHead className="bg-muted">IP Address</TableHead>
            <TableHead className="bg-muted">User Agent</TableHead>
            <TableHead className="bg-muted">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center secondary-text-color"
              >
                Loading audit logs...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && isError && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-red-500">
                Failed to load audit logs.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && auditLogs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
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
                <TableCell>{auditLog.performedBy}</TableCell>
                <TableCell>{auditLog.actionTitle}</TableCell>
                <TableCell>
                  <p className="max-w-[360px] truncate">
                    {auditLog.actionSummary}
                  </p>
                </TableCell>
                <TableCell>{auditLog.ipAddress}</TableCell>
                <TableCell>
                  <p className="max-w-[280px] truncate" title={auditLog.userAgent}>
                    {auditLog.userAgent}
                  </p>
                </TableCell>
                <TableCell>{formatDateTime(auditLog.createdAt)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
