import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerList from "@/components/Admin/ComputerList/ComputerList";
import SearchFilter from "@/components/Admin/ComputerList/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import { useQueryClient } from "@tanstack/react-query";

import { useEffect, useMemo, useState } from "react";
import ButtonGroup from "@/components/Admin/ComputerList/ButtonGroup";
import type { StatusFilter } from "@/utils/computer";
import { useLocation, useParams } from "react-router-dom";
import type { ComputerCardType } from "@/types/computer";
import type { Room } from "@/types/room";

type ComputerListLocationState = {
    roomName?: string;
};

export default function AdminComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");
    const queryClient = useQueryClient();

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
    const [computers, setComputers] = useState<ComputerCardType[]>([])

    const { room } = useParams();
    const location = useLocation();
    const locationState = location.state as ComputerListLocationState | null;
    const decodedRoom = room ? decodeURIComponent(room) : "";
    const cachedRooms =
        queryClient.getQueryData<Room[]>(["rooms"]) ??
        queryClient.getQueryData<Room[]>(["admin-dashboard-rooms"]) ??
        [];
    const matchedRoom = useMemo(
        () =>
            cachedRooms.find(
                (currentRoom) =>
                    currentRoom.roomName === decodedRoom ||
                    String(currentRoom.id) === decodedRoom
            ),
        [cachedRooms, decodedRoom]
    );
    const roomId = matchedRoom ? String(matchedRoom.id) : decodedRoom;
    const [roomName, setRoomName] = useState(
        locationState?.roomName ?? matchedRoom?.roomName ?? decodedRoom
    );

    useEffect(()=>{
        document.title = `${roomName + ` | `}ILabCICT`;
    }, [roomName])

    useEffect(() => {
        setRoomName(locationState?.roomName ?? matchedRoom?.roomName ?? decodedRoom);
    }, [decodedRoom, locationState?.roomName, matchedRoom?.roomName]);


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
                                    computers={computers}
                                    roomName={roomName}
                                    setSheetOpen={setSheetOpen}
                                    custodianName={custodian}
                                    setIsEditing={setIsEditing}
                                    setSelectedComputer={setSelectedComputer}
                                />
                                <ComputerList
                                    setComputers={setComputers}
                                    isEditing={isEditing}
                                    selectedComputer={selectedComputer}
                                    setIsEditing={setIsEditing}
                                    setSelectedComputer={setSelectedComputer}
                                    setSheetOpen={setSheetOpen}
                                    sheetOpen={sheetOpen}
                                    roomId={roomId}
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
