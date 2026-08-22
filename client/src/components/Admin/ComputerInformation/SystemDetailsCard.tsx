import type { Status } from "@/utils/computer";
import { statusConfig } from "@/utils/computer";
import { Braces, Cpu, HardDrive, MemoryStick, Microchip, MonitorCog } from "lucide-react";


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
}: SystemDetailsProps){

    const statusData = statusConfig[status];
    const items = [
        { label: "Operating System", value: operatingSystem, icon: MonitorCog },
        { label: "Processor", value: cpu, icon: Cpu },
        { label: "Graphics Card", value: gpu, icon: HardDrive },
        { label: "Installed RAM", value: ramSize, icon: MemoryStick },
        { label: "Storage", value: diskSize, icon: HardDrive },
        { label: "Motherboard", value: motherboard, icon: Microchip },
        { label: "Build Version", value: buildVersion, icon: Braces },
    ];

    return(
            <>
                <div className="overflow-hidden bg-white rounded-3xl w-full max-w-[600px] md:max-w-[550px] shadow-[0_16px_38px_rgba(15,23,42,0.12)]">
                    
                    <div className="primary-bg-color px-6 py-6 text-white">
                        <div className="flex items-center gap-4">
                            <span className="grid size-14 place-items-center rounded-2xl bg-white/15">
                                <Cpu className="size-7"/>
                            </span>
                            <div>
                                <h2 className="text-2xl font-bold">System Specifications</h2>
                                <p className="text-sm font-semibold text-white/70">Hardware and operating system details</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6">
                        {items.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex items-center gap-5">
                                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f8eee9]">
                                    <Icon className="size-7 primary-text-color" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{label}</p>
                                    <p className="truncate text-xl font-bold text-zinc-900">{value}</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4">
                            <span className="font-bold text-zinc-500">Computer Status</span>
                            <span className={`flex w-fit items-center rounded-full px-3 py-1.5 text-sm font-bold ${statusData?.className}`}>{status}</span>
                        </div>
                    </div>

                </div>
            </>
        );
}
