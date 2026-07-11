import { useEffect } from "react";

import CreateTicketForm from "@/components/Faculty/CreateTicket/CreateTicketForm";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import Sidebar from "@/components/Sidebar/Sidebar";
import NavBar from "@/components/Technician/NavBar/NavBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function CreateTicketPage() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    document.title = "Create Ticket | ILabCICT";
  }, []);

  return (
    <SidebarProvider>
      {isMobile ? <NavBar /> : <Sidebar />}
      <SidebarInset>
        <main className="min-h-screen bg-[#f8fafc] pb-24 md:pb-8">
          {isMobile ? <MobileHeader title="Report Lab Issue" /> : <Header title="Report Lab Issue" />}
          <CreateTicketForm />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
