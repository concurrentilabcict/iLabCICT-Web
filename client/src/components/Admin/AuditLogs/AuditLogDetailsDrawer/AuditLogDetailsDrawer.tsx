import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { AuditLog } from "@/types/auditLog";
import {
  Activity,
  CalendarDays,
  FileText,
  Globe2,
  Hash,
  MonitorSmartphone,
  User,
  type LucideIcon,
} from "lucide-react";
import MetadataRenderer from "../MetadataRenderer/MetadataRenderer";
import { formatDateTime } from "../auditLogUtils";

type AuditLogDetailsDrawerProps = {
  auditLog: AuditLog | null;
  onOpenChange: (open: boolean) => void;
};

const normalizeFieldKey = (key: string) =>
  key.replace(/[^a-z0-9]/gi, "").toLowerCase();

const metadataHasField = (
  metadata: AuditLog["metadata"],
  fieldNames: string[]
) => {
  if (!metadata) {
    return false;
  }

  const normalizedFieldNames = new Set(fieldNames.map(normalizeFieldKey));
  const containsField = (value: unknown): boolean => {
    if (Array.isArray(value)) {
      return value.some(containsField);
    }

    if (typeof value !== "object" || value === null) {
      return false;
    }

    return Object.entries(value).some(
      ([key, nestedValue]) =>
        normalizedFieldNames.has(normalizeFieldKey(key)) ||
        containsField(nestedValue)
    );
  };

  return containsField(metadata);
};

type DetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  stacked?: boolean;
};

function DetailRow({
  icon: Icon,
  label,
  value,
  stacked = false,
}: DetailRowProps) {
  if (stacked) {
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
          <Icon size={14} className="shrink-0" />
          <h3>{label}</h3>
        </div>
        <p className="min-w-0 whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3 text-sm leading-6 text-foreground [overflow-wrap:anywhere]">
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="secondary-text-color flex shrink-0 items-center gap-x-1.5 font-medium">
        <Icon size={14} />
        <h3>{label}</h3>
      </div>
      <p className="min-w-0 break-words text-sm font-medium text-foreground [overflow-wrap:anywhere] sm:max-w-[65%] sm:text-right">
        {value}
      </p>
    </div>
  );
}

export default function AuditLogDetailsDrawer({
  auditLog,
  onOpenChange,
}: AuditLogDetailsDrawerProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const metadataFields = auditLog
    ? {
        logId: metadataHasField(auditLog.metadata, ["log_id", "audit_log_id"]),
        performedBy: metadataHasField(auditLog.metadata, ["performed_by"]),
        action: metadataHasField(auditLog.metadata, ["action"]),
        summary: metadataHasField(auditLog.metadata, ["summary", "action_summary"]),
        ipAddress: metadataHasField(auditLog.metadata, ["ip_address"]),
        userAgent: metadataHasField(auditLog.metadata, ["user_agent"]),
        created: metadataHasField(auditLog.metadata, ["created", "created_at"]),
      }
    : null;

  return (
    <Sheet open={auditLog !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[92vh] rounded-t-xl" : "w-[560px]!"}
      >
        {auditLog && (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle className="mb-2 break-words text-lg font-semibold [overflow-wrap:anywhere]">
                {auditLog.actionTitle}
              </SheetTitle>
              <SheetDescription>Audit log #{auditLog.id}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
              <section aria-label="Audit information">
                <div className="flex min-w-0 flex-col gap-5">
                  {!metadataFields?.logId && (
                    <DetailRow icon={Hash} label="Log ID" value={`#${auditLog.id}`} />
                  )}
                  {!metadataFields?.performedBy && (
                    <DetailRow icon={User} label="Performed By" value={auditLog.performedBy} />
                  )}
                  {!metadataFields?.action && (
                    <DetailRow icon={Activity} label="Action" value={auditLog.actionTitle} />
                  )}
                  {!metadataFields?.summary && (
                    <DetailRow
                      icon={FileText}
                      label="Summary"
                      value={auditLog.actionSummary}
                      stacked
                    />
                  )}
                  {!metadataFields?.ipAddress && (
                    <DetailRow icon={Globe2} label="IP Address" value={auditLog.ipAddress} />
                  )}
                  {!metadataFields?.userAgent && (
                    <DetailRow
                      icon={MonitorSmartphone}
                      label="User Agent"
                      value={auditLog.userAgent}
                      stacked
                    />
                  )}
                  {!metadataFields?.created && (
                    <DetailRow
                      icon={CalendarDays}
                      label="Created"
                      value={formatDateTime(auditLog.createdAt)}
                    />
                  )}
                </div>
              </section>

              <section
                aria-labelledby="audit-metadata-heading"
                className="border-t border-zinc-200 pt-5"
              >
                <div className="mb-2">
                  <h3
                    id="audit-metadata-heading"
                    className="text-sm font-semibold text-zinc-950"
                  >
                    Metadata
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Additional information recorded with this event.
                  </p>
                </div>

                <div className="min-w-0">
                  <MetadataRenderer metadata={auditLog.metadata} />
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
