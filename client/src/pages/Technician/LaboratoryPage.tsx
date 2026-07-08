import NavBar from "@/components/Technician/NavBar/NavBar";
import Filter from "@/components/Technician/Laboratory/Filter";
import Header from "@/components/Technician/Laboratory/Header/Header";
import MobileHeader from "@/components/Technician/Laboratory/Header/MobileHeader";
import SearchFilter from "@/components/Technician/Laboratory/SearchFilter";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Laboratory from "@/components/Technician/Laboratory/Laboratory";


export default function LaboratoryPage(){

    const isMobile = useMediaQuery("(max-width: 767px)");

    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                        <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <MobileHeader/> : <Header/>}
                             <div className="mx-auto max-w-[1000px]">
                                <Filter/>
                                <SearchFilter/>
                                <Laboratory/>
                             </div>
                        </div>
                    </SidebarInset>
            </SidebarProvider>
        
        </>
    );
}