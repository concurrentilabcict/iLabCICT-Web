
import type { MaintenanceHistory } from "@/types/maintenanceHistory";
import { useQuery } from "@tanstack/react-query";
import { ClipboardClock, Cpu, CodeSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { createApiError, privateFetch } from "@/lib/api";
import { maintenanceTypeConfig, type MaintenanceTypes } from "@/utils/maintenanceHistory";
import { formatDateTime } from "@/utils/string";
import { useMemo } from "react";

type MaintenanceHistoryCardType = {
    computerId: number,
    openSheet: (open: boolean) => void,
    setMaintenanceHistory: Function
}

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
};

const fallbackMaintenanceType = {
    icon: ClipboardClock,
    className: "bg-gray-100 text-gray-700",
};


export default function MaintenanceHistoryCard({computerId, openSheet,setMaintenanceHistory}: MaintenanceHistoryCardType){

    const mapMaintenanceHistory = (maintenanceHistory: any) : MaintenanceHistory=>({
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
        queryKey: ["maintenanceHistory"],
        queryFn: async () => {
             const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/maintenance-history/?computer-id=${computerId}`);
               
             
            const data = await res.json();

            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch rooms.')
            }

            return data.map(mapMaintenanceHistory)
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
              <div className="flex h-[430px] min-h-0 w-full max-w-[600px] flex-col gap-y-2.5 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:max-w-[550px]">
                    
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex gap-2 items-center">
                            <ClipboardClock size={20} className="primary-text-color"/>
                            <span className="text-md font-semibold">Maintenance History</span>
                        </div>
                    </div>

	                    <div className="min-h-0 flex-1 gap-y-1.5 overflow-y-auto pr-1">


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
                            <>
                            <div 
                            onClick={()=>{
                                setMaintenanceHistory(mh)
                                openSheet(true)
                            }}
                            className="flex gap-2 items-start hover:cursor-pointer">
                            
                                <div className={`shrink-0 ${typeData.className} p-1.5 pt-1 rounded-md`}>
                                    <TypeIcon
                                    size={24}
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
                        
                            </>
                        )
                    })}
                        
                    </div>

                </div>
        </>
        );
}
