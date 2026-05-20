import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/ManageTicket/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import Sidebar from "@/components/Technician/Sidebar/Sidebar";

export default function DesktopLayout() {
    return (
        <>
            <SidebarProvider>
                <Sidebar />
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