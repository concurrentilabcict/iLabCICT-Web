import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import type { Ticket } from "@/types/ticket";
import { Building2, Monitor, Layers2, User, CalendarDays, Space } from "lucide-react";
import { statusConfig, type Status } from "@/utils/ticket";
import { capitalize, formatDateTime } from "@/utils/string";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiError, privateFetch, type ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner"

type TicketDetailsProps = {
  ticket: Ticket;
};

export default function TicketDetails({
  ticket,
}: TicketDetailsProps) {
  const status = capitalize(ticket.status);
  const statusData = statusConfig[status as Status];
  const StatusIcon = statusData?.icon;

  const queryClient = useQueryClient();

  const ticketMutation = useMutation({
    mutationFn: async () => {
      const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/tickets/${ticket.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ongoing" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw createApiError(res.status, data.message || "Failed to start repair.");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      toast.success("Repair started successfully.");
    },

    onError: (error: ApiError) => {
      if (error.status === 500) {
        toast.error("Server error. Please try again later.");
        return;
      }

      toast.error("Failed to start repair.");
    }
  });

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg font-semibold mb-2">{ticket.title}</SheetTitle>

        <div className="flex items-center justify-between">
          <SheetDescription>
            Ticket #{ticket.ticketCode}
          </SheetDescription>

          <div
            className={`flex w-fit items-center gap-x-2 rounded-md px-3 py-1.5 ${statusData?.className ?? "bg-gray-100 text-gray-700"
              }`}
          >
            {StatusIcon && <StatusIcon size={14} />}
            <span className="text-sm">{status || ticket.status}</span>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 px-4">
        <div className="flex flex-col gap-y-2">
          {ticket.issueImage && (
            <img
              src={ticket.issueImage}
              alt={ticket.title}
              className="h-50 w-full rounded-lg object-cover"
            />
          )}

          <div>
            <h3 className="font-medium secondary-text-color">Description</h3>
            <p>{ticket.complaintDescription}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <Layers2 size={14} />
            <h3>Type</h3>
          </div>
          <span>{capitalize(ticket.type)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <User size={14} />
            <h3>Reported By</h3>
          </div>
          <p>
            {ticket.reportedBy.firstName}{" "}
            {ticket.reportedBy.lastName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <Monitor size={14} />
            <h3>Computer</h3>
          </div>
          <p>{ticket.computer.computerCode}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <Building2 size={14} />
            <h3>Room</h3>
          </div>
          <p>
            {capitalize(ticket.room.buildingName)},{" "}
            {ticket.room.roomName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 font-medium secondary-text-color">
            <CalendarDays size={14} />
            <h3>Date</h3>
          </div>
          <span>{formatDateTime(ticket.createdAt)}</span>
        </div>


      </div>

      <SheetFooter className={`${ticket.status === "resolved" ? "hidden" : ""}`}>
        <Button onClick={() => ticketMutation.mutate()} disabled={ticketMutation.isPending}>
          {ticketMutation.isPending ? <><Spinner className="size-5" />Starting Repair...</>
           : <span>Start Repair</span>}
        </Button>

        <SheetClose asChild>
          <Button disabled={ticketMutation.isPending} variant="outline">Close</Button>
        </SheetClose>
      </SheetFooter>
    </>
  );
}
