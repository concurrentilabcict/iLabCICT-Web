import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/Header/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";
import NavBar from "@/components/Technician/NavBar/NavBar";
import MobileHeader from "@/components/Technician/Header/MobileHeader";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { useEffect, useState } from "react";
import type { StatusFilter, TicketTypeFilter } from "@/utils/ticket";

export default function ManageTicketPage() {

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(()=> {
        document.title = "Manage Ticket | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? <NavBar /> : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen bg-[#f8fafc]">
                        {isMobile ? <MobileHeader title="Ticket Queue" /> : <Header title="Ticket Queue" />}
                        <div className="mx-auto max-w-[1000px]">
                            <Filter
                                selectedStatus={statusFilter}
                                onStatusChange={setStatusFilter}
                            />
                            <SearchFilter
                                searchQuery={searchQuery}
                                selectedType={typeFilter}
                                onSearchChange={setSearchQuery}
                                onTypeChange={setTypeFilter}
                            />
                            <ManageTicket
                                statusFilter={statusFilter}
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
