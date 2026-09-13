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
import { Skeleton } from "@/components/ui/skeleton";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StatusFilter } from "@/utils/computer";
import { useLocation, useParams } from "react-router-dom";
import { Building2, Eye, Layers3, LaptopMinimal, User, Wrench, type LucideIcon } from "lucide-react";
import type { ComputerCardType } from "@/types/computer";
import type { Room } from "@/types/room";
import { useQueryClient } from "@tanstack/react-query";

type ComputerListLocationState = {
    roomName?: string;
};


export default function FacultyComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");
    const queryClient = useQueryClient();

    const [custodian, setCustodian] = useState("");
    const [computers, setComputers] = useState<ComputerCardType[]>([]);
    const [roomMeta, setRoomMeta] = useState({
        buildingName: "",
        floorNumber: 0,
        technicianName: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [requestHistoryOpen, setRequestHistoryOpen] = useState(false);
    const [roomDatabaseId, setRoomDatabaseId] = useState<number | null>(null);
    const [loadState, setLoadState] = useState<"loading" | "success" | "error">("loading");
  

    const { room } = useParams();
    const location = useLocation();
    const locationState = location.state as ComputerListLocationState | null;
    const roomId = room ? decodeURIComponent(room) : "";
    const cachedRooms = useMemo(
        () => queryClient.getQueryData<Room[]>(["rooms"]) ?? [],
        [queryClient]
    );
    const cachedRoomName = cachedRooms.find(
        (currentRoom) => String(currentRoom.id) === roomId
    )?.roomName;
    const fallbackRoomName = locationState?.roomName ?? cachedRoomName ?? "";
    const [resolvedRoomName, setResolvedRoomName] = useState({
        roomId,
        name: fallbackRoomName,
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
                                <div className="mx-3 my-3 rounded-2xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                                    <div className="min-w-0">
                                        <h1 className="truncate text-lg font-bold leading-snug text-zinc-950">{roomName}</h1>
                                        <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-zinc-500">
                                            <span className="flex items-center gap-1.5"><Building2 className="size-4 text-zinc-400" />{roomMeta.buildingName || "No building"}</span>
                                            <span className="flex items-center gap-1.5"><Layers3 className="size-4 text-zinc-400" />{roomMeta.floorNumber ? `Floor ${roomMeta.floorNumber}` : "No floor"}</span>
                                            <span className="flex items-center gap-1.5"><LaptopMinimal className="size-4 text-zinc-400" />{computers.length} computers</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <RoomDetail icon={User} label="Custodian" value={custodian || "No Assigned"} />
                                        <RoomDetail icon={Wrench} label="Technician" value={roomMeta.technicianName || "No Assigned"} />
                                    </div>
                                    <div className="mt-4 border-t border-gray-100 pt-4">
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
                                </div>
                                )}

                                <ComputerList
                                    roomId={roomId}
                                    statusFilter={statusFilter}
                                    searchQuery={searchQuery}
                                    setCustodian={setCustodian}
                                    setComputers={setComputers}
                                    setRoomMeta={setRoomMeta}
                                    setRoomDatabaseId={setRoomDatabaseId}
                                    setRoomName={handleRoomNameChange}
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

type RoomDetailProps = {
    icon: LucideIcon;
    label: string;
    value: string;
};

function RoomDetail({ icon: Icon, label, value }: RoomDetailProps) {
    return (
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-zinc-50 p-3 shadow-sm shadow-black/[0.01]">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-400">
                <Icon size={16} />
            </span>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{value}</p>
            </div>
        </div>
    );
}
