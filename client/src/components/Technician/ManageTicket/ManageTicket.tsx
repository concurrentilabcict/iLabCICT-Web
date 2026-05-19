import ManageTicketCard from "./ManageTicketCard";


export default function ManageTicket() {
    return(
        <>
            <div className="flex flex-col gap-y-3 p-5 mb-20">
                <ManageTicketCard />
                <ManageTicketCard />
                <ManageTicketCard />
            </div>
        </>
    );
}