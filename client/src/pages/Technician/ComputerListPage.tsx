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
import { useParams } from "react-router-dom";
import type { ComputerCardType } from "@/types/computer";


export default function ComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const [custodian, setCustodian] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedComputer, setSelectedComputer] = useState<ComputerCardType>({
        id: 0,
        cpu: "",
        gpu: "",
        computerCode: "",
        motherboard: "",
        ramSizeInstalled: 0,
        diskSizeInstalled: 0,
        operatingSystem: "",
        buildVersion: "",
        computerStatus: "active",
        monitorStatus: "active",
        mouseStatus: "active" ,
        keyboardStatus: "active",
        upsStatus: "active" ,
        room: 0,
        updatedAt: "",
        createdAt: ""    
    })

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
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedStatus={statusFilter}
                                    onStatusChange={setStatusFilter}
                                />
                                <ButtonGroup
                                    setSheetOpen={setSheetOpen}
                                    custodianName={custodian}
                                    setIsEditing={setIsEditing}
                                    setSelectedComputer={setSelectedComputer}
                                />
                                <ComputerList
                                    isEditing={isEditing}
                                    selectedComputer={selectedComputer}
                                    setIsEditing={setIsEditing}
                                    setSelectedComputer={setSelectedComputer}
                                    setSheetOpen={setSheetOpen}
                                    sheetOpen={sheetOpen}
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