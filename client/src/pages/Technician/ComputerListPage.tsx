import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerList from "@/components/Technician/ComputerList/ComputerList";
import SearchFilter from "@/components/Technician/ComputerList/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import { useQueryClient } from "@tanstack/react-query";

import { useEffect, useMemo, useState } from "react";
import ButtonGroup from "@/components/Technician/ComputerList/ButtonGroup";
import type { StatusFilter } from "@/utils/computer";
import { useLocation, useParams } from "react-router-dom";
import type { ComputerCardType } from "@/types/computer";
import type { Room } from "@/types/room";

type ComputerListLocationState = {
    roomName?: string;
};

export default function ComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");
    const queryClient = useQueryClient();

    const [custodian, setCustodian] = useState("");
    const [roomMeta, setRoomMeta] = useState({
        buildingName: "",
        floorNumber: 0,
        technicianName: ""
    });
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
    const cachedRooms = useMemo(
        () =>
            queryClient.getQueryData<Room[]>(["technician-rooms"]) ??
            queryClient.getQueryData<Room[]>(["rooms"]) ??
            [],
        [queryClient]
    );
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
    const fallbackRoomName = locationState?.roomName ?? matchedRoom?.roomName ?? decodedRoom;
    const [resolvedRoomName, setResolvedRoomName] = useState({
        roomId,
        name: fallbackRoomName
    });
    const roomName =
        resolvedRoomName.roomId === roomId
            ? resolvedRoomName.name
            : fallbackRoomName;
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
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedStatus={statusFilter}
                                    onStatusChange={setStatusFilter}
                                />
                                <ButtonGroup
                                    roomName={roomName}
                                    buildingName={roomMeta.buildingName}
                                    floorNumber={roomMeta.floorNumber}
                                    technicianName={roomMeta.technicianName}
                                    computers={computers}
                                    setSheetOpen={setSheetOpen}
                                    custodianName={custodian}
                                    setIsEditing={setIsEditing}
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
                                    setRoomMeta={setRoomMeta}
                                    setRoomName={handleRoomNameChange}
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
