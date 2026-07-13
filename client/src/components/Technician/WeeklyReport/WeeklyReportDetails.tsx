import { CalendarDays, ClipboardList, Download, FileText, User } from "lucide-react";
import type { ElementType } from "react";

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

                <div className="rounded-xl border border-dashed bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-x-1.5 font-medium secondary-text-color">
                        <FileText size={14} />
                        <h3>Report Summary</h3>
                    </div>
                    <p className="leading-7">{report.summary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <DetailTile
                        icon={User}
                        label="Technician"
                        value={report.technicianName}
                    />
                    <DetailTile
                        icon={ClipboardList}
                        label="Total Logs"
                        value={totalRepairLogs.toString()}
                    />
                    <DetailTile
                        icon={CalendarDays}
                        label="Created"
                        value={formatDateTime(report.createdAt)}
                    />
                    <DetailTile
                        icon={CalendarDays}
                        label="Updated"
                        value={formatDateTime(report.updatedAt)}
                    />
                </div>

                <div className="rounded-xl border bg-white">
                    <div className="border-b bg-muted/50 px-4 py-3 font-medium">
                        Repair Log Summary
                    </div>

                    <div className="divide-y">
                        {repairLogEntries.length === 0 && (
                            <p className="p-4 secondary-text-color">
                                No repair log activity recorded.
                            </p>
                        )}

                        {repairLogEntries.map(([date, count]) => (
                            <div
                                key={date}
                                className="flex items-center justify-between gap-4 px-4 py-3"
                            >
                                <span>{formatSummaryDate(date)}</span>
                                <span className="font-medium">
                                    {count} log{count === 1 ? "" : "s"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

type DetailTileProps = {
    icon: ElementType;
    label: string;
    value: string;
};

function DetailTile({ icon: Icon, label, value }: DetailTileProps) {
    return (
        <div className="primary-border-color rounded-xl border bg-white p-3">
            <div className="mb-1 flex items-center gap-x-1.5 text-sm font-medium secondary-text-color">
                <Icon size={14} />
                <h3>{label}</h3>
            </div>
            <p className="break-words font-medium">{value}</p>
        </div>
    );
}
