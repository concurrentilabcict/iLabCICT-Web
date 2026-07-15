
import { peripheralStatusConfig, type PeripheralStatus } from "@/utils/computer";
import { Keyboard } from "lucide-react";

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

    return(
                <>
                <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
                rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px]">
                    
                    <div className="flex gap-2 items-center">
                        <Keyboard size={20} className="primary-text-color"/>
                        <span className="text-md font-semibold">Peripheral Status</span>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Monitor</span>

                            <span className={`flex w-fit p-1 items-center rounded-md text-sm ${monitorStatusData?.className}`}>{monitorStatus}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Uninterruptible Power Supply</span>

                            <span className={`flex w-fit p-1 items-center rounded-md text-sm ${upsStatusData?.className}`}>{upsStatus}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Mouse</span>

                            <span className={`flex w-fit p-1 items-center rounded-md text-sm ${mouseStatusData?.className}`}>{mouseStatus}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Keyboard</span>

                            <span className={`flex w-fit p-1 items-center rounded-md text-sm ${keyboardStatusData?.className}`}>{keyboardStatus}</span>
                        </div>
                    </div>

                </div>
            </>
        );
}