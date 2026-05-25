import Profile from "@/components/Technician/Profile/Profile";
import Header from "@/components/Technician/Profile/Header/Header";
import MobileHeader from "@/components/Technician/Profile/Header/MobileHeader";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";

import { useEffect } from "react";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";


export default function ProfilePage() {

    useEffect(()=> {
        document.title = "Profile | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? null : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen ">
                        {isMobile ? <MobileHeader /> : <Header />}
                        <div className="mx-auto max-w-[1000px] pb-10">
                            <Profile />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}