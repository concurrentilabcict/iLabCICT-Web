
import { ClipboardClock, Cpu, CodeSquare } from "lucide-react";
import { Link } from "react-router-dom";
export default function MaintenanceHistoryCard(){

    const maintenanceHistory = [];


    return(
        <>
              <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
                rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px] h-full">
                    
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex gap-2 items-center">
                            <ClipboardClock size={20} className="primary-text-color"/>
                            <span className="text-md font-semibold">Maintenance History</span>
                        </div>

                        <Link 
                            to={"/"}
                            className="primary-text-color text-sm font-medium"
                            >
                                View All
                        </Link>
                    </div>

                    <div className="flex flex-col gap-1.5 overflow-y">
                        <div className="flex gap-2 items-start">
                            
                            <div className="shrink-0 bg-[#DBEAFE] p-2 rounded-md">
                                <Cpu
                                   size={32}
                                   className="text-[#3B82F6]"
                                />
                            </div>

                            <div className="flex flex-col gap-0.5">
                                <div className="flex gap-2 items-center">
                                    <span className="font-semibold text-sm">TK-2026-001</span>
                                    <span className="font-medium text-[#3B82F6] text-xs px-1.5 py-1 bg-[#DBEAFE] rounded-md">Hardware</span>
                                </div>

                                <div className="flex gap-1 items-center">
                                    <span className="secondary-text-color text-xs">Monitor Display Issues</span>
                                    <span className="secondary-text-color text-xs">-</span>
                                    <span className="secondary-text-color text-xs">Resolved</span>
                                </div>

                                <span className="muted-text-color text-xs">3 Days Ago</span>
                            </div>

                        </div>

                        <div className="border-t primary-border-color my-1.5"></div>

                    </div>

                </div>
        </>
        );
}