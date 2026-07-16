import { useMediaQuery } from "@/hooks/useMediaQuery";
import { privateFetch, createApiError } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { EditRoomFormType, Room, RoomForm } from "@/types/room";
import RoomCard from "./RoomCard";
import { useMemo, useState } from "react";
import type { Status, StatusFilter, Floor, FloorFilter } from "@/utils/room";
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
    setRooms: Function 
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
const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
    
    const ITEMS_PER_PAGE = 10;
    const isMobile = useMediaQuery("(max-width: 767px)");
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

    const mapRoom = (room: any): Room => ({
        id: room.id,
        computerCount: room.computer_count,
        activeIssuesCount: room.computer_count_with_active_issues,

        assignedCustodian: room.assigned_custodian ?
        {
            id: room.assigned_custodian.id,
            lastName: room.assigned_custodian.last_name,
            firstName: room.assigned_custodian.first_name
        } :
        null,
        
        floorNumber: room.floor_number,
        roomName: room.room_name,
        buildingName: room.building_name,
        
        status: room.status,
        createdAt: room.created_at,
        updatedAt: room.updated_at
    });

    const { data: rooms = [], isLoading } = useQuery<Room[]>({
        queryKey: ["rooms"],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/rooms/`)

            const data = await res.json();
            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch rooms.')
            }
            
            setRooms(data.map(mapRoom));
            return data.map(mapRoom)
        },
    });


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