import { useMediaQuery } from "@/hooks/useMediaQuery";
import { privateFetch, createApiError } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Room } from "@/types/room";
import RoomCard from "./RoomCard";
import { useMemo } from "react";
import type { Status, StatusFilter, Floor, FloorFilter } from "@/utils/room";

type LaboratoryProps = {
    statusFilter: StatusFilter,
    floorFilter: FloorFilter,
    searchQuery: string
}
const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
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
    statusFilter,
    floorFilter,
    searchQuery
}: LaboratoryProps){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const mapRoom = (room: any): Room => ({
        id: room.id,
        computerCount: room.computer_count,
        activeIssuesCount: room.computer_count_with_active_issues,

        assignedCustodian: {
            id: room.assigned_custodian.id,
            lastName: room.assigned_custodian.last_name,
            firstName: room.assigned_custodian.first_name
        },
        
        floorNumber: room.floor_number,
        roomName: room.room_name,
        buildingName: room.building_name,
        
        status: room.status,
        createdAt: room.created_at,
        updatedAt: room.updated_at
    });

    const { data: rooms = [], isLoading} = useQuery<Room[]>({
        queryKey: ["rooms"],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/rooms/`)

            const data = await res.json();

            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch rooms.')
            }

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
                    room.assignedCustodian.lastName,
                    room.assignedCustodian.firstName,
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

    return(
        <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 ${isMobile ? "mb-23" : "mb-10"}`}>
                {isLoading && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading rooms...
                    </p>
                )}

                {!isLoading && filteredRooms.map((room)=> {

                    const status = formatLabel(room.status) as Status
                    const location = formatLabel(room.buildingName) + " - " + floorConverter(room.floorNumber) + ", " + room.roomName
                    const custodian = formatLabel(room.assignedCustodian.firstName) + " " + formatLabel(room.assignedCustodian.lastName)


                    return(
                        <RoomCard key={room.id}
                            status={status} location={location} assignedCustodian={custodian} roomName={room.roomName}
                            computerCount={room.computerCount} activeIssuesCount={room.activeIssuesCount}
                        />
                    )
                })
                
                }
                
        </div>
    );
}