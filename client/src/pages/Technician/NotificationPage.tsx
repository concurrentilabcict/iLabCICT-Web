import MobileHeader from "@/components/Technician/Header/MobileHeader";
import Header from "@/components/Technician/Header/Header";
import NavBar from "@/components/Technician/NavBar/NavBar";
import Notification from "@/components/Technician/Notification/Notification";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { useEffect } from "react";

export default function NotificationPage() {

    useEffect(()=> {
        document.title = "Notifications | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? <NavBar /> : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen">
                        {isMobile ? <MobileHeader title="Notification" /> : <Header title="Notification" />}
                        <div className="mx-auto max-w-[1000px]">
                            <Notification />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
