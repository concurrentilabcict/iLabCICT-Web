import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import WeeklyReport from "@/components/Admin/WeeklyReport/WeeklyReport";


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
                        <Header title="Technician Report" />
                        <div className="mx-auto w-auto max-w-[1400px] px-5">
                            <WeeklyReport />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
