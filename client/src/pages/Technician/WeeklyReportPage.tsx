import MobileHeader from "@/components/Technician/Notification/Header/MobileHeader";
import Header from "@/components/Technician/Notification/Header/Header";
import NavBar from "@/components/Technician/NavBar/NavBar";


import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { useEffect } from "react";
import WeeklyReport from "@/components/Technician/WeeklyReport/WeeklyReport";

export default function WeeklyReportPage() {

    useEffect(()=> {
        document.title = "Weekly Reports | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? <NavBar /> : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen">
                        {isMobile ? <MobileHeader /> : <Header />}
                        <div className="mx-auto max-w-[1000px]">
                            <WeeklyReport />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}