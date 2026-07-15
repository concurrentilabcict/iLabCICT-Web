import { Building, LaptopMinimal, TriangleAlert, User, SquarePen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { statusConfig, type Status } from "@/utils/room";
import type { Room } from "@/types/room";

type RoomCardProps = {
    status: Status,
    location:string,
    assignedCustodian: string,
    room: Room,
    setSelectedRoom: Function,
    setIsEditing: (open: boolean) => void,
    setSheetOpen: (open: boolean) => void
}

export default function RoomCard({
    status,
    location,
    assignedCustodian,
    room,
    setSelectedRoom,
    setIsEditing,
    setSheetOpen
}: RoomCardProps){

    const handleEditRoomClick = (room: Room) => {
                setSelectedRoom({
                    id: room.id,
                    roomName: room.roomName,
                    floorNumber: room.floorNumber,
                    buildingName: room.buildingName,
                    roomStatus: room.status,
                    assignedCustodianId:  room.assignedCustodian?.id || null
                })
                setIsEditing(true)
                setSheetOpen(true)
            }

    const statusData = statusConfig[status];
    const StatusIcon = statusData.icon

    const navigate = useNavigate()
    return(
        <>
        <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
        rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px] cursor-pointer">

                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">{room.roomName}</h1>   
                    
                    <div
                        className={`flex w-fit gap-x-2 items-center px-3 py-1.5 rounded-md ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span className="text-sm">{status}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Building className="secondary-text-color" size={16}/>
                    <h1 className="secondary-text-color">{location}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <User className="secondary-text-color" size={16}/>
                    <h1 className="secondary-text-color">{assignedCustodian}</h1>
                </div>

                <div className="flex justify-between ">
                    <div className="flex flex-col gap-3 py-3 px-6 bg-[#f8fafc] rounded-xl">
                       <span className="flex items-center gap-3 ">
                            <LaptopMinimal size={20}
                                className="primary-text-color"
                            />
                            <h1 className="secondary-text-color">Computers</h1>
                        </span>

                        <span className="font-bold text-2xl">{room.computerCount}</span> 
                    </div>

                    <div className="flex flex-col gap-3 py-3 px-6 bg-[#f8fafc] rounded-xl">
                       <span className="flex items-center gap-3">
                            <TriangleAlert 
                                className="text-[#FF0000]"
                                size={20}/>
                            <h1 className="secondary-text-color">Active Issues</h1>
                        </span>

                        <span className="font-bold text-2xl">{room.activeIssuesCount}</span> 
                    </div>
                </div>

                <div className="border-t primary-border-color my-2"></div>
                

                <div className="flex w-full gap-2 justify-between">
                    <button
                        onClick={()=> navigate(`/manage-laboratory/${room.roomName}`)}
                        type="button"
                        className="flex flex-1 justify-center gap-2.5 bg-white primary-bg-color shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white"
                        >
                        <LaptopMinimal size={20}/> View Computers
                    </button>

                    <button
                        onClick={()=>handleEditRoomClick(room)}
                        type="button"
                        className="bg-white shrink-0 rounded-md border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color hover: cursor-pointer"
                    >
                        <SquarePen size={20} className="secondary-text-color"/>
                    </button>
                </div>
                
             </div>
                
        </>
    );
}