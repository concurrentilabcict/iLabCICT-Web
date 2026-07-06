import Dashboard from "@/components/Admin/Dashboard/Dashboard";
import Header from "@/components/Technician/Header/Header";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";


export default function DashboardPage() {

    useEffect(() => {
        document.title = "Dashboard | IlabCICT"
    }, []);

    return(
        <>
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <div className="min-h-screen bg-[#fbfbfb]">
                        <Header title="Dashboard" />
                        <div className="mx-auto w-auto max-w-[1400px] px-5">
                            <Dashboard />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
