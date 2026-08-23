import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { EditRoomFormType, Room } from "@/types/room"
import { Download, Upload, Plus } from "lucide-react"

type ButtonGroupType = {
    rooms: Room[]
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void,
    setSelectedRoom: (room: EditRoomFormType) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const escapeCsvCell = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
};

const getCustodian = (lastName: string | undefined, firstName: string | undefined) => {
    return lastName && firstName ? `${firstName} ${lastName}` : 'No Custodian';
}
export default function ButtonGroup({
    rooms,
    setSheetOpen,
    setIsEditing,
    setSelectedRoom
}: ButtonGroupType){

    const handleAddComputerClick = () => {
        setSelectedRoom({
            id: null,
            roomName: "",
            floorNumber: 1,
            buildingName: "pimentel",
            roomStatus: "operational",
            assignedCustodianId: null,
        });
        setIsEditing(false)
        setSheetOpen(true)
    }

    const exportRooms = () =>{
        if(rooms.length === 0){
            return;
        }

        const headers = [
            "Room ID",
            "Room Name",
            "Floor Number",
            "Building Name",
            "Assigned Custodian",
            "Computer Count",
            "Active Issues",
            "Status",
            "Created At",
            "Updated At"
        ];

        const rows = rooms.map((room)=>[
            room.id,
            room.roomName,
            room.floorNumber,
            room.buildingName,
            getCustodian(
                room.assignedCustodian?.lastName,
                room.assignedCustodian?.firstName
            ),
            room.computerCount,
            room.activeIssuesCount,
            room.status,
            formatDate(room.createdAt),
            formatDate(room.updatedAt)
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCsvCell).join(","))
            .join("\r\n");
        const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = `rooms-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(url);

    }


    const isMobile = useMediaQuery("(max-width: 767px)")

    return(
        <>

	        <div className="px-3 py-2">
	            <div className="flex items-center justify-between gap-x-2 rounded-2xl border border-gray-200 bg-white p-4">
	                <div>
	                    <button
	                    type="button"
	                    onClick={handleAddComputerClick}
	                    className="flex h-9 shrink-0 items-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white hover:cursor-pointer"
	                    >
	                        <Plus size={16}/> 
                        
                        <span>Add Room</span>
                    </button>
                </div>

                <div className="flex gap-2.5">
	                    <button
	                        onClick={exportRooms}
	                        type="button"
	                        className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color hover:cursor-pointer hover:bg-gray-50"
	                    >
                        <Download size={16}/>
                        <span className={isMobile ? 'hidden' : ''} >Export</span>
                    </button>

	                    <button
	                        type="button"
	                        className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color hover:bg-gray-50"
	                    >
                        <Upload size={16}/>
                        <span className={isMobile ? 'hidden' : ''}>Import</span>
                    </button>
                    
                </div>

            </div>
        </div>
            
        </>
    )
}
