import Dashboard from "@/components/Admin/Dashboard/Dashboard";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";


export default function WeeklyReportPage() {

    useEffect(() => {
        document.title = "Weekly Report | IlabCICT"
    }, []);

    return(
        <>
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <div className="min-h-screen bg-[#fbfbfb]">
                        <Header title="Weekly Report" />
                        <div className="mx-auto w-auto max-w-[1400px] px-5">
                            <Dashboard />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
