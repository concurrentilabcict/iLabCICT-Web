import NavBar from "@/components/Technician/NavBar/NavBar";
import ComputerInformation from "@/components/Technician/ComputerInformation/ComputerInformation";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import Sidebar from "@/components/Sidebar/Sidebar";
import ComputerTitle from "@/components/Technician/ComputerInformation/ComputerTitle";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


export default function ComputerInformationPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const { code } = useParams()
    const { room } = useParams()
    
    const pcCode = code ? decodeURIComponent(code) : "";
    const roomName = room ? decodeURIComponent(room) : "";
    const [address, setAddress] = useState("No address information.");
    const [sheetOpen,setSheetOpen] = useState(false);
    

    useEffect(()=>{
        document.title = `${pcCode} | iLabCICT`
    },[[pcCode]])

    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                         <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <Header title={pcCode}/> : <MobileHeader title={pcCode}/>}
                            <div className="mx-auto max-w-[1000px]">
                                <ComputerTitle
                                    room={roomName}
                                    computerCode={pcCode}
                                    address={address}
                                />
                                <ComputerInformation
                                    setSheetOpen={setSheetOpen}
                                    sheetOpen={sheetOpen}
                                    setAddress={setAddress}
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