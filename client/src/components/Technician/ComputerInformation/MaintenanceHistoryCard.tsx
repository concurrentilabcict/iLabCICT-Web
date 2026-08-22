
import type { MaintenanceHistory, MaintenanceHistoryRepairLog } from "@/types/maintenanceHistory";
import { useQuery } from "@tanstack/react-query";
import { ClipboardClock } from "lucide-react";
import { createApiError, privateFetch } from "@/lib/api";
import { maintenanceTypeConfig, type MaintenanceTypes } from "@/utils/maintenanceHistory";
import { formatDateTime } from "@/utils/string";
import { Fragment, useMemo } from "react";

type MaintenanceHistoryCardType = {
    computerId: number,
    openSheet: (open: boolean) => void,
    setMaintenanceHistory: (maintenanceHistory: MaintenanceHistory) => void
}

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
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

const fallbackMaintenanceType = {
    icon: ClipboardClock,
    className: "bg-gray-100 text-gray-700",
};


export default function MaintenanceHistoryCard({computerId, openSheet,setMaintenanceHistory}: MaintenanceHistoryCardType){

    const mapMaintenanceHistory = (maintenanceHistory: ApiMaintenanceHistory) : MaintenanceHistory=>({
        id: maintenanceHistory.id,
        maintenanceHistoryCode: maintenanceHistory.maintenance_history_code,
        maintenanceType: maintenanceHistory.maintenance_type,
        maintenanceNotes: maintenanceHistory.maintenance_notes,
        performedBy: maintenanceHistory.performed_by,
        datePerformed: maintenanceHistory.date_performed,
        computerId: maintenanceHistory.computer,
        technicianId: maintenanceHistory.technician,
        repairLog: maintenanceHistory.repair_log
    });

    const {data: maintenanceHistory = [], isLoading } = useQuery<MaintenanceHistory[]>({
        queryKey: ["maintenanceHistory", computerId],
        queryFn: async () => {
             const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/maintenance-history/?computer-id=${computerId}`);
               
             
            const data = await res.json();

            if(!res.ok){
                const message = data && typeof data === "object" && "message" in data
                    ? String(data.message)
                    : "Failed to fetch maintenance history.";

                throw createApiError(res.status, message)
            }

            return (data as ApiMaintenanceHistory[]).map(mapMaintenanceHistory)
        } 
    });

    const filterMaintenanceHistory = useMemo(() => {
        return[...maintenanceHistory]
            .sort(
                (a, b) =>
                    new Date(b.datePerformed).getTime() -
                    new Date(a.datePerformed).getTime()
            )
    }, [maintenanceHistory]);


    return(
        <>
              <div className="self-start bg-white flex flex-col gap-y-2.5
                rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px] max-h-[480px] min-h-[480px] shadow-[0_12px_32px_rgba(15,23,42,0.10)]">
                    
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex gap-2 items-center">
                            <ClipboardClock size={20} className="primary-text-color"/>
                            <span className="text-md font-semibold">Maintenance History</span>
                        </div>
                    </div>

                    <div className="flex-1 gap-y-1.5 overflow-y-auto">


                    {isLoading && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading maintenance history...
                    </p>
                    )}

                    {!isLoading && filterMaintenanceHistory.length === 0 &&(
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No history found.
                    </p>
                    )}

                    {!isLoading && filterMaintenanceHistory.map((mh, index)=> {

                        const typeData =
                            maintenanceTypeConfig[formatLabel(mh.maintenanceType) as MaintenanceTypes] ??
                            fallbackMaintenanceType;
                        const TypeIcon = typeData.icon
                        const maintenanceTitle = formatLabel(mh.repairLog?.title || "No title")
                        const maintenanceStatus = formatLabel(mh.repairLog?.ticket?.status || "No status")

                        return(
                            <Fragment key={mh.id}>
                            <div 
                            onClick={()=>{
                                setMaintenanceHistory(mh)
                                openSheet(true)
                            }}
                            className="flex gap-2 items-start hover:cursor-pointer">
                            
                                <div className={`shrink-0 ${typeData.className} p-2 rounded-md`}>
                                    <TypeIcon
                                    size={32}
                                    />
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    <div className="flex gap-2 items-center">
                                        <span className="font-semibold text-sm">{mh.maintenanceHistoryCode}</span>
                                        <span className={`font-medium ${typeData.className} text-xs px-1.5 py-1 rounded-md`}>{formatLabel(mh.maintenanceType)}</span>
                                    </div>
                                    
                                    <div className="flex gap-1 items-center">
                                        <span className="secondary-text-color text-xs">{maintenanceTitle}</span>
                                        <span className="secondary-text-color text-xs">-</span>
                                        <span className="secondary-text-color text-xs">{maintenanceStatus}</span>
                                    </div>

                                    <span className="muted-text-color text-xs">{formatDateTime(mh.datePerformed)}</span>
                                </div>
                            
                            </div>
                            {index < filterMaintenanceHistory.length-1 && (
                                <div className="border-t primary-border-color my-1.5"></div>
                            )}
                        
                            </Fragment>
                        )
                    })}
                        
                    </div>

                </div>
        </>
        );
}
