import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Ticket } from "@/types/ticket";
import {
  Building2,
  CalendarDays,
  ImageOff,
  Layers2,
  Monitor,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { capitalize, formatDateTime } from "@/utils/string";
import { statusConfig, type Status } from "@/utils/ticket";

type TicketDetailsProps = { ticket: Ticket };

export default function TicketDetails({ ticket }: TicketDetailsProps) {
  const status = capitalize(ticket.status) as Status;
  const statusData = statusConfig[status];
  const StatusIcon = statusData?.icon;

	  return <>
	    <SheetHeader>
	      <SheetTitle className="mb-2 text-lg font-semibold">{ticket.title}</SheetTitle>
	      <div className="flex items-center justify-between gap-3">
	        <SheetDescription>#{ticket.ticketCode}</SheetDescription>
	        <div className={`flex w-fit items-center gap-x-2 rounded-full px-3 py-1.5 text-sm font-semibold ${statusData?.className ?? "bg-gray-100 text-gray-700"}`}>
	          {StatusIcon && <StatusIcon size={14} />}
	          <span>{status}</span>
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
	          <h3 className="font-medium secondary-text-color">Description</h3>
	          <p className="text-sm leading-relaxed text-zinc-700">{ticket.complaintDescription}</p>
	        </div>
	      </div>

	      <div className="rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
	        <DetailRow icon={Layers2} label="Type" value={capitalize(ticket.type)} />
	        <DetailRow icon={User} label="Reported by" value={`${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`} />
	        <DetailRow icon={Wrench} label="Assigned to" value={`${ticket.assignedTo?.firstName} ${ticket.assignedTo?.lastName}`.trim() || "Unassigned"} />
	        <DetailRow icon={Monitor} label="Computer" value={ticket.computer?.computerCode || "No computer"} />
	        <DetailRow icon={Building2} label="Room" value={`${capitalize(ticket.room.buildingName)}, ${ticket.room.roomName}`} />
	        <DetailRow icon={CalendarDays} label="Date" value={formatDateTime(ticket.createdAt)} />
	      </div>
	    </div>
	  </>;
	}
	
function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
	  return (
	    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 last:border-b-0">
	      <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
	        <Icon size={14} />
	        <h3>{label}</h3>
	      </div>
	      <span className="text-right text-sm font-medium text-zinc-800">{value}</span>
	    </div>
	  );
}
