import { useMediaQuery } from "@/hooks/useMediaQuery";
import SystemDetailsCard from "./SystemDetailsCard";
import PeripheralDetailCard from "./PeripheralDetailCard";
import MaintenanceHistoryCard from "./MaintenanceHistoryCard";
import ComputerAssetCard from "@/components/ComputerInformation/ComputerAssetCard/ComputerAssetCard";
import type { Computer } from "@/types/computer";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type { PeripheralStatus, Status } from "@/utils/computer";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import MaintenanceHistoryDetails from "./MaintenanceHistoryDetails";
import { useState } from "react";
import type { MaintenanceHistory, MaintenanceHistoryRepairLog } from "@/types/maintenanceHistory";



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
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
};

type ApiComputerDetails = {
    id: number;
    computer_code: string;
    room: {
        id: number;
        room_name: string;
        building_name: string;
        floor_number: number;
    };
    operating_system: string;
    gpu: string;
    cpu: string;
    ram_size_installed: number;
    disk_size_installed: number;
    build_version: string;
    computer_status: string;
    motherboard: string;
    monitor_status: string;
    mouse_status: string;
    keyboard_status: string;
    ups_status: string;
    created_at: string;
    updated_at: string;
    message?: string;
};

type ApiMaintenanceHistory = {
    id: number;
    maintenance_history_code: string;
    maintenance_type: string;
    maintenance_notes: string;
    performed_by: string;
    computer: number;
    technician: number;
    date_performed: string;
    repair_log: MaintenanceHistoryRepairLog;
};

type ComputerInformationData = {
    computer: Computer;
    maintenanceHistory: MaintenanceHistory[];
};

export default function ComputerInformation({
    roomName,
    computerCode,
    setSheetOpen,
    sheetOpen
}: ComputerInformationType){

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory>()

    const mapComputer = (computer: ApiComputerDetails): Computer => ({
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

    const mapMaintenanceHistory = (history: ApiMaintenanceHistory): MaintenanceHistory => ({
        id: history.id,
        maintenanceHistoryCode: history.maintenance_history_code,
        maintenanceType: history.maintenance_type,
        maintenanceNotes: history.maintenance_notes,
        performedBy: history.performed_by,
        datePerformed: history.date_performed,
        computerId: history.computer,
        technicianId: history.technician,
        repairLog: history.repair_log
    });

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);
    }

    const { data, isLoading } = useQuery<ComputerInformationData>({
        queryKey: ["computer", roomName, computerCode],
        queryFn: async () => {
            const computerRes = await privateFetch(
                buildApiUrl(`/api/computers/${encodeURIComponent(computerCode)}/`)
            );

            const computerData = (await computerRes.json()) as ApiComputerDetails;
            if(!computerRes.ok){
                throw createApiError(computerRes.status, computerData.message || 'Failed to fetch computer information.');
            }

            const computer = mapComputer(computerData);
            const [historyRes] = await Promise.all([
                privateFetch(buildApiUrl(`/api/maintenance-history/?computer-id=${computer.id}`)),
            ]);

            const [historyData] = await Promise.all([
                historyRes.json() as Promise<ApiMaintenanceHistory[] | { message?: string }>,
            ]);

            if (!historyRes.ok) {
                const message = typeof historyData === "object" && historyData !== null && "message" in historyData
                    ? String(historyData.message)
                    : "Failed to fetch maintenance history.";

                throw createApiError(historyRes.status, message);
            }

            return {
                computer,
                maintenanceHistory: (historyData as ApiMaintenanceHistory[]).map(mapMaintenanceHistory),
            };
        }
    });
    const computer = data?.computer;
    const maintenanceHistoryList = data?.maintenanceHistory ?? [];
   
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
                                maintenanceHistoryData={maintenanceHistoryList}
                                isLoadingOverride={isLoading}
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
