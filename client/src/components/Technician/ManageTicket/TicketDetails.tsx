import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import type { Ticket } from "@/types/ticket";

type TicketDetailsProps = {
  ticket: Ticket;
};

export default function TicketDetails({
  ticket,
}: TicketDetailsProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{ticket.title}</SheetTitle>

        <SheetDescription>
          Ticket #{ticket.ticketCode}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 px-4">
        {ticket.issueImage && (
          <img
            src={ticket.issueImage}
            alt={ticket.title}
            className="rounded-lg"
          />
        )}

        <div>
          <h3 className="font-medium">Description</h3>
          <p>{ticket.complaintDescription}</p>
        </div>

        <div>
          <h3 className="font-medium">Status</h3>
          <p>{ticket.status}</p>
        </div>

        <div>
          <h3 className="font-medium">Reported By</h3>
          <p>
            {ticket.reportedBy.firstName}{" "}
            {ticket.reportedBy.lastName}
          </p>
        </div>

        <div>
          <h3 className="font-medium">Computer</h3>
          <p>{ticket.computer.computerCode}</p>
        </div>

        <div>
          <h3 className="font-medium">Room</h3>
          <p>
            {ticket.room.buildingName},{" "}
            {ticket.room.roomName}
          </p>
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline">
          Assign
        </Button>

        <Button>
          Resolve
        </Button>
      </SheetFooter>
    </>
  );
}