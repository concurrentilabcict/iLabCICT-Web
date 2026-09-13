import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerList from "@/components/Technician/ComputerList/ComputerList";
import SearchFilter from "@/components/Technician/ComputerList/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import { useQueryClient } from "@tanstack/react-query";
import RequestHistory from "@/components/RequestHistory/RequestHistory";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

import { useCallback, useEffect, useMemo, useState } from "react";
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
    const [requestHistoryOpen, setRequestHistoryOpen] = useState(false);
    const [roomDatabaseId, setRoomDatabaseId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loadState, setLoadState] = useState<"loading" | "success" | "error">("loading");
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
    const fallbackRoomName = locationState?.roomName ?? matchedRoom?.roomName ?? "";
    const [resolvedRoomName, setResolvedRoomName] = useState({
        roomId,
        name: fallbackRoomName
    });
    const roomName =
        resolvedRoomName.roomId === roomId
            ? resolvedRoomName.name
            : fallbackRoomName;
    const handleRoomNameChange = useCallback((name: string) => {
        setResolvedRoomName({ roomId, name });
    }, [roomId]);
    const handleLoadStateChange = useCallback(
        (state: "loading" | "success" | "error") => setLoadState(state),
        []
    );

    useEffect(()=>{
        document.title = `${roomName ? `${roomName} | ` : "Laboratory | "}ILabCICT`;
    }, [roomName])

    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                        <div className="min-h-screen w-full min-w-0 bg-[#f8fafc]">
                            {isMobile ? <MobileHeader title={roomName || "Laboratory"}/> : <Header title={roomName || "Laboratory"}/>}
                            <div className="mx-auto w-full min-w-0 max-w-[1000px]">
                                <SearchFilter
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedStatus={statusFilter}
                                    onStatusChange={setStatusFilter}
                                />
                                {loadState === "loading" ? (
                                    <RoomSummarySkeleton />
                                ) : loadState === "error" ? (
                                    <div className="mx-3 my-3 rounded-2xl bg-white p-6 text-center text-sm text-red-600 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                                        Laboratory details could not be loaded.
                                    </div>
                                ) : (
                                <ButtonGroup
                                    roomName={roomName}
                                    buildingName={roomMeta.buildingName}
                                    floorNumber={roomMeta.floorNumber}
                                    technicianName={roomMeta.technicianName}
                                    computers={computers}
                                    setSheetOpen={setSheetOpen}
                                    custodianName={custodian}
                                    setIsEditing={setIsEditing}
                                    onRequestHistoryClick={() => setRequestHistoryOpen(true)}
                                    isRequestHistoryDisabled={!roomDatabaseId}
                                    roomId={roomDatabaseId}
                                />
                                )}
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
                                    onLoadStateChange={handleLoadStateChange}
                                />
                                <Sheet
                                    open={requestHistoryOpen}
                                    onOpenChange={setRequestHistoryOpen}
                                >
                                    <SheetContent
                                        side={isMobile ? "bottom" : "right"}
                                        className={isMobile ? "data-[side=bottom]:h-[90dvh] overflow-hidden p-0" : "w-[520px]! overflow-hidden p-0"}
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

function RoomSummarySkeleton() {
    return (
        <div className="mx-3 my-3 space-y-4 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
            </div>
        </div>
    );
}
