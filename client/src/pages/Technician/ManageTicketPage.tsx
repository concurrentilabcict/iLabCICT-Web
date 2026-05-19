import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/ManageTicket/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import NavBar from "@/components/Technician/NavBar/NavBar";


export default function ManageTicketPage() {
    return(
        <>
            <div className="">
                <Header />
                <Filter />
                <ManageTicket />
                <NavBar />
            </div>
        </>
    );
}