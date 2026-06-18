import Header from "@/components/Technician/Header/Header";
import MobileHeader from "@/components/Technician/Header/MobileHeader";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";

import { useEffect, useState } from "react";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import NavBar from "@/components/Technician/NavBar/NavBar";
import RepairLog from "@/components/Technician/RepairLog/RepairLog";
import SearchFilter from "@/components/Technician/RepairLog/SearchFilter";
import type { TicketTypeFilter } from "@/utils/ticket";


export default function RepairLogPage() {

    const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(()=> {
        document.title = "Repair Logs | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? <NavBar /> : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen bg-[#f8fafc]">
                        {isMobile ? <MobileHeader title="Repair Logs" /> : <Header title="Repair Logs" />}
                        <div className="mx-auto max-w-[1000px]">
                            <SearchFilter
                                searchQuery={searchQuery}
                                selectedType={typeFilter}
                                onSearchChange={setSearchQuery}
                                onTypeChange={setTypeFilter}
                            />
                            <RepairLog
                                typeFilter={typeFilter}
                                searchQuery={searchQuery}
                            />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
