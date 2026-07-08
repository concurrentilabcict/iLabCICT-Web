import Chatbot from "@/components/Technician/Chatbot/Chatbot";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Sidebar from "@/components/Sidebar/Sidebar";

import { useEffect } from "react";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";


export default function ChatbotPage() {

    useEffect(()=> {
        document.title = "Chatbot | ILabCICT";
    }, []);

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <SidebarProvider>
                {isMobile ? null : <Sidebar />}
                <SidebarInset>
                    <div>
                        {isMobile ? <MobileHeader title="Chatbot" /> : <Header title="Chatbot" />}
                        <div className="mx-auto max-w-[900px] md:px-10">
                            <Chatbot />
                        </div>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
