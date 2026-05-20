import NavBar from "@/components/Technician/NavBar/NavBar";
import Filter from "@/components/Technician/ManageTicket/Filter";
import Header from "@/components/Technician/ManageTicket/Header";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";

export default function MobileLayout() {
    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-[#f8fafc]">
                <Header />
                <div className="mx-auto max-w-[1000px] px-4 pb-10">
                    <Filter />
                    <SearchFilter />
                    <ManageTicket />
                </div>
            </div>
        </>
    );
}