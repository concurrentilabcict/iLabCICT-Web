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
                  <DetailRow
                    icon={Hash}
                    label="Log ID"
                    value={`#${auditLog.id}`}
                  />
                  <DetailRow
                    icon={User}
                    label="Performed By"
                    value={auditLog.performedBy}
                  />
                  <DetailRow
                    icon={Activity}
                    label="Action"
                    value={auditLog.actionTitle}
                  />
                  <DetailRow
                    icon={FileText}
                    label="Summary"
                    value={auditLog.actionSummary}
                    stacked
                  />
                  <DetailRow
                    icon={Globe2}
                    label="IP Address"
                    value={auditLog.ipAddress}
                  />
                  <DetailRow
                    icon={MonitorSmartphone}
                    label="User Agent"
                    value={auditLog.userAgent}
                    stacked
                  />
                  <DetailRow
                    icon={CalendarDays}
                    label="Created"
                    value={formatDateTime(auditLog.createdAt)}
                  />
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
