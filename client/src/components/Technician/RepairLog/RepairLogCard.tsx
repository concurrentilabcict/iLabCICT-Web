import type { RepairLog } from "@/types/repairLog";
import { formatDateTime } from "@/utils/string";
import {
    ArrowRight,
    CalendarDays,
    FileWarning,
    User,
    Wrench,
} from "lucide-react";

type RepairLogCardProps = {
    repairLog: RepairLog;
    onClick?: () => void;
};

const formatLabel = (text: string) =>
    text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

export default function RepairLogCard({
    repairLog,
    onClick,
}: RepairLogCardProps) {
    const reportedBy = `${repairLog.ticket.reportedBy.firstName} ${repairLog.ticket.reportedBy.lastName}`;
    const technician = `${repairLog.ticket.assignedTo.firstName} ${repairLog.ticket.assignedTo.lastName}`.trim();
    const type = formatLabel(repairLog.ticket.type);

    return (
        <article
            onClick={onClick}
            className="flex h-full min-h-[330px] w-full max-w-[600px] cursor-pointer flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(15,23,42,0.12)] md:max-w-[550px]"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-600">
                        <FileWarning size={13} />
                        {type}
                    </div>

                    <h1 className="truncate text-xl font-bold text-zinc-950">
                        {repairLog.title}
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-zinc-400">
                        {repairLog.repairLogCode}
                    </p>
                </div>

                <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-[#fbf2f0] text-[#bf3419]">
                    <Wrench size={28} />
                </div>
            </div>

            <div className="border-l-2 border-[#bf3419] pl-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                    Repair Summary
                </p>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-relaxed text-zinc-600">
                    {repairLog.repairNotes}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoBlock icon={User} label="Reported By" value={reportedBy} />
                <InfoBlock icon={Wrench} label="Technician" value={technician || "Unassigned"} />
            </div>

            <div className="mt-auto h-px w-full bg-gray-100" />

            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-400">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-50">
                        <CalendarDays size={15} />
                    </div>
                    <span className="truncate">{formatDateTime(repairLog.createdAt)}</span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-400">
                    <span>View details</span>
                    <ArrowRight size={16} />
                </div>
            </div>
        </article>
    );
}

type InfoBlockProps = {
    icon: typeof User;
    label: string;
    value: string;
};

function InfoBlock({ icon: Icon, label, value }: InfoBlockProps) {
    return (
        <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-zinc-400">
                <Icon size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.12em]">
                    {label}
                </span>
            </div>
            <p className="truncate text-sm font-bold text-zinc-900">
                {value}
            </p>
        </div>
    );
}
