import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerList from "@/components/Faculty/ComputerList/ComputerList";
import SearchFilter from "@/components/Faculty/ComputerList/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import RequestHistory from "@/components/RequestHistory/RequestHistory";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { useEffect, useState } from "react";
import type { StatusFilter } from "@/utils/computer";
import { useParams } from "react-router-dom";
import { Eye } from "lucide-react";


export default function FacultyComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const [custodian, setCustodian] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [requestHistoryOpen, setRequestHistoryOpen] = useState(false);
    const [roomDatabaseId, setRoomDatabaseId] = useState<number | null>(null);
  

    const { room } = useParams();
    const roomId = room ? decodeURIComponent(room) : "";
    const [resolvedRoomName, setResolvedRoomName] = useState({
        roomId,
        name: roomId,
    });
    const roomName =
        resolvedRoomName.roomId === roomId
            ? resolvedRoomName.name
            : roomId;
    const handleRoomNameChange = (name: string) => {
        setResolvedRoomName({ roomId, name });
    };

    useEffect(()=>{
        document.title = `${roomName + ` | `}ILabCICT`;
    }, [roomName])


    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                        <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <MobileHeader title={roomName}/> : <Header title={roomName}/>}
                            <div className="mx-auto max-w-[1000px]">
                                <SearchFilter
                                    custodianName={custodian}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedStatus={statusFilter}
                                    onStatusChange={setStatusFilter}
                                />
                                <div className="flex justify-end px-3 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => setRequestHistoryOpen(true)}
                                        disabled={!roomDatabaseId}
                                        className="flex h-9 items-center gap-1.5 rounded-xl border border-[#bf3419] bg-white px-3.5 text-sm font-semibold primary-text-color shadow-sm shadow-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Eye size={16} />
                                        Request History
                                    </button>
                                </div>

                                <ComputerList
                                    roomId={roomId}
                                    statusFilter={statusFilter}
                                    searchQuery={searchQuery}
                                    setCustodian={setCustodian}
                                    setRoomDatabaseId={setRoomDatabaseId}
                                    setRoomName={handleRoomNameChange}
                                />
                                <Sheet
                                    open={requestHistoryOpen}
                                    onOpenChange={setRequestHistoryOpen}
                                >
                                    <SheetContent
                                        side={isMobile ? "bottom" : "right"}
                                        className={isMobile ? "h-[90vh] p-0" : "w-[520px]! p-0"}
                                    >
                                        <RequestHistory roomId={roomDatabaseId} />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </SidebarInset>
            </SidebarProvider>
        </>
    );
}
