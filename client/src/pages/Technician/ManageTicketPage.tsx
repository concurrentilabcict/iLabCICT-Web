import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/ManageTicket/Header/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";
import NavBar from "@/components/Technician/NavBar/NavBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import Sidebar from "@/components/Technician/Sidebar/Sidebar";

export default function ManageTicketPage() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? <NavBar /> : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen bg-[#f8fafc]">
                        <Header />
                        <div className="mx-auto max-w-[1000px] px-4 pb-10">
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