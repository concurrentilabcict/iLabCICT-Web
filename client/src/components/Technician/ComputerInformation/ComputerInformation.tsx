import { useMediaQuery } from "@/hooks/useMediaQuery";
import SystemDetailsCard from "./SystemDetailsCard";
import PeripheralDetailCard from "./PeripheralDetailCard";
import MaintenanceHistoryCard from "./MaintenanceHistoryCard";
import type { Computer } from "@/types/computer";
import { useQuery } from "@tanstack/react-query";
import { createApiError, privateFetch } from "@/lib/api";
import type { PeripheralStatus, Status } from "@/utils/computer";

type ComputerInformationType = {
    roomId: string,
    computerCode: string,
    setAddress: Function
}

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
};

const floorConverter = (floor: number) => {
    if (floor === 1){
        return "1st Floor";
    }else if(floor === 2){
        return "2nd Floor";
    }else{
        return "3rd Floor";
    }
}

export default function ComputerInformation({
    roomId,
    computerCode,
    setAddress
}: ComputerInformationType){

    const isMobile = useMediaQuery("(max-width: 767px)");

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

    const { data: computer, isLoading } = useQuery<Computer>({
        queryKey: ["computer", roomId, computerCode],
        queryFn: async () => {
            console.log("fetching...")
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/rooms/${roomId}/computers/${computerCode}`);

            const data = await res.json();
            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch computer information.');
            }

            console.log(data)
            const computerAddress = 
            formatLabel(data.room.building_name) + " - " 
            + floorConverter(data.room.floor_number) + ", " 
            + data.room.room_name;
            
            console.log(computerAddress)
            setAddress(computerAddress);

            return mapComputer(data)
        }
    });
   
    return(
        <>
        
        <div className={`flex items-center w-full flex-col gap-3 px-3 py-3 ${isMobile ? 'mb-20' : ''}
        sm:grid sm:grid-cols-2 bg-red`}>
            
            {!isLoading && computer && (
                <>
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

                    <MaintenanceHistoryCard/>
                    <PeripheralDetailCard
                        monitorStatus={formatLabel(computer.monitorStatus) as PeripheralStatus}
                        upsStatus={formatLabel(computer.upsStatus) as PeripheralStatus}
                        keyboardStatus={formatLabel(computer.keyboardStatus) as PeripheralStatus}
                        mouseStatus={formatLabel(computer.mouseStatus) as PeripheralStatus}
                    />
                
                </>
            )}

            
        </div>

        </>
    );
}