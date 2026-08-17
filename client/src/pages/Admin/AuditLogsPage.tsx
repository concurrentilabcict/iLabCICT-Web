import AuditLogs from "@/components/Admin/AuditLogs/AuditLogs";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";

export default function AuditLogsPage() {
  useEffect(() => {
    document.title = "Audit Logs | IlabCICT";
  }, []);

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#fbfbfb]">
          <Header title="Audit Logs" />
          <div className="mx-auto w-auto max-w-[1400px] px-5">
            <AuditLogs />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
