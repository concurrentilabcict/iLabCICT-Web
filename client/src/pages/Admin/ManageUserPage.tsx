import ManageUser from "@/components/Admin/ManageUser/ManageUser";
import Header from "@/components/Technician/Header/Header";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";


export default function ManageUserPage() {

    useEffect(() => {
        document.title = "Manage User | IlabCICT"
    }, []);

    return(
        <>
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <div className="min-h-screen bg-[#fbfbfb]">
                        <Header title="Repair Logs" />
                        <div className="mx-auto max-w-[1040px] px-10">
                            <ManageUser />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
