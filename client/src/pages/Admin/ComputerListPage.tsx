import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerList from "@/components/Admin/ComputerList/ComputerList";
import SearchFilter from "@/components/Admin/ComputerList/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import { useQueryClient } from "@tanstack/react-query";
import RequestHistory from "@/components/RequestHistory/RequestHistory";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
    const [roomMeta, setRoomMeta] = useState({
        buildingName: "",
        floorNumber: 0,
        technicianName: ""
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [requestHistoryOpen, setRequestHistoryOpen] = useState(false);
    const [roomDatabaseId, setRoomDatabaseId] = useState<number | null>(null);
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
            queryClient.getQueryData<Room[]>(["rooms"]) ??
            queryClient.getQueryData<Room[]>(["admin-dashboard-rooms"]) ??
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
                                    buildingName={roomMeta.buildingName}
                                    floorNumber={roomMeta.floorNumber}
                                    technicianName={roomMeta.technicianName}
                                    setSheetOpen={setSheetOpen}
                                    custodianName={custodian}
                                    setIsEditing={setIsEditing}
                                    onRequestHistoryClick={() => setRequestHistoryOpen(true)}
                                    isRequestHistoryDisabled={!roomDatabaseId}
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
                                    setRequestHistoryRoomId={setRoomDatabaseId}
                                    statusFilter={statusFilter}
                                    searchQuery={searchQuery}
                                    setCustodian={setCustodian}
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
