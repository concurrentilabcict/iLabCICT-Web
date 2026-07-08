import NavBar from "@/components/Technician/NavBar/NavBar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect } from "react";

type FacultyPageProps = {
    title: string;
};

export default function FacultyPage({ title }: FacultyPageProps) {
    const isMobile = useMediaQuery("(max-width: 767px)");

    useEffect(() => {
        document.title = `${title} | ILabCICT`;
    }, [title]);

    return (
        <SidebarProvider>
            {isMobile ? <NavBar /> : <Sidebar />}
            <SidebarInset>
                <main className="min-h-screen bg-[#f8fafc] p-5 pb-24 md:pb-5">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
