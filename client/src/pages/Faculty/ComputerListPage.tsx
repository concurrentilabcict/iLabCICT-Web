import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerList from "@/components/Faculty/ComputerList/ComputerList";
import SearchFilter from "@/components/Faculty/ComputerList/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";

import { useEffect, useState } from "react";
import type { StatusFilter } from "@/utils/computer";
import { useParams } from "react-router-dom";


export default function FacultyComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const [custodian, setCustodian] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  

    const { room } = useParams();
    const roomName = room ? decodeURIComponent(room) : "";

    useEffect(()=>{
        document.title = `${roomName + ` | `}ILabCICT`;
    }, [roomName])


    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                        <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <Header title={roomName}/>: <MobileHeader title={roomName}/>}
                            <div className="mx-auto max-w-[1000px]">
                                <SearchFilter
                                    custodianName={custodian}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedStatus={statusFilter}
                                    onStatusChange={setStatusFilter}
                                />

                                <ComputerList
                                    roomName={roomName}
                                    statusFilter={statusFilter}
                                    searchQuery={searchQuery}
                                    setCustodian={setCustodian}
                                />
                            </div>
                        </div>
                    </SidebarInset>
            </SidebarProvider>
        </>
    );
}