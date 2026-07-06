import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { Ticket } from "@/types/ticket";
import { capitalize, formatDateTime } from "@/utils/string";
import { statusConfig, type Status } from "@/utils/ticket";
import {
  Building2,
  CalendarDays,
  ImageOff,
  Layers2,
  Monitor,
  User,
  Wrench,
} from "lucide-react";

type TicketDetailsProps = {
  ticket: Ticket;
};

export default function TicketDetails({ ticket }: TicketDetailsProps) {
  const status = capitalize(ticket.status);
  const type = capitalize(ticket.type);
  const statusData = statusConfig[status as Status];
  const StatusIcon = statusData?.icon;
  const reporter = `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`;
  const technician = `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="mb-2 text-lg font-semibold">
          {ticket.title}
        </SheetTitle>

        <div className="flex items-center justify-between">
          <SheetDescription>#{ticket.ticketCode}</SheetDescription>

          <div
            className={`flex w-fit items-center gap-x-2 rounded-md px-3 py-1.5 ${
              statusData?.className ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {StatusIcon && <StatusIcon size={14} />}
            <span className="text-sm">{status || ticket.status}</span>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 px-4">
        <div className="flex flex-col gap-y-2">
          {ticket.issueImage ? (
            <img
              src={ticket.issueImage}
              alt={ticket.title}
              className="h-50 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
              <ImageOff size={28} />
              <span className="text-sm font-medium">No image attached</span>
            </div>
          )}

          <div>
            <h3 className="secondary-text-color font-medium">Description</h3>
            <p>{ticket.complaintDescription}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <Layers2 size={14} />
            <h3>Type</h3>
          </div>
          <span>{type}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <User size={14} />
            <h3>Reported By</h3>
          </div>
          <span className="text-right">{reporter}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <Wrench size={14} />
            <h3>Technician</h3>
          </div>
          <span className="text-right">{technician}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <Monitor size={14} />
            <h3>Computer</h3>
          </div>
          <span>{ticket.computer.computerCode}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <Building2 size={14} />
            <h3>Room</h3>
          </div>
          <span className="text-right">
            {capitalize(ticket.room.buildingName)}, {ticket.room.roomName}
          </span>
        </div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <CalendarDays size={14} />
            <h3>Created</h3>
          </div>
          <span className="text-right">{formatDateTime(ticket.createdAt)}</span>
        </div>
      </div>
    </>
  );
}
