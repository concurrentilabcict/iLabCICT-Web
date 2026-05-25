<<<<<<< HEAD
import NavBar from "@/components/LandingPage/NavBar/NavBar";
import ComputerList from "@/components/Technician/ComputerList/ComputerList";
import Filter from "@/components/Technician/ComputerList/Filter";
import SearchFilter from "@/components/Technician/ComputerList/SearchFilter";
import Sidebar from "@/components/Technician/Sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Header from "@/components/Technician/ComputerList/Header/Header";
import MobileHeader from "@/components/Technician/ComputerList/Header/Header";
import { useParams } from "react-router-dom";
import ButtonGroup from "@/components/Technician/ComputerList/ButtonGroup";


export default function ComputerListPage(){
    
    const isMobile = useMediaQuery("(max-width: 767px)");

    const { room } = useParams();
    const roomName = room ? decodeURIComponent(room) : ""
    
    return(
        <>
            <SidebarProvider>
                {isMobile ? <NavBar/> : <Sidebar/>}
                    <SidebarInset>
                        <div className="min-h-screen bg-[#f8fafc]">
                            {isMobile ? <Header computerListName={roomName}/>: <MobileHeader computerListName={roomName}/>}
                            <div className="mx-auto max-w-[1000px]">
                                <Filter/>
                                <SearchFilter/>
                                <ButtonGroup/>
                                <ComputerList/>
                            </div>
                        </div>
                    </SidebarInset>
            </SidebarProvider>
=======


export default function(){
    return(
        <>
        
>>>>>>> e4e1475169f57dbaeacb52c997dfd4a3b70455fe
        </>
    );
}