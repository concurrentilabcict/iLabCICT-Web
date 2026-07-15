import type { Status } from "@/utils/computer";
import { statusConfig } from "@/utils/computer";
import { formatDateTime } from "@/utils/string";
import { Cpu } from "lucide-react";


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
    updatedAt
}: SystemDetailsProps){

    const statusData = statusConfig[status];

    return(
            <>
                <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
                rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px]">
                    
                    <div className="flex gap-2 items-center">
                        <Cpu size={20} className="primary-text-color"/>
                        <span className="text-md font-semibold">Specifications</span>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">CPU</span>

                            <span className="text-sm">{cpu}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Motherboard</span>

                            <span className="text-sm">{motherboard}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Operating System</span>

                            <span className="text-sm">{operatingSystem}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Storage</span>

                            <span className="text-sm">{diskSize}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    
                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">GPU</span>

                            <span className="text-sm">{gpu}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    
                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">RAM</span>

                            <span className="text-sm">{ramSize}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Build Version</span>

                            <span className="text-sm">{buildVersion}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Creation Date</span>

                            <span className="text-sm">{formatDateTime(createdAt)}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Last Modified</span>

                            <span className="text-sm">{formatDateTime(updatedAt)}</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <span className="secondary-text-color text-sm">Status</span>

                            <span className={`flex w-fit p-1 items-center rounded-md text-sm ${statusData?.className}`}>{status}</span>
                        </div>
                    </div>

                </div>
            </>
        );
}