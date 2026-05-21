import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/ManageTicket/Header/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";
import NavBar from "@/components/Technician/NavBar/NavBar";
import MobileHeader from "@/components/Technician/ManageTicket/Header/MobileHeader";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { useEffect } from "react";

export default function ManageTicketPage() {

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
                        {isMobile ? <MobileHeader /> : <Header />}
                        <div className="mx-auto max-w-[1000px]">
                            <Filter />
                            <SearchFilter />
                            <ManageTicket />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}