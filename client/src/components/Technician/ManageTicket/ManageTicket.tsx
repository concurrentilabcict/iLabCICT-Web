import ManageTicketCard from "./ManageTicketCard";


export default function ManageTicket() {
    return(
        <>
            <div className="flex flex-col gap-y-3 px-5 py-3 mb-23">
                <ManageTicketCard />
                <ManageTicketCard />
                <ManageTicketCard />
            </div>
        </>
    );
}