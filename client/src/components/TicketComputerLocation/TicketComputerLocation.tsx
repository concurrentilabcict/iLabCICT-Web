import { Building2, Monitor } from "lucide-react";
import type { Ticket } from "@/types/ticket";

export default function TicketComputerLocation({ ticket }: { ticket: Ticket }) {
  const computer = ticket.computer;
  if (!computer) return null;
  return <>
    {computer.computerNumber && <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-1.5 font-medium secondary-text-color"><Monitor size={14} />Computer Number</span>
      <span className="text-right font-medium">{computer.computerNumber}</span>
    </div>}
    {computer.room && computer.room.id !== ticket.room.id && <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-1.5 font-medium secondary-text-color"><Building2 size={14} />Current Computer Room</span>
      <span className="text-right">{computer.room.roomName}, {computer.room.buildingName}, Floor {computer.room.floorNumber}</span>
    </div>}
  </>;
}
