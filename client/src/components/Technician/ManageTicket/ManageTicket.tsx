import ManageTicketCard from "./ManageTicketCard";


export default function ManageTicket() {
    return(
        <>
            <div className="flex items-center w-full flex-col gap-y-3 gap-x-3 px-5 py-3 mb-23
            sm:grid sm:grid-cols-2">
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