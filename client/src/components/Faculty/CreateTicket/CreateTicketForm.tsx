import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createApiError, privateFetch } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import type { ApiComputer, ApiRoom, ScannerState, TicketType } from "@/types/createTicket";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  ComputerDropdown,
  Field,
  ImageUploadField,
  LaboratoryDropdown,
  QrScanButton,
  TicketTypeToggle,
} from "./TicketFormFields";
import {
  ComputerInfoCard,
  getPeripheralStatuses,
  LaboratoryLocationCard,
  PeripheralStatusCard,
} from "./TicketInfoCards";

const API_URL = "https://ilabcict-backend.onrender.com/api";

function normalizeApiList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.computers)) return record.computers as T[];
  }
  return [];
}

export default function CreateTicketForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const scannerState = location.state as ScannerState;
  const computerCode = scannerState?.computerCode?.trim() ?? "";
  const isScannedReport = computerCode.length > 0;
  const [type, setType] = useState<TicketType>("report");
  const [roomId, setRoomId] = useState("");
  const [selectedComputerCode, setSelectedComputerCode] = useState("");
  const [computerDropdownOpen, setComputerDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery<ApiRoom[]>({
    queryKey: ["rooms", "ticket-form"],
    queryFn: async () => {
      const response = await privateFetch(`${API_URL}/rooms/`);
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load laboratories.");
      return normalizeApiList<ApiRoom>(data);
    },
  });

  const selectedRoom = rooms.find((room) => String(room.id) === roomId);

  const { data: roomComputers = [], isLoading: isLoadingComputers } = useQuery<ApiComputer[]>({
    queryKey: ["computers", "ticket-form", selectedRoom?.room_name],
    enabled: Boolean(selectedRoom) && type === "report" && !computerCode,
    queryFn: async () => {
      const roomName = selectedRoom!.room_name;
      const response = await privateFetch(`${API_URL}/rooms/${encodeURIComponent(roomName)}/computers/`);
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load computers.");
      return normalizeApiList<ApiComputer>(data);
    },
  });

  const activeComputerCode = computerCode || selectedComputerCode;

  const { data: selectedComputerDetails, isLoading: isLoadingComputerDetails } = useQuery<ApiComputer>({
    queryKey: ["computer", activeComputerCode],
    enabled: type === "report" && activeComputerCode.length > 0,
    queryFn: async () => {
      const response = await privateFetch(`${API_URL}/computers/${encodeURIComponent(activeComputerCode)}/`);
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load computer details.");
      return data as ApiComputer;
    },
  });

  const selectedPeripheralStatus = selectedComputerDetails ? getPeripheralStatuses(selectedComputerDetails) : [];
  const selectedComputerFromList = roomComputers.find((computer) => computer.computer_code === activeComputerCode);
  const selectedComputerId = selectedComputerDetails?.id ?? selectedComputerFromList?.id ?? null;
  const displayRoom = selectedComputerDetails?.room ?? selectedRoom;
  const isReport = type === "report";
  const descriptionPlaceholder =
    type === "report" ? "Describe the issue you are experiencing..." : "Describe what you are requesting...";

  useEffect(() => {
    if (computerCode) {
      setType("report");
    }
  }, [computerCode]);

  useEffect(() => {
    if (computerCode && selectedComputerDetails?.room?.id) {
      setRoomId(String(selectedComputerDetails.room.id));
    }
  }, [computerCode, selectedComputerDetails]);

  const handleSelectRoom = (nextRoomId: string) => {
    setRoomId(nextRoomId);
    setSelectedComputerCode("");
    setComputerDropdownOpen(false);
  };

  const handleSubmitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId || !title.trim() || !description.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleSubmitTicket = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        type,
        title: title.trim(),
        complaint_description: description.trim(),
        status: "open",
        room: Number(roomId),
        computer: type === "report" ? selectedComputerId : null,
      };

      const response = await privateFetch(`${API_URL}/tickets/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to submit ticket.");
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setIsConfirmOpen(false);
      toast.success("Ticket submitted successfully.");
      navigate("/manage-ticket", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ticketTitle = type === "report" ? "Create a Report Ticket" : "Create a Request Ticket";
  const ticketSubtitle =
    type === "report"
      ? "Tell us what's wrong and provide a few details. Our technicians will review your report and help resolve the issue quickly."
      : "Need assistance? Submit a request and our technicians will review it and provide the support you need.";

  const computerInformation = isReport && (selectedComputerDetails || isLoadingComputerDetails) && (
    <>
      <ComputerInfoCard computer={selectedComputerDetails} isLoading={isLoadingComputerDetails} />
      {selectedPeripheralStatus.length > 0 && <PeripheralStatusCard items={selectedPeripheralStatus} />}
      {displayRoom && <LaboratoryLocationCard room={displayRoom} />}
    </>
  );

  return (
    <form onSubmit={handleSubmitRequest} className="mx-auto w-full max-w-[760px] space-y-5 px-5 py-6 md:px-6 md:py-7">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{ticketTitle}</h1>
        <p className="text-sm font-medium leading-relaxed text-zinc-500">{ticketSubtitle}</p>
      </section>

      {!isScannedReport && <TicketTypeToggle type={type} onTypeChange={setType} />}

      {isReport && !isScannedReport && (
        <QrScanButton onClick={() => navigate("/qr-scanner")} />
      )}

      {isScannedReport && computerInformation}

      {!isScannedReport && isReport && selectedComputerDetails && computerInformation}

      {!isScannedReport && (
        <LaboratoryDropdown
          rooms={rooms}
          selectedRoom={selectedRoom}
          roomId={roomId}
          isLoadingRooms={isLoadingRooms}
          onSelectRoom={handleSelectRoom}
        />
      )}

      {isReport && !isScannedReport && (
        <ComputerDropdown
          selectedRoom={selectedRoom}
          selectedComputerCode={selectedComputerCode}
          computers={roomComputers}
          isLoadingComputers={isLoadingComputers}
          isOpen={computerDropdownOpen}
          onOpenChange={setComputerDropdownOpen}
          onSelectComputer={setSelectedComputerCode}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" className="md:col-span-2">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={type === "report" ? "e.g., PC automatically restarts" : "e.g., Aircon not working"}
            className="h-12 w-full rounded-xl bg-white px-4 text-sm font-medium text-zinc-950 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none placeholder:text-zinc-300 focus:ring-2 focus:ring-primary/30"
          />
        </Field>

        <Field label="Description" className="md:col-span-2">
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            placeholder={descriptionPlaceholder}
            className="min-h-36 w-full resize-y rounded-xl bg-white p-4 text-sm font-medium text-zinc-950 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none placeholder:text-zinc-300 focus:ring-2 focus:ring-primary/30"
          />
          <span className="mt-1 block text-right text-xs font-medium text-zinc-400">{description.length}</span>
        </Field>
      </div>

      <ImageUploadField image={image} onImageChange={setImage} />

      <button type="submit" disabled={isSubmitting} className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl primary-bg-color text-sm font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition disabled:cursor-not-allowed disabled:bg-primary/35">
        {isSubmitting ? <><Spinner className="size-5" /> Submitting...</> : type === "report" ? "Submit report" : "Submit request"}
      </button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new {type} ticket for {selectedRoom ? `${selectedRoom.building_name} - ${selectedRoom.room_name}` : "the selected laboratory"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitTicket} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
