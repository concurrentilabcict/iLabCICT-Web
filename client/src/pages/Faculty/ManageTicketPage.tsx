import Filter from "@/components/Faculty/ManageTicket/Filter";
import type { FacultyTicketView } from "@/components/Faculty/ManageTicket/Filter";
import Header from "@/components/Header/Header";
import ManageTicket from "@/components/Faculty/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Faculty/ManageTicket/SearchFilter";
import NavBar from "@/components/Technician/NavBar/NavBar";
import MobileHeader from "@/components/Header/MobileHeader";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect, useState } from "react";
import type { StatusFilter, TicketTypeFilter } from "@/utils/ticket";

export default function ManageTicketPage() {
  const [ticketView, setTicketView] = useState<FacultyTicketView>("Recent");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    document.title = "Manage Tickets | ILabCICT";
  }, []);

  return (
    <SidebarProvider>
      {isMobile ? <NavBar /> : <Sidebar />}
      <SidebarInset>
        <div className="min-h-screen w-full min-w-0 bg-[#f8fafc]">
          {isMobile ? <MobileHeader title="Manage Tickets" /> : <Header title="Manage Tickets" />}
          <div className="mx-auto w-full min-w-0 max-w-[1000px]">
            <Filter selectedView={ticketView} onViewChange={setTicketView}
              selectedStatus={statusFilter} onStatusChange={setStatusFilter} />
            <SearchFilter
              searchQuery={searchQuery}
              selectedType={typeFilter}
              onSearchChange={setSearchQuery}
              onTypeChange={setTypeFilter}
            />
            <ManageTicket
              ticketView={ticketView}
              onTicketViewChange={setTicketView}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
