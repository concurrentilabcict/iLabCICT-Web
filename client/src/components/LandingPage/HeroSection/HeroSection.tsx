import {
    Activity,
    BarChart3,
    CheckCircle2,
    ClipboardList,
    Monitor,
    ShieldCheck,
    Users,
    Wrench,
} from "lucide-react";
import HeroContent from "./HeroContent";

export default function HeroSection() {
    const activityRows = [
        {
            icon: ClipboardList,
            title: "New faculty report",
            detail: "Monitor issue in SLD 1",
            status: "Queued",
        },
        {
            icon: Wrench,
            title: "Technician assigned",
            detail: "Repair task moved to ongoing",
            status: "Live",
        },
        {
            icon: CheckCircle2,
            title: "Ticket resolved",
            detail: "History and audit log synced",
            status: "Done",
        },
    ];

    const systemStats = [
        {
            label: "Open tickets",
            value: "18",
            icon: ClipboardList,
        },
        {
            label: "Active labs",
            value: "12",
            icon: Monitor,
        },
        {
            label: "Reports",
            value: "4",
            icon: BarChart3,
        },
    ];

    return (
        <section id="home" className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden px-4 pt-12 pb-10 sm:px-6 lg:px-15 lg:pt-18">
            <div className="absolute inset-x-0 top-0 -z-20 h-[72%] bg-[linear-gradient(180deg,#fff_0%,#fff7f4_48%,#f8fafc_100%)]" />

            <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
                <HeroContent />

                <div className="relative mx-auto w-full max-w-[1060px] overflow-hidden rounded-[28px] border border-zinc-200 bg-white/85 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur">
                    <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
                        <span className="size-2.5 rounded-full bg-[#bf3419]" />
                        <span className="size-2.5 rounded-full bg-[#f4aa29]" />
                        <span className="size-2.5 rounded-full bg-emerald-500" />
                        <span className="ml-3 text-xs font-semibold uppercase text-zinc-400">
                            Live operations console
                        </span>
                    </div>

                    <div className="hero-operations-board grid min-h-[520px] gap-4 rounded-[20px] bg-[#fafafa] p-4 lg:grid-cols-[1.05fr_1.45fr_0.9fr] lg:p-6">
                        <div className="flex flex-col gap-4">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-zinc-400">Tickets</p>
                                        <h3 className="mt-1 text-3xl font-black text-zinc-950">124</h3>
                                    </div>
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#bf3419]/10 text-[#bf3419]">
                                        <ClipboardList size={22} />
                                    </div>
                                </div>
                                <div className="mt-5 flex h-28 items-end gap-2">
                                    {[42, 58, 34, 76, 51, 88, 64].map((height) => (
                                        <span
                                            key={height}
                                            className="hero-bar flex-1 rounded-t-lg bg-[#bf3419]"
                                            style={{ height: `${height}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                <p className="text-xs font-bold uppercase text-zinc-400">Room health</p>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {["SLD 1", "SLD 2", "ProgLab", "Cisco"].map((room, index) => (
                                        <div key={room} className="rounded-xl bg-zinc-50 p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-zinc-900">{room}</span>
                                                <span className={`size-2.5 rounded-full ${index === 2 ? "bg-amber-400" : "bg-emerald-500"}`} />
                                            </div>
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                                                <span
                                                    className="block h-full rounded-full bg-[#bf3419]"
                                                    style={{ width: `${index === 2 ? 64 : 88 - index * 9}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-[#bf3419]/15 bg-[#bf3419] p-5 text-white shadow-[0_18px_50px_rgba(191,52,25,0.24)]">
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase text-white/70">Operations pulse</p>
                                    <h3 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Every lab request in motion.</h3>
                                </div>
                                <div className="hero-pulse flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                                    <Activity size={28} />
                                </div>
                            </div>

                            <div className="relative z-10 my-8 grid grid-cols-3 gap-3">
                                {systemStats.map((stat) => {
                                    const StatIcon = stat.icon;

                                    return (
                                        <div key={stat.label} className="rounded-2xl bg-white/12 p-4">
                                            <StatIcon size={18} className="text-white/70" />
                                            <p className="mt-4 text-3xl font-black">{stat.value}</p>
                                            <p className="text-xs font-semibold text-white/70">{stat.label}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="relative z-10 space-y-3">
                                {activityRows.map((row, index) => {
                                    const RowIcon = row.icon;

                                    return (
                                        <div
                                            key={row.title}
                                            className="hero-activity-row flex items-center gap-3 rounded-2xl bg-white p-3 text-zinc-900 shadow-[0_12px_30px_rgba(40,15,10,0.14)]"
                                            style={{ animationDelay: `${index * 0.45}s` }}
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#bf3419]/10 text-[#bf3419]">
                                                <RowIcon size={18} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold">{row.title}</p>
                                                <p className="truncate text-xs font-medium text-zinc-500">{row.detail}</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                {row.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase text-zinc-400">Access</p>
                                    <ShieldCheck size={18} className="text-emerald-600" />
                                </div>
                                <div className="mt-4 space-y-3">
                                    {["Admin", "Technician", "Faculty"].map((role) => (
                                        <div key={role} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                                            <span className="text-sm font-bold text-zinc-900">{role}</span>
                                            <span className="text-xs font-semibold text-zinc-400">Synced</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-zinc-400">Response team</p>
                                        <h3 className="mt-1 text-2xl font-black text-zinc-950">9 online</h3>
                                    </div>
                                    <Users size={21} className="text-[#bf3419]" />
                                </div>

                                <div className="mt-5 flex -space-x-3">
                                    {["JP", "PM", "LC", "KA", "MS"].map((initials) => (
                                        <span key={initials} className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-xs font-black text-white">
                                            {initials}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-5 rounded-xl bg-emerald-50 p-3">
                                    <p className="text-sm font-bold text-emerald-800">Live updates ready</p>
                                    <p className="mt-1 text-xs font-medium leading-5 text-emerald-700">Tickets, rooms, notifications, and audit logs stay current through websocket events.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 text-sm font-medium text-zinc-600 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                        <span className="block text-zinc-950">Ticket workflow</span>
                        Faculty reports to technician resolution.
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                        <span className="block text-zinc-950">Laboratory assets</span>
                        Rooms, computers, and maintenance history.
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                        <span className="block text-zinc-950">Admin oversight</span>
                        Reports, audit logs, users, and live updates.
                    </div>
                </div>
            </div>
        </section>
    );
}
