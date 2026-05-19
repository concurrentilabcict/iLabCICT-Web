import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/ManageTicket/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";
import NavBar from "@/components/Technician/NavBar/NavBar";


export default function ManageTicketPage() {
    return(
        <>
            <Header />
            <div className="min-h-screen bg-[#f8fafc]">
                <div className="max-w-[1000px] mx-auto min-h-screen">
                <Filter />
                <SearchFilter />
                <ManageTicket />
                <NavBar />
            </div>
            </div>
        </>
    );
}