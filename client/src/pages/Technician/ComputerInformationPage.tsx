import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerInformation from "@/components/Technician/ComputerInformation/ComputerInformation";
import Header from "@/components/Technician/ComputerInformation/Header/Header";
import MobileHeader from "@/components/Technician/ComputerInformation/Header/MobileHeader";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";
import ComputerTitle from "@/components/Technician/ComputerInformation/ComputerTitle";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useParams } from "react-router-dom";


export default function ComputerInformationPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const { code } = useParams()
    const pcCode = code ? decodeURIComponent(code) : "";
    
    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                         <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <Header computerInformationName={pcCode}/> : <MobileHeader computerInformationHeader={pcCode}/>}
                            <div className="mx-auto max-w-[1000px]">
                                <ComputerTitle/>
                                <ComputerInformation/>
                            </div>
                         </div>
                    </SidebarInset>
            </SidebarProvider>
        </>
    );
}