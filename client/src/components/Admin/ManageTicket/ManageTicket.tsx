import TicketToolbar from "./TicketToolbar";


export default function ManageTicket() {
    return(
        <>
            <div className="flex items-center flex-col p-3 w-full bg-amber-50">
                <TicketToolbar />
            </div>
        </>
    );
}