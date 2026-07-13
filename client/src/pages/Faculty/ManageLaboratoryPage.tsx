import NavBar from "@/components/Technician/NavBar/NavBar";
import Filter from "@/components/Faculty/ManageLaboratory/Filter";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import SearchFilter from "@/components/Faculty/ManageLaboratory/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Laboratory from "@/components/Technician/Laboratory/Laboratory";
import type{ StatusFilter, FloorFilter } from "@/utils/room";
import { useEffect, useState } from "react";

export default function FacultyManageLaboratoryPage(){

    const [searchQuery, setSearchQuery] = useState("");
    const [StatusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [FloorFilter, setFloorFilter] = useState<FloorFilter>("All");

    const isMobile = useMediaQuery("(max-width: 767px)");

    useEffect(()=>{
         document.title = "Laboratory | ILabCICT";
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
                                <Laboratory
                                    statusFilter={StatusFilter}
                                    floorFilter={FloorFilter}
                                    searchQuery={searchQuery}
                                />
                             </div>
                        </div>
                    </SidebarInset>
            </SidebarProvider>
        
        </>
    );
}