import type { Status } from "@/utils/computer";
import { statusConfig } from "@/utils/computer";
import { formatDateTime } from "@/utils/string";
import { Braces, CalendarClock, Cpu, HardDrive, MemoryStick, Microchip, MonitorCog, type LucideIcon } from "lucide-react";

type SystemDetailsProps = {
    cpu: string,
    gpu: string,
    motherboard: string,
    diskSize: string,
    ramSize: string,
    operatingSystem: string,
    buildVersion: string,
    status: Status,
    createdAt: string,
    updatedAt: string
}

export default function SystemDetailsCard({
    cpu,
    gpu,
    motherboard,
    diskSize,
    ramSize,
    operatingSystem,
    buildVersion,
    status,
    createdAt,
    updatedAt,
}: SystemDetailsProps){

    const statusData = statusConfig[status];

    return(
            <>
                <div className="w-full max-w-[600px] rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:max-w-[550px]">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
                                <Cpu size={18}/>
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-lg font-bold leading-snug text-zinc-950">System Specifications</h2>
                                <p className="truncate text-sm font-medium text-zinc-500">Hardware and operating system</p>
                            </div>
                        </div>
                        <span className={`flex w-fit shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold ${statusData?.className}`}>{status}</span>
                    </div>

                    <div className="mt-4 space-y-4">
                        <section>
                            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Platform</p>
                            <div className="grid grid-cols-2 gap-3">
                                <SpecItem icon={MonitorCog} label="Operating System" value={operatingSystem} />
                                <SpecItem icon={Braces} label="Build Version" value={buildVersion} />
                            </div>
                        </section>

                        <section>
                            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Performance</p>
                            <div className="grid gap-3">
                                <SpecItem icon={Cpu} label="Processor" value={cpu} />
                                <SpecItem icon={HardDrive} label="Graphics Card" value={gpu} />
                            </div>
                        </section>

                        <section>
                            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Memory & Board</p>
                            <div className="grid grid-cols-2 gap-3">
                                <SpecItem icon={MemoryStick} label="RAM" value={ramSize} />
                                <SpecItem icon={HardDrive} label="Storage" value={diskSize} />
                                <SpecItem icon={Microchip} label="Motherboard" value={motherboard} className="col-span-2" />
                            </div>
                        </section>

                        <section>
                            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Record</p>
                            <div className="grid grid-cols-2 gap-3">
                                <SpecItem icon={CalendarClock} label="Created" value={formatDateTime(createdAt)} />
                                <SpecItem icon={CalendarClock} label="Last Modified" value={formatDateTime(updatedAt)} />
                            </div>
                        </section>
                    </div>
                </div>
            </>
        );
}

type SpecItemProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    className?: string;
};

function SpecItem({ icon: Icon, label, value, className = "" }: SpecItemProps) {
    return (
        <div className={`flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3 ${className}`}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400">
                <Icon size={16} />
            </span>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
                <p className="mt-0.5 break-words text-sm font-bold leading-snug text-zinc-800">{value}</p>
            </div>
        </div>
    );
}
