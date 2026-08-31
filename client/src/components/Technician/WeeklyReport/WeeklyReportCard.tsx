import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    FileText,
    User,
    type LucideIcon,
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
    const isRead = report.status.toLowerCase() === "read";
    const StatusIcon = isRead ? CheckCircle2 : CircleDot;

    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex h-full min-h-[430px] w-full max-w-[600px] cursor-pointer flex-col gap-3 rounded-3xl border border-white bg-white p-4 text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:max-w-[550px]"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600">
                    <FileText size={14} />
                    <span>Weekly Report</span>
                </div>

                <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                        isRead
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-amber-300 bg-amber-50 text-amber-700"
                    }`}
                >
                    <StatusIcon size={14} />
                    <span>{isRead ? "Read" : "Unread"}</span>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold leading-snug text-zinc-950">
                    {report.title}
                </h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                    {report.reportCode}
                </p>
                <p className="mt-1.5 line-clamp-2 min-h-10 text-sm font-medium leading-relaxed text-zinc-500">
                    {report.summary}
                </p>
            </div>

            <InfoTile
                icon={User}
                label="Technician"
                value={report.technicianName}
            />

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <InfoTile
                    icon={ClipboardList}
                    label="Repair Logs"
                    value={String(totalRepairLogs)}
                    className="rounded-none border-r border-gray-200 bg-white shadow-none"
                />
                <InfoTile
                    icon={CalendarDays}
                    label="Created"
                    value={formatDate(report.createdAt)}
                    className="rounded-none bg-white shadow-none"
                />
            </div>

            <div className="mt-auto h-px w-full bg-gray-100" />

            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-zinc-400">
                    View report details
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                    <ArrowRight size={17} />
                </span>
            </div>
        </button>
    );
}

type InfoTileProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    className?: string;
};

function InfoTile({ icon: Icon, label, value, className = "" }: InfoTileProps) {
    return (
        <div
            className={`flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3 shadow-sm shadow-black/[0.01] ${className}`}
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400">
                <Icon size={16} />
            </span>
            <span className="min-w-0">
                <span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
                    {label}
                </span>
                <span className="mt-0.5 block truncate text-sm font-bold text-zinc-800">
                    {value}
                </span>
            </span>
        </div>
    );
}
