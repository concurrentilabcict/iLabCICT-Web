import NavBar from "@/components/Technician/NavBar/NavBar";
import Filter from "@/components/Technician/ManageTicket/Filter";
import ManageTicket from "@/components/Technician/ManageTicket/ManageTicket";
import SearchFilter from "@/components/Technician/ManageTicket/SearchFilter";
import MobileHeader from "@/components/Technician/ManageTicket/Header/MobileHeader";

export default function MobileLayout() {
    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-[#f8fafc]">
                <MobileHeader />
                <div className="mx-auto max-w-[1000px] px-4 pb-10">
                    <Filter />
                    <SearchFilter />
                    <ManageTicket />
                </div>
            </div>
        </>
    );
}