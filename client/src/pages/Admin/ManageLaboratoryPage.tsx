import NavBar from "@/components/Technician/NavBar/NavBar";
import Filter from "@/components/Admin/ManageLaboratory/Filter";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import SearchFilter from "@/components/Admin/ManageLaboratory/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Laboratory from "@/components/Admin/ManageLaboratory/Laboratory";
import type{ StatusFilter, FloorFilter } from "@/utils/room";
import { useEffect, useState } from "react";
import ButtonGroup from "@/components/Admin/ManageLaboratory/ButtonGroup";
import type { Room, EditRoomFormType, RoomForm } from "@/types/room";

export default function AdminManageLaboratoryPage(){

    const [searchQuery, setSearchQuery] = useState("");
    const [StatusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [FloorFilter, setFloorFilter] = useState<FloorFilter>("All");
     const [sheetOpen, setSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<EditRoomFormType>({
        id: null,
        roomName: "",
        floorNumber: 1,
        buildingName: "pimentel",
        roomStatus: "operational",
        assignedCustodianId: null
    });
    const [rooms, setRooms] = useState<Room[]>([]);

    const isMobile = useMediaQuery("(max-width: 767px)");

    useEffect(()=>{
         document.title = "Manage Laboratory | ILabCICT";
    }, [])

    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                        <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <MobileHeader title="Laboratory"/> : <Header title="Laboratory"/>}
                             <div className="mx-auto max-w-[1000px]">
                                <Filter
                                    onFloorChange={setFloorFilter}
                                    selectedFloor={FloorFilter}
                                />
                                <SearchFilter
                                    onSearchChange={setSearchQuery}
                                    searchQuery={searchQuery}
                                    onStatusChange={setStatusFilter}
                                    selectedStatus={StatusFilter}
                                />

                                <ButtonGroup
                                    rooms={rooms}
                                    setSheetOpen={setSheetOpen}
                                    setIsEditing={setIsEditing}
                                    setSelectedRoom={setSelectedRoom}
                                />
                                <Laboratory
                                    setRooms={setRooms}
                                    sheetOpen={sheetOpen}
                                    setSheetOpen={setSheetOpen}
                                    isEditing={isEditing}
                                    setIsEditing={setIsEditing}
                                    statusFilter={StatusFilter}
                                    floorFilter={FloorFilter}
                                    searchQuery={searchQuery}
                                    setSelectedRoom={setSelectedRoom}
                                    selectedRoom={selectedRoom}
                                />
                             </div>
                        </div>
                    </SidebarInset>
            </SidebarProvider>
        
        </>
    );
}