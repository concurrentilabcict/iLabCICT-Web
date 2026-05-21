import { useMediaQuery } from "@/hooks/useMediaQuery";
import ManageTicketCard from "./ManageTicketCard";



export default function ManageTicket() {

    const isMobile = useMediaQuery("(max-width: 767px)");
    
    return(
        <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 ${isMobile ? "mb-23" : "mb-10"}`}>
                <ManageTicketCard />
                <ManageTicketCard />
                <ManageTicketCard />
                <ManageTicketCard />
                <ManageTicketCard />
                <ManageTicketCard />
            </div>
        </>
    );
}   