import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { EditRoomFormType, Room } from "@/types/room"
import { Download, Plus } from "lucide-react"
import { useState } from "react"
import RoomExcelImport from "./RoomExcelImport/RoomExcelImport"
import { appToast } from "@/utils/appToast"
import { exportTableWorkbook, formatExcelDate, getLocalDateStamp } from "@/utils/tabularExcel"

type ButtonGroupType = {
    rooms: Room[]
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void,
    setSelectedRoom: (room: EditRoomFormType) => void
}

const getCustodian = (lastName: string | undefined, firstName: string | undefined) => {
    return lastName && firstName ? `${firstName} ${lastName}` : 'No Custodian';
}
export default function ButtonGroup({
    rooms,
    setSheetOpen,
    setIsEditing,
    setSelectedRoom
}: ButtonGroupType){
    const [isExporting, setIsExporting] = useState(false)

    const handleAddComputerClick = () => {
        setSelectedRoom({
            id: null,
            roomName: "",
            floorNumber: 1,
            buildingName: "pimentel",
            roomStatus: "operational",
            assignedCustodianId: null,
            assignedTechnicianId: null,
        });
        setIsEditing(false)
        setSheetOpen(true)
    }

    const exportRooms = async () =>{
        if(rooms.length === 0){
            return;
        }

        const headers = [
            "Room ID",
            "Room Name",
            "Floor Number",
            "Building Name",
            "Assigned Custodian",
            "Assigned Custodian ID",
            "Assigned Technician ID",
            "Computer Count",
            "Active Issues",
            "Status",
            "Created At",
            "Updated At"
        ];

        setIsExporting(true)
        try {
            await exportTableWorkbook({
                title: "iLabCICT Laboratory Directory",
                subject: "Laboratory directory export",
                worksheetName: "Laboratories",
                filename: `iLabCICT_Laboratories_${getLocalDateStamp()}.xlsx`,
                headers,
                rows: rooms.map((room)=>[
                    room.id,
                    room.roomName,
                    room.floorNumber,
                    room.buildingName,
                    getCustodian(
                        room.assignedCustodian?.lastName,
                        room.assignedCustodian?.firstName
                    ),
                    room.assignedCustodian?.id ?? null,
                    room.assignedTechnician?.id ?? null,
                    room.computerCount,
                    room.activeIssuesCount,
                    room.status,
                    formatExcelDate(room.createdAt),
                    formatExcelDate(room.updatedAt)
                ]),
                columnWidths: [14, 22, 16, 20, 28, 24, 25, 18, 16, 18, 20, 20],
            })
        } catch (error) {
            appToast.error(
                error instanceof Error ? error.message : "We couldn't export the laboratories."
            )
        } finally {
            setIsExporting(false)
        }
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
	                        onClick={() => void exportRooms()}
	                        type="button"
	                        disabled={isExporting || rooms.length === 0}
	                        className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color hover:cursor-pointer hover:bg-gray-50"
	                    >
                        <Download size={16}/>
                        <span className={isMobile ? 'hidden' : ''} >{isExporting ? "Exporting..." : "Export"}</span>
                    </button>

                    <RoomExcelImport
                        showLabel={!isMobile}
                        className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    
                </div>

            </div>
        </div>
            
        </>
    )
}
