
import type { MaintenanceHistory, MaintenanceHistoryRepairLog } from "@/types/maintenanceHistory";
import { useQuery } from "@tanstack/react-query";
import { ClipboardClock } from "lucide-react";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { maintenanceTypeConfig, type MaintenanceTypes } from "@/utils/maintenanceHistory";
import { formatDateTime } from "@/utils/string";
import { Fragment, useMemo } from "react";
import MaintenanceHistorySkeleton from "@/components/MaintenanceHistorySkeleton/MaintenanceHistorySkeleton";

type MaintenanceHistoryCardType = {
    computerId: number,
    openSheet: (open: boolean) => void,
    setMaintenanceHistory: (maintenanceHistory: MaintenanceHistory) => void,
    maintenanceHistoryData?: MaintenanceHistory[],
    isLoadingOverride?: boolean
}

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
};

const fallbackMaintenanceType = {
    icon: ClipboardClock,
    className: "bg-gray-100 text-gray-700",
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

export default function MaintenanceHistoryCard({
    computerId,
    openSheet,
    setMaintenanceHistory,
    maintenanceHistoryData,
    isLoadingOverride
}: MaintenanceHistoryCardType){

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

    const {data: queriedMaintenanceHistory = [], isLoading } = useQuery<MaintenanceHistory[]>({
        queryKey: ["maintenanceHistory", computerId],
        enabled: !maintenanceHistoryData,
        queryFn: async () => {
             const res = await privateFetch(buildApiUrl(`/api/maintenance-history/?computer-id=${computerId}`));
               
             
            const data = await res.json() as ApiMaintenanceHistory[] | { message?: string };

            if(!res.ok){
                const message = typeof data === "object" && data !== null && "message" in data
                    ? String(data.message)
                    : "Failed to fetch maintenance history.";

                throw createApiError(res.status, message)
            }

            return (data as ApiMaintenanceHistory[]).map(mapMaintenanceHistory)
        } 
    });
    const maintenanceHistory = maintenanceHistoryData ?? queriedMaintenanceHistory;
    const isHistoryLoading = isLoadingOverride ?? isLoading;

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
              <div className="flex h-[430px] min-h-0 w-full max-w-[600px] flex-col gap-y-2.5 rounded-2xl border border-gray-200 bg-white p-4 md:max-w-[550px]">
                    
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex gap-2 items-center">
                            <ClipboardClock size={20} className="primary-text-color"/>
                            <span className="text-md font-semibold">Maintenance History</span>
                        </div>
                    </div>

	                    <div className="min-h-0 flex-1 gap-y-1.5 overflow-y-auto pr-1">


                    {isHistoryLoading && (
                    <MaintenanceHistorySkeleton />
                    )}

                    {!isHistoryLoading && filterMaintenanceHistory.length === 0 &&(
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No history found.
                    </p>
                    )}

                    {!isHistoryLoading && filterMaintenanceHistory.map((mh, index)=> {

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
                        
                            </Fragment>
                        )
                    })}
                        
                    </div>

                </div>
        </>
        );
}
