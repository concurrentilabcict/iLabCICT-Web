import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
    buildApiUrl,
    buildWebSocketUrl,
    createApiError,
    getFreshAccessToken,
    privateFetch,
} from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiRoom, Room } from "@/types/room";
import RoomCard from "./RoomCard";
import LaboratorySkeleton from "@/components/LaboratorySkeleton/LaboratorySkeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Status, StatusFilter, Floor, FloorFilter } from "@/utils/room";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type LaboratoryProps = {
    statusFilter: StatusFilter,
    floorFilter: FloorFilter,
    searchQuery: string
}

type RoomsWebSocketEvent =
    | {
        event: "initial_rooms";
        room: ApiRoom[];
        next?: string | null;
    }
    | {
        event: "room_created" | "room_updated";
        room: ApiRoom;
    };

const ROOMS_QUERY_KEY = ["rooms"] as const;
const ROOMS_WS_ENDPOINT = "/ws/rooms/";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isRoomsWebSocketEvent = (value: unknown): value is RoomsWebSocketEvent => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_rooms") {
        return Array.isArray(value.room);
    }

    return (
        ["room_created", "room_updated"].includes(value.event) &&
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
            firstName: room.assigned_custodian.first_name,
        }
        : null,
    assignedTechnician: room.assigned_technician
        ? {
            id: room.assigned_technician.id,
            lastName: room.assigned_technician.last_name,
            firstName: room.assigned_technician.first_name,
        }
        : null,
    floorNumber: room.floor_number,
    roomName: room.room_name,
    buildingName: room.building_name,
    status: room.status,
    createdAt: room.created_at,
    updatedAt: room.updated_at,
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
    statusFilter,
    floorFilter,
    searchQuery
}: LaboratoryProps){
    const queryClient = useQueryClient();
    const roomSocketRef = useRef<WebSocket | null>(null);
    const ITEMS_PER_PAGE = 10;
    const isMobile = useMediaQuery("(max-width: 767px)");
    const filterKey = JSON.stringify([statusFilter, floorFilter, searchQuery]);
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey
    });

    const { data: rooms = [], isLoading } = useQuery<Room[]>({
        queryKey: ROOMS_QUERY_KEY,
        queryFn: async () => {
            const res = await privateFetch(buildApiUrl("/api/rooms/"))

            const data = await res.json();
            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch rooms.')
            }

            return (data as ApiRoom[]).map(mapRoom)
        },
    });

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
                    queryClient.setQueryData<Room[]>(
                        ROOMS_QUERY_KEY,
                        parsedMessage.room.map(mapRoom)
                    );
                    return;
                }

                queryClient.setQueryData<Room[]>(
                    ROOMS_QUERY_KEY,
                    (currentRooms = []) =>
                        upsertRoom(currentRooms, parsedMessage.room)
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
                    <LaboratorySkeleton />
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
                        <RoomCard key={room.id}
                            status={status} location={location} assignedCustodian={custodian} room={room}
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

                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem key={i + 1}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => goToPage(i + 1)}
                                    >
                                        {i + 1}
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
        </>


    );
}
