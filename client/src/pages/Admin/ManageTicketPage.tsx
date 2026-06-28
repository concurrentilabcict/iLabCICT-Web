import ManageTicket from "@/components/Admin/ManageTicket/ManageTicket";
import Header from "@/components/Technician/Header/Header";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";


export default function ManageTicketPage() {

    useEffect(() => {
        document.title = "Manage Ticket | IlabCICT"
    }, []);

    return(
        <>
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <div className="min-h-screen bg-[#f8fafc]">
                        <Header title="Manage Ticket" />
                        <div className="mx-auto max-w-[1040px] px-10">
                            <ManageTicket />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}