import { useMediaQuery } from "@/hooks/useMediaQuery";
import { buildWebSocketUrl, getFreshAccessToken } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiRoom, EditRoomFormType, Room } from "@/types/room";
import RoomCard from "./RoomCard";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Status, StatusFilter, Floor, FloorFilter } from "@/utils/room";
import { getPaginationWindow } from "@/utils/pagination";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import AddRoomForm from "./AddRoomForm";
import EditRoomForm from "./EditRoomForm";
import { useSearchParams } from "react-router-dom";

type LaboratoryProps = {
    setRooms: (rooms: Room[]) => void
    statusFilter: StatusFilter,
    floorFilter: FloorFilter,
    searchQuery: string
    sheetOpen: boolean,
    isEditing: boolean,
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void,
    setSelectedRoom: Function,
    selectedRoom: EditRoomFormType
}

type RoomsWebSocketEvent =
    | {
        event: "initial_rooms";
        room?: ApiRoom[];
        rooms?: ApiRoom[];
        next?: string | null;
    }
    | {
        event: "room_created" | "room_updated" | "room_deleted";
        room: ApiRoom;
    };

const ROOMS_QUERY_KEY = ["rooms"] as const;
const ROOMS_READY_QUERY_KEY = ["rooms-ready"] as const;
const ROOMS_WS_ENDPOINT = "/ws/rooms/";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isRoomsWebSocketEvent = (value: unknown): value is RoomsWebSocketEvent => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_rooms") {
        return Array.isArray(value.room) || Array.isArray(value.rooms);
    }

    return (
        ["room_created", "room_updated", "room_deleted"].includes(value.event) &&
        isRecord(value.room)
    );
};

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
};

const floorConverter = (floor: number) => {
    if (floor === 1){
        return "1st Floor";
    }else if(floor === 2){
        return "2nd Floor";
    }else{
        return "3rd Floor";
    }
}

const mapRoom = (room: ApiRoom): Room => ({
    id: room.id,
    computerCount: room.computer_count ?? 0,
    activeIssuesCount:
        room.active_issues_count ?? room.computer_count_with_active_issues ?? 0,

    assignedCustodian: room.assigned_custodian
        ? {
            id: room.assigned_custodian.id,
            lastName: room.assigned_custodian.last_name,
            firstName: room.assigned_custodian.first_name
        }
        : null,

    assignedTechnician: room.assigned_technician
        ? {
            id: room.assigned_technician.id,
            lastName: room.assigned_technician.last_name,
            firstName: room.assigned_technician.first_name
        }
        : null,

    floorNumber: room.floor_number,
    roomName: room.room_name,
    buildingName: room.building_name,

    status: room.status,
    createdAt: room.created_at,
    updatedAt: room.updated_at
});

const upsertRoom = (rooms: Room[], apiRoom: ApiRoom) => {
    const room = mapRoom(apiRoom);
    const roomExists = rooms.some((currentRoom) => currentRoom.id === room.id);

    if (!roomExists) {
        return [room, ...rooms];
    }

    return rooms.map((currentRoom) =>
        currentRoom.id === room.id ? room : currentRoom
    );
};

