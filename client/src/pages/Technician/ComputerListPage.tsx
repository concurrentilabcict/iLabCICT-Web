import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerList from "@/components/Technician/ComputerList/ComputerList";
import SearchFilter from "@/components/Technician/ComputerList/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";

import { useEffect, useState } from "react";
import ButtonGroup from "@/components/Technician/ComputerList/ButtonGroup";
import type { StatusFilter } from "@/utils/computer";


export default function ComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const [custodian, setCustodian] = useState("");
    const [roomName, setRoomName] = useState("");    
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

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
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedStatus={statusFilter}
                                    onStatusChange={setStatusFilter}
                                />
                                <ButtonGroup
                                    custodianName={custodian}
                                />
                                <ComputerList
                                    setRoomName={setRoomName}
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