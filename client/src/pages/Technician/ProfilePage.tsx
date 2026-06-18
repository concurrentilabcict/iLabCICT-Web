import Profile from "@/components/Technician/Profile/Profile";
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


export default function ProfilePage() {

    useEffect(()=> {
        document.title = "Profile | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? <NavBar /> : <Sidebar />}
                <SidebarInset>
                    <div className="min-h-screen ">
                        {isMobile ? <MobileHeader title="Profile" /> : <Header title="Profile" />}
                        <div className="mx-auto max-w-[1000px]">
                            <Profile />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
