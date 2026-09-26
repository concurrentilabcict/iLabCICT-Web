import { useRef } from "react";
import { Download, Search, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AuditLog } from "@/types/auditLog";
import { formatDateTime } from "./auditLogUtils";
import { appToast } from "@/utils/appToast";
import { exportTablePdf, getLocalDateStamp } from "@/utils/tabularPdf";

type AuditLogsToolbarProps = {
  auditLogs: AuditLog[];
  isLoading: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
};

export default function AuditLogsToolbar({
  auditLogs,
  isLoading,
  searchQuery,
  onSearchQueryChange,
}: AuditLogsToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    onSearchQueryChange("");
    searchInputRef.current?.focus();
  };

  const exportAuditLogs = async () => {
    if (auditLogs.length === 0) {
      return;
    }

    const headers = [
      "Log ID",
      "Performed By",
      "Action",
      "Summary",
      "IP Address",
      "User Agent",
      "Created",
    ];
    try {
      exportTablePdf({
        title: "iLabCICT Audit Logs",
        subject: "Audit log export",
        filename: `iLabCICT_Audit_Logs_${getLocalDateStamp()}.pdf`,
        headers,
        rows: auditLogs.map((auditLog) => [
          auditLog.id,
          auditLog.performedBy,
          auditLog.actionTitle,
          auditLog.actionSummary,
          auditLog.ipAddress,
          auditLog.userAgent,
          formatDateTime(auditLog.createdAt),
        ]),
        columnWidths: [14, 24, 28, 44, 20, 48, 24],
      });
    } catch (error) {
      appToast.error(
        error instanceof Error ? error.message : "We couldn't export the audit logs."
      );
    }
  };

  return (
    <div className="flex items-center justify-between">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            disabled={isLoading || auditLogs.length === 0}
            className="flex w-fit cursor-pointer items-center gap-x-1.5 rounded-xl border bg-white px-3.5 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={20} className="rotate-180" />
            <span>Export</span>
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Audit Logs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prepare the current audit logs table as an A4 PDF.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void exportAuditLogs()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative w-[300px]">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search Audit Logs..."
          className="primary-border-color w-full rounded-xl border bg-white py-2 pl-10 pr-10 outline-none focus:border-black!"
        />

        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clearSearch}
            className="secondary-text-color absolute right-3 top-1/2 -translate-y-1/2 hover:text-black"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
