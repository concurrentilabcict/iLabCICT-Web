import {
    ArrowRight,
    CalendarDays,
    ClipboardList,
    FileText,
    User,
} from "lucide-react";

import type { WeeklyReport as WeeklyReportType } from "@/types/weeklyReport";
import {
    formatDate,
    getTotalRepairLogs,
} from "@/components/Admin/WeeklyReport/weeklyReportUtils";

type WeeklyReportCardProps = {
    report: WeeklyReportType;
    onClick?: () => void;
};

export default function WeeklyReportCard({
    report,
    onClick,
}: WeeklyReportCardProps) {
    const totalRepairLogs = getTotalRepairLogs(report.repairLogSummary);

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-full min-h-[350px] w-full max-w-[600px] flex-col gap-4 rounded-3xl bg-white p-5 text-left shadow-[0_16px_38px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(15,23,42,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:max-w-[550px]"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#fbf2f0] text-[#bf3419]">
                        <FileText size={26} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                            Weekly Maintenance Report
                        </p>
                        <h2 className="mt-1 truncate text-xl font-bold text-zinc-950">
                            {report.reportCode}
                        </h2>
                    </div>
                </div>

                <span className="mt-1 size-3 shrink-0 rounded-full bg-yellow-400" />
            </div>

            <div>
                <h3 className="line-clamp-2 text-xl font-bold leading-snug text-zinc-950">
                    {report.title}
                </h3>

                <div className="mt-3 flex flex-col gap-1.5 text-sm font-semibold text-zinc-500">
                    <div className="flex items-center gap-2">
                        <User size={16} />
                        <span className="truncate">{report.technicianName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        <span>{formatDate(report.createdAt)}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4">
                <p className="line-clamp-3 text-sm font-medium leading-6 text-zinc-600">
                    {report.summary}
                </p>
            </div>

            <div className="mt-auto h-px w-full bg-gray-100" />

            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fbf2f0] text-[#bf3419]">
                        <ClipboardList size={18} />
                    </div>
                    <span className="truncate text-sm font-semibold text-zinc-500">
                        {totalRepairLogs} repair log{totalRepairLogs === 1 ? "" : "s"} associated
                    </span>
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                    <ArrowRight size={18} />
                </div>
            </div>
        </button>
    );
}
