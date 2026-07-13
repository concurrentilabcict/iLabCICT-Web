import { CalendarDays, ChevronRight, ClipboardList, FileText } from "lucide-react";

import type { WeeklyReport as WeeklyReportType } from "@/types/weeklyReport";
import {
    formatDate,
    getTotalRepairLogs,
} from "@/components/Admin/WeeklyReport/weeklyReportUtils";

type WeeklyReportCardProps = {
    report: WeeklyReportType;
    onClick?: () => void;
};

export default function WeeklyReportCard({ report, onClick }: WeeklyReportCardProps) {
    const totalRepairLogs = getTotalRepairLogs(report.repairLogSummary);

    return (
        <button
            type="button"
            onClick={onClick}
            className="primary-border-color flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-left transition-shadow hover:shadow-[0_7px_24px_rgba(15,23,42,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    <div className="mt-1 rounded-xl bg-red-50 p-2.5 text-primary-color">
                        <FileText size={19} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium secondary-text-color">
                            {report.reportCode}
                        </p>
                        <h2 className="truncate text-lg font-semibold">{report.title}</h2>
                    </div>
                </div>
            </div>

            <p className="line-clamp-3 text-sm leading-6 secondary-text-color">
                {report.summary}
            </p>

            <div className="h-px w-full bg-gray-200" />

            <div className="flex items-center justify-between gap-3 text-sm secondary-text-color">
                <div className="flex min-w-0 items-center gap-1.5">
                    <ClipboardList size={15} />
                    <span>{totalRepairLogs} repair log{totalRepairLogs === 1 ? "" : "s"}</span>
                </div>

                <div className="flex min-w-0 items-center justify-end gap-1.5">
                    <CalendarDays size={15} />
                    <span className="truncate text-right">{formatDate(report.createdAt)}</span>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <ChevronRight size={24} aria-hidden="true" />
            </div>
        </button>
    );
}
