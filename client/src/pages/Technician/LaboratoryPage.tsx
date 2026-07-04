import NavBar from "@/components/Technician/NavBar/NavBar";
import Filter from "@/components/Technician/Laboratory/Filter";
import Header from "@/components/Technician/Laboratory/Header/Header";
import MobileHeader from "@/components/Technician/Laboratory/Header/MobileHeader";
import SearchFilter from "@/components/Technician/Laboratory/SearchFilter";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Laboratory from "@/components/Technician/Laboratory/Laboratory";
import type{ StatusFilter } from "@/utils/room";
import { useState } from "react";

export default function LaboratoryPage(){

    const [searchQuery, setSearchQuery] = useState("");
    const [StatusFilter, setStatusFilter] = useState<StatusFilter>("All");

    const isMobile = useMediaQuery("(max-width: 767px)");

    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                        <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <MobileHeader/> : <Header/>}
                             <div className="mx-auto max-w-[1000px]">
                                <Filter/>
                                <SearchFilter/>
                                <Laboratory
                                    statusFilter={StatusFilter}
                                    searchQuery={searchQuery}
                                />
                             </div>
                        </div>
                    </SidebarInset>
            </SidebarProvider>
        
        </>
    );
}