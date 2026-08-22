
import { peripheralStatusConfig, type PeripheralStatus } from "@/utils/computer";
import { Keyboard, Monitor, Mouse, Plug, Cable } from "lucide-react";

type PeripheralDetailProps = {
    monitorStatus: PeripheralStatus,
    upsStatus: PeripheralStatus,
    mouseStatus: PeripheralStatus,
    keyboardStatus: PeripheralStatus,
}

export default function PeripheralDetailCard({
    monitorStatus,
    upsStatus,
    mouseStatus,
    keyboardStatus
}: PeripheralDetailProps){

    const monitorStatusData = peripheralStatusConfig[monitorStatus];
    const upsStatusData = peripheralStatusConfig[upsStatus];
    const mouseStatusData = peripheralStatusConfig[mouseStatus];
    const keyboardStatusData = peripheralStatusConfig[keyboardStatus];
    const items = [
        { label: "Monitor", status: monitorStatus, data: monitorStatusData, icon: Monitor },
        { label: "Mouse", status: mouseStatus, data: mouseStatusData, icon: Mouse },
        { label: "Keyboard", status: keyboardStatus, data: keyboardStatusData, icon: Keyboard },
        { label: "UPS", status: upsStatus, data: upsStatusData, icon: Plug },
    ];

    return(
                <>
                <div className="w-full max-w-[600px] shrink-0 rounded-3xl border border-white bg-white p-3.5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:max-w-[550px]">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
                            <Cable size={18}/>
                        </span>
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold leading-snug text-zinc-950">Peripherals</h2>
                            <p className="truncate text-sm font-medium text-zinc-500">Connected device status</p>
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        {items.map(({ label, status, data, icon: Icon }) => (
                            <div key={label} className="flex min-w-0 items-center gap-2 rounded-2xl bg-zinc-50 p-2.5">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400">
                                    <Icon size={15} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
                                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-sm font-semibold ${data?.className}`}>{status}</span>
                                </div>
                            </div>
                        ))}
                        </div>

                </div>
            </>
        );
}
