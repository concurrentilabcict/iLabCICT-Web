import {
    ClipboardList,
    Download,
    FileText,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { WeeklyReport as WeeklyReportType } from "@/types/weeklyReport";
import { formatDateTime } from "@/utils/string";
import {
    formatSummaryDate,
    getTotalRepairLogs,
} from "@/components/Admin/WeeklyReport/weeklyReportUtils";

type WeeklyReportDetailsProps = {
    report: WeeklyReportType;
    onExport: (report: WeeklyReportType) => void;
};

export default function WeeklyReportDetails({
    report,
    onExport,
}: WeeklyReportDetailsProps) {
    const totalRepairLogs = getTotalRepairLogs(report.repairLogSummary);
    const repairLogEntries = Object.entries(report.repairLogSummary)
        .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate));

    return (
        <>
            <SheetHeader>
                <SheetTitle className="mb-2 pr-10 text-lg font-semibold">
                    Report Overview
                </SheetTitle>
                <SheetDescription className="pr-10">
                    #{report.reportCode} · {report.title}
                </SheetDescription>
            </SheetHeader>

            <div className="scrollbar-hide flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-5">
                <Button
                    type="button"
                    onClick={() => onExport(report)}
                    className="w-fit"
                >
                    <Download className="h-4 w-4 rotate-180" />
                    Export
                </Button>

                <Section icon={FileText} title="Report Information">
                    <InfoRow label="Report Code" value={report.reportCode} />
                    <InfoRow label="Title" value={report.title} />
                    <InfoRow label="Technician" value={report.technicianName} />
                    <InfoRow label="Created" value={formatDateTime(report.createdAt)} />
                    <InfoRow label="Updated" value={formatDateTime(report.updatedAt)} />
                </Section>

                <Section icon={FileText} title="AI Summary">
                    <p className="leading-7">{report.summary}</p>
                </Section>

                <Section icon={ClipboardList} title="Repair Log Breakdown">
                    <InfoRow label="Total Logs" value={totalRepairLogs.toString()} />

                    <div className="mt-2 divide-y">
                        {repairLogEntries.length === 0 && (
                            <p className="py-3 secondary-text-color">
                                No repair log activity recorded.
                            </p>
                        )}

                        {repairLogEntries.map(([date, count]) => (
                            <InfoRow
                                key={date}
                                label={formatSummaryDate(date)}
                                value={`${count} log${count === 1 ? "" : "s"}`}
                            />
                        ))}
                    </div>
                </Section>
            </div>
        </>
    );
}

type SectionProps = {
    icon: ElementType;
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
};

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 last:border-b-0">
            <span className="secondary-text-color">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}
