import { useMediaQuery } from "@/hooks/useMediaQuery";
import SystemDetailsCard from "./SystemDetailsCard";
import PeripheralDetailCard from "./PeripheralDetailCard";
import MaintenanceHistoryCard from "./MaintenanceHistoryCard";
import ComputerAssetCard from "@/components/ComputerInformation/ComputerAssetCard/ComputerAssetCard";
import type { Computer } from "@/types/computer";
import { useQuery } from "@tanstack/react-query";
import { createApiError, privateFetch } from "@/lib/api";
import type { PeripheralStatus, Status } from "@/utils/computer";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import MaintenanceHistoryDetails from "./MaintenanceHistoryDetails";
import { useState } from "react";
import type { MaintenanceHistory } from "@/types/maintenanceHistory";



type ComputerInformationType = {
    roomName: string,
    computerCode: string,
    setSheetOpen: (open: boolean) => void,
    sheetOpen: boolean
}

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
};

export default function ComputerInformation({
    roomName,
    computerCode,
    setSheetOpen,
    sheetOpen
}: ComputerInformationType){

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory>()

    const mapComputer = (computer: any): Computer => ({
        id:computer.id,
        computerCode: computer.computer_code,
        room: {
            id: computer.room.id,
            roomName: computer.room.room_name,
            buildingName: computer.room.building_name,
            floorNumber: computer.room.floor_number
        },
        operatingSystem: computer.operating_system,
        gpu: computer.gpu,
        cpu: computer.cpu,
        ramSizeInstalled: computer.ram_size_installed,
        diskSizeInstalled: computer.disk_size_installed,
        buildVersion: computer.build_version,
        computerStatus: computer.computer_status,
        motherboard: computer.motherboard,
        monitorStatus: computer.monitor_status,
        mouseStatus: computer.mouse_status,
        keyboardStatus: computer.keyboard_status,
        upsStatus: computer.ups_status,
        createdAt: computer.created_at,
        updatedAt: computer.updated_at
    });

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);
    }

    const { data: computer, isLoading } = useQuery<Computer>({
        queryKey: ["computer", roomName, computerCode],
        queryFn: async () => {
            console.log("fetching...")
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/rooms/${roomName}/computers/${computerCode}`);

            const data = await res.json();
            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch computer information.');
            }

            return mapComputer(data)
        }
    });
   
    return(
        <>
        
        <div className={`w-full px-3 py-3 ${isMobile ? 'mb-20' : ''}`}>

            {isLoading && (
                <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading computer info...
                    </p>
            )}
            
            {!isLoading && computer && (
                <div className="space-y-3">
                    <ComputerAssetCard
                        computerCode={computer.computerCode}
                        buildingName={formatLabel(computer.room.buildingName)}
                        roomName={computer.room.roomName}
                        floorNumber={computer.room.floorNumber}
                        status={formatLabel(computer.computerStatus) as Status}
                    />

                    <div className="grid items-start gap-3 sm:grid-cols-2">
                        <SystemDetailsCard 
                            cpu={computer.cpu}
                            gpu={computer.gpu}
                            motherboard={computer.motherboard}
                            operatingSystem={computer.operatingSystem}
                            ramSize={`${computer.ramSizeInstalled} GB`}
                            diskSize={`${computer.diskSizeInstalled} GB`}
                            buildVersion={computer.buildVersion}
                            updatedAt={computer.updatedAt}
                            createdAt={computer.createdAt}
                            status={formatLabel(computer.computerStatus) as Status}
                        />

                        <div className="flex flex-col gap-3">
                            <MaintenanceHistoryCard
                                setMaintenanceHistory={setMaintenanceHistory}
                                openSheet={handleSheetOpenChange}
                                computerId={computer.id}
                            />
                            <PeripheralDetailCard
                                monitorStatus={formatLabel(computer.monitorStatus) as PeripheralStatus}
                                upsStatus={formatLabel(computer.upsStatus) as PeripheralStatus}
                                keyboardStatus={formatLabel(computer.keyboardStatus) as PeripheralStatus}
                                mouseStatus={formatLabel(computer.mouseStatus) as PeripheralStatus}
                            />
                        </div>
                    </div>    
                </div>
            )}

            
        </div>

                <Sheet
                    open={sheetOpen}
                    onOpenChange={handleSheetOpenChange}
                    >
                    <SheetContent
                        side={isMobile ? "bottom" : "right"}
                        className={
                            isMobile
                                ? "h-[90vh]"
                                : "w-[1000px]!"
                        }
                    >
                        <MaintenanceHistoryDetails
                            maintenanceHistory={maintenanceHistory}
                        />
                    </SheetContent>
                </Sheet>

        </>
    );
}
