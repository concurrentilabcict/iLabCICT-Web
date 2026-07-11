import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import Sidebar from "@/components/Sidebar/Sidebar";
import NavBar from "@/components/Technician/NavBar/NavBar";
import FAQ from "@/components/Faculty/FAQ/FAQ";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect } from "react";

export default function FaqPage() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    document.title = "FAQ | ILabCICT";
  }, []);

  return (
    <SidebarProvider>
      {isMobile ? <NavBar /> : <Sidebar />}
      <SidebarInset>
        <main className="min-h-screen bg-[#f8fafc] pb-24 md:pb-8">
          {isMobile ? <MobileHeader title="FAQ" /> : <Header title="FAQ" />}
          <FAQ />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
