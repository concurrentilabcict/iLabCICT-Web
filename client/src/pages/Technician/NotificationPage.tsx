import MobileHeader from "@/components/Technician/Header/MobileHeader";
import NavBar from "@/components/Technician/NavBar/NavBar";
import Notification from "@/components/Technician/Notification/Notification";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationPage() {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 767px)");

    useEffect(() => {
        document.title = "Notifications | ILabCICT";
    }, []);

    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");

        const redirectDesktop = () => {
            if (!media.matches) {
                return;
            }

            if (window.history.length > 1) {
                navigate(-1);
                return;
            }

            navigate("/manage-ticket", { replace: true });
        };

        redirectDesktop();
        media.addEventListener("change", redirectDesktop);

        return () => media.removeEventListener("change", redirectDesktop);
    }, [navigate]);

    if (!isMobile) {
        return null;
    }

    return (
        <>
            <SidebarProvider>
                <NavBar />
                <SidebarInset>
                    <div className="min-h-screen">
                        <MobileHeader title="Notification" />
                        <div className="mx-auto max-w-[1000px]">
                            <Notification />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
