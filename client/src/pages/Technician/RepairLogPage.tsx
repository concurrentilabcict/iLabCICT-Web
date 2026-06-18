import Header from "@/components/Technician/Header/Header";
import MobileHeader from "@/components/Technician/Header/MobileHeader";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";

import { useEffect } from "react";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import NavBar from "@/components/Technician/NavBar/NavBar";
import RepairLog from "@/components/Technician/RepairLog/RepairLog";


export default function RepairLogPage() {

    useEffect(()=> {
        document.title = "Repair Logs | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? <NavBar /> : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen bg-[#f8fafc]">
                        {isMobile ? <MobileHeader title="Repair Logs" /> : <Header title="Repair Logs" />}
                        <div className="mx-auto max-w-[1000px]">
                            <RepairLog />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
