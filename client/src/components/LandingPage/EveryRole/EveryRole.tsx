import { ClipboardList, MonitorCog, ShieldCheck } from "lucide-react";

export default function EveryRole() {
    const roleCards = [
        {
            icon: ClipboardList,
            role: "Faculty",
            title: "Report issues fast",
            detail: "Create reports or requests with room and computer context already attached.",
        },
        {
            icon: MonitorCog,
            role: "Technician",
            title: "Own the repair flow",
            detail: "Receive assignments, update ticket status, and keep maintenance history accurate.",
        },
        {
            icon: ShieldCheck,
            role: "Admin",
            title: "See the full operation",
            detail: "Manage users, laboratories, audit logs, reports, and live operational data.",
        },
    ];

    return (
        <section
            id="roles"
            className="relative border-t border-zinc-200 bg-[#fafafa] px-4 py-20 sm:px-6 lg:px-15"
        >
            <div className="mx-auto max-w-[1180px]">
                <div className="max-w-[760px]">
                    <p className="text-sm font-black uppercase text-[#bf3419]">Built for every role</p>
                    <h2 className="mt-4 text-4xl font-black leading-tight text-zinc-950 sm:text-5xl">
                        One operating layer for the people who keep labs running.
                    </h2>
                    <p className="mt-5 text-sm font-medium leading-7 text-zinc-600 sm:text-base">
                        Each role sees the workflow that matters to them, while the system keeps tickets, rooms, logs, and reports connected.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-3">
                    {roleCards.map((card) => {
                        const RoleIcon = card.icon;

                        return (
                            <div key={card.role} className="rounded-[24px] border border-zinc-200 bg-white p-5 text-zinc-950 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#bf3419]/8 text-[#bf3419]">
                                    <RoleIcon size={22} />
                                </div>
                                <p className="mt-6 text-sm font-black uppercase text-zinc-500">{card.role}</p>
                                <h3 className="mt-2 text-2xl font-black">{card.title}</h3>
                                <p className="mt-3 text-sm font-medium leading-7 text-zinc-600">{card.detail}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
