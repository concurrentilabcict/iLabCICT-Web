import { useEffect } from "react";

import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import Sidebar from "@/components/Sidebar/Sidebar";
import NavBar from "@/components/Technician/NavBar/NavBar";
import Notification from "@/components/Faculty/Notification/Notification";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function FacultyNotificationPage() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    document.title = "Notifications | ILabCICT";
  }, []);

  return (
    <SidebarProvider>
      {isMobile ? <NavBar /> : <Sidebar />}
      <SidebarInset>
        <main className="min-h-screen bg-[#f8fafc] pb-24 md:pb-8">
          {isMobile ? (
            <MobileHeader title="Notifications" />
          ) : (
            <Header title="Notifications" />
          )}
          <Notification />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
