import {
  User,
  Tickets,
  Monitor,
  Building2,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import {
  statusConfig,
  typeConfig,
} from "@/utils/ticket";

import type {
  Status,
  TicketType,
} from "@/utils/ticket";
import { formatDateTime } from "@/utils/string";

type ManageTicketCardProps = {
  status: Status;
  type: TicketType;
  title: string;
  complaintDescription: string;
  reportedBy: string;
  ticketCode: string;
  room: string;
  computerCode: string;
  date: string;
  onClick?: () => void;
};

export default function ManageTicketCard({
  status,
  type,
  title,
  complaintDescription,
  reportedBy,
  ticketCode,
  room,
  computerCode,
  date,
  onClick,
}: ManageTicketCardProps) {

  console.log("status", status);
  console.log("statusData", statusConfig[status]);

  console.log("type", type);
  console.log("typeData", typeConfig[type]);

  const statusData = statusConfig[status];
  const typeData = typeConfig[type];

  const StatusIcon = statusData.icon;

  return (
    <div onClick={onClick}
      className="bg-white flex flex-col gap-y-2.5 border primary-border-color
      rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px] cursor-pointer"
    >

      <div className="flex items-center gap-x-2">

        <div
          className={`flex gap-x-2 items-center px-3 py-1.5 rounded-md ${statusData.className}`}
        >
          <StatusIcon size={14} />
          <span className="text-sm">{status}</span>
        </div>

        <div
          className={`flex gap-x-2 items-center px-3 py-1.5 rounded-md ${typeData.className}`}
        >
          <span className="text-sm">{type}</span>
        </div>

      </div>

      <div className="flex flex-col">
        <h1 className="text-lg font-medium">
          {title}
        </h1>

        <p className="text-sm secondary-text-color max-w-[75%] line-clamp-2 h-10">
          {complaintDescription}
        </p>
      </div>

      <div className="h-px w-full bg-gray-300 mb-1.5" />

      <div className="flex items-center justify-between">

        <div className="flex items-center secondary-text-color gap-x-1">
          <User size={14} />
          <span className="text-sm">{reportedBy}</span>
        </div>

        <div className="flex items-center secondary-text-color gap-x-1">
          <Tickets size={14} />
          <span className="text-sm">{ticketCode}</span>
        </div>

      </div>

      <div className="flex items-center justify-between mb-1.5">

        <div className="flex items-center secondary-text-color gap-x-1">
          <Building2 size={14} />
          <span className="text-sm">{room}</span>
        </div>

        <div className="flex items-center secondary-text-color gap-x-1">
          <Monitor size={14} />
          <span className="text-sm">{computerCode}</span>
        </div>

      </div>

      <div className="h-px w-full bg-gray-300 mb-1.5" />

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-x-1">
          <CalendarDays size={14} />
          <span className="text-sm">
            {formatDateTime(date)}
          </span>
        </div>

        <ChevronRight size={25} />

      </div>

    </div>
  );
}