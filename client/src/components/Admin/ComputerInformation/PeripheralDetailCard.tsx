
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
                <div className="overflow-hidden bg-white rounded-3xl w-full max-w-[600px] md:max-w-[550px] shadow-[0_16px_38px_rgba(15,23,42,0.12)]">
                    
                    <div className="primary-bg-color px-6 py-6 text-white">
                        <div className="flex items-center gap-4">
                            <span className="grid size-14 place-items-center rounded-2xl bg-white/15">
                                <Cable className="size-7"/>
                            </span>
                            <div>
                                <h2 className="text-2xl font-bold">Peripherals</h2>
                                <p className="text-sm font-semibold text-white/70">Connected peripheral devices status</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-6">
                        {items.map(({ label, status, data, icon: Icon }) => (
                            <div key={label} className="flex items-center gap-4">
                                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f8eee9]">
                                    <Icon className="size-7 primary-text-color" />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{label}</p>
                                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-bold ${data?.className}`}>{status}</span>
                                </div>
                            </div>
                        ))}
                        </div>

                </div>
            </>
        );
}