export default function Laboratory({
    setRooms,
    statusFilter,
    floorFilter,
    searchQuery,
    sheetOpen,
    setIsEditing,
    setSheetOpen,
    isEditing,
    setSelectedRoom,
    selectedRoom
}: LaboratoryProps){
    
    const queryClient = useQueryClient();
    const roomSocketRef = useRef<WebSocket | null>(null);
    const ITEMS_PER_PAGE = 10;
    const isMobile = useMediaQuery("(max-width: 767px)");
    const cachedRoomsAreReady =
        queryClient.getQueryData<boolean>(ROOMS_READY_QUERY_KEY) === true;
    const [hasInitialRooms, setHasInitialRooms] = useState(cachedRoomsAreReady);
    const filterKey = JSON.stringify([statusFilter, floorFilter, searchQuery]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey
    });

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);

        if (!open) {
            setSearchParams({}, { replace: true });
        }
    }

    const { data: rooms = [], isPending } = useQuery<Room[]>({
        queryKey: ROOMS_QUERY_KEY,
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<Room[]>(ROOMS_QUERY_KEY) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<Room[]>(ROOMS_QUERY_KEY) ?? [],
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const isLoading = isPending || !hasInitialRooms;

    useEffect(() => {
        setRooms(rooms);
    }, [rooms, setRooms]);

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            const accessToken = await getFreshAccessToken();

            if (!accessToken) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(ROOMS_WS_ENDPOINT, { token: accessToken })
            );

            roomSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isRoomsWebSocketEvent(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_rooms") {
                    const initialRooms = parsedMessage.room ?? parsedMessage.rooms ?? [];
                    setHasInitialRooms(true);
                    queryClient.setQueryData(ROOMS_READY_QUERY_KEY, true);
                    queryClient.setQueryData<Room[]>(
                        ROOMS_QUERY_KEY,
                        initialRooms.map(mapRoom)
                    );
                    return;
                }

                if (parsedMessage.event === "room_deleted") {
                    queryClient.setQueryData<Room[]>(
                        ROOMS_QUERY_KEY,
                        (currentRooms = []) =>
                            currentRooms.filter((room) => room.id !== parsedMessage.room.id)
                    );
                    return;
                }

                queryClient.setQueryData<Room[]>(
                    ROOMS_QUERY_KEY,
                    (currentRooms = []) => upsertRoom(currentRooms, parsedMessage.room)
                );
            });
        }, 0);

        return () => {
            window.clearTimeout(connectSocket);
            socket?.close();

            if (roomSocketRef.current === socket) {
                roomSocketRef.current = null;
            }
        };
    }, [queryClient]);


    const filteredRooms = useMemo(() => {
        const normalizedQuery = searchQuery?.trim()

        return [...rooms]
            .sort(
                (a, b) => 
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )
            .filter((room) => {
                const status = formatLabel(room.status) as Status
                const floor = room.floorNumber as Floor

                const matchesStatus = 
                    statusFilter === "All" || status === statusFilter

                const matchesFloor = 
                    floorFilter === "All" || floor === floorFilter

                const searchableText = [
                    room.roomName,
                    room.buildingName,
                    room?.assignedCustodian?.lastName,
                    room?.assignedCustodian?.firstName,
                    room.floorNumber,
                    status,
                    floor
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch = 
                    normalizedQuery === "" ||
                    searchableText.includes(normalizedQuery)

                return matchesStatus && matchesSearch && matchesFloor
            })
    }, [rooms, statusFilter, floorFilter, searchQuery])

    const totalPages = Math.ceil(
        filteredRooms.length / ITEMS_PER_PAGE
    );

    const maxPage = Math.max(totalPages, 1);
    const currentPage = pagination.filterKey === filterKey
        ? Math.min(pagination.page, maxPage)
        : 1;
    const visiblePages = getPaginationWindow(currentPage, totalPages);

    const goToPage = (page: number) => {
        setPagination({
            page: Math.min(Math.max(page, 1), maxPage),
            filterKey
        });
    };

    const paginatedRooms = filteredRooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return(
    
            <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 mb-3`}>
                
                {isLoading && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading rooms...
                    </p>
                )}

                {!isLoading && paginatedRooms.length === 0 &&(
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No rooms found.
                    </p>
                )}

                {!isLoading && paginatedRooms.map((room)=> {

                    const status = formatLabel(room.status) as Status
                    const location = formatLabel(room.buildingName) + " - " + floorConverter(room.floorNumber) + ", " + room.roomName
                    const custodian = 
                        room.assignedCustodian ? 
                            formatLabel(room.assignedCustodian.firstName) + " " + formatLabel(room.assignedCustodian.lastName)
                            :
                            "No assigned custodian"

                    return(
                        <RoomCard 
                            key={room.id}
                            room={room}
                            status={status}
                            location={location}
                            assignedCustodian={custodian} 
                            setIsEditing={setIsEditing}
                            setSheetOpen={setSheetOpen}
                            setSelectedRoom={setSelectedRoom}
                        />
                    )
                })
                
                }
                
            </div>

             <div className={`px-3 ${isMobile ? "mb-23" : "mb-10"}`}>
                {totalPages > 1 && (
                    <Pagination className={`flex ${isMobile ? "justify-center" : "justify-end"}`}>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => goToPage(currentPage - 1)}
                                />
                            </PaginationItem>

                            {visiblePages.map((pageNumber) => (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        isActive={currentPage === pageNumber}
                                        onClick={() => goToPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => goToPage(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            <Sheet
            open={sheetOpen}
            onOpenChange={handleSheetOpenChange}
            >
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={
                    isMobile
                        ? "h-[90vh]"
                        : "w-[1000px]!"
                }
            >   


                        {isEditing ? 
                        (<EditRoomForm
                            room={selectedRoom}
                            closeSheet={()=> setSheetOpen(false)}
                        />) 
                        : 
                        (<AddRoomForm
                            closeSheet={() => setSheetOpen(false)}
                        />)}
                        
            </SheetContent>
        </Sheet>
        </>


    );
}
