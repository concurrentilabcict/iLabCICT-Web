import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerInformation from "@/components/Admin/ComputerInformation/ComputerInformation";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


export default function AdminComputerInformationPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const { code } = useParams()
    const { room } = useParams()
    
    const pcCode = code ? decodeURIComponent(code) : "";
    const roomName = room ? decodeURIComponent(room) : "";
    const [sheetOpen,setSheetOpen] = useState(false);
    

    useEffect(()=>{
        document.title = `${pcCode} | iLabCICT`
    },[pcCode])

    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                         <div className="min-h-screen bg-[#fbfbfb]">
	                            {isMobile ? <MobileHeader title={pcCode}/> : <Header title={pcCode}/>}
	                            <div className="mx-auto max-w-[1000px]">
	                                <ComputerInformation
	                                    setSheetOpen={setSheetOpen}
	                                    sheetOpen={sheetOpen}
	                                    computerCode={pcCode}
	                                    roomName={roomName}
	                                />
                            </div>
                         </div>
                    </SidebarInset>
            </SidebarProvider>
        </>
    );
}
