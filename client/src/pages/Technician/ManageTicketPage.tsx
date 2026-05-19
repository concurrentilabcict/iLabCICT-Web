import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/ManageTicket/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";
import NavBar from "@/components/Technician/NavBar/NavBar";


export default function ManageTicketPage() {
    return(
        <>
            <div className="bg-[#f8fafc]">
                <Header />
                <Filter />
                <SearchFilter />
                <ManageTicket />
                <NavBar />
            </div>
        </>
    );
}