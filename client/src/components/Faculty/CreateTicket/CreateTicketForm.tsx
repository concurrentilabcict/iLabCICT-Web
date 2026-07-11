import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createApiError, privateFetch } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import type { ApiComputer, ApiRoom, ScannerState, TicketType } from "@/types/createTicket";

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

export default function CreateTicketForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const scannerState = location.state as ScannerState;
  const computerCode = scannerState?.computerCode?.trim() ?? "";
  const [type, setType] = useState<TicketType>("report");
  const [roomId, setRoomId] = useState("");
  const [selectedComputerCode, setSelectedComputerCode] = useState("");
  const [computerDropdownOpen, setComputerDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery<ApiRoom[]>({
    queryKey: ["rooms", "ticket-form"],
    queryFn: async () => {
      const response = await privateFetch(`${API_URL}/rooms/`);
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load laboratories.");
      return data as ApiRoom[];
    },
  });

  const selectedRoom = rooms.find((room) => String(room.id) === roomId);

  const { data: roomComputers = [], isLoading: isLoadingComputers } = useQuery<ApiComputer[]>({
    queryKey: ["computers", "ticket-form", selectedRoom?.room_name],
    enabled: Boolean(selectedRoom) && type === "report" && !computerCode,
    queryFn: async () => {
      const roomName = selectedRoom!.room_name.toLowerCase();
      const response = await privateFetch(`${API_URL}/rooms/${encodeURIComponent(roomName)}/computers/`);
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load computers.");
      return data as ApiComputer[];
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId || !title.trim() || !description.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("type", type);
    formData.append("room", roomId);
    formData.append("title", title.trim());
    formData.append("complaint_description", description.trim());
    if (activeComputerCode && type === "report") formData.append("computer_code", activeComputerCode);
    if (image) formData.append("issue_image", image);

    setIsSubmitting(true);
    try {
      const response = await privateFetch(`${API_URL}/tickets/`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to submit ticket.");
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket submitted successfully.");
      navigate("/manage-ticket", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[760px] space-y-4 px-3 py-5 md:px-5 md:py-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Create a Ticket</h1>
        <p className="mt-1 text-sm text-gray-500">Add the issue details so a technician can resolve it quickly.</p>
      </section>

      <TicketTypeToggle type={type} onTypeChange={setType} />

      {type === "report" && !computerCode && (
        <QrScanButton onClick={() => navigate("/qr-scanner")} />
      )}

      {type === "report" && (selectedComputerDetails || isLoadingComputerDetails) && (
        <ComputerInfoCard computer={selectedComputerDetails} isLoading={isLoadingComputerDetails} />
      )}

      <LaboratoryDropdown
        rooms={rooms}
        selectedRoom={selectedRoom}
        roomId={roomId}
        isLoadingRooms={isLoadingRooms}
        onSelectRoom={handleSelectRoom}
      />

      {type === "report" && !computerCode && (
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

      {selectedRoom && <LaboratoryLocationCard room={selectedRoom} />}

      {type === "report" && selectedPeripheralStatus.length > 0 && (
        <PeripheralStatusCard items={selectedPeripheralStatus} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" className="md:col-span-2">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={type === "report" ? "e.g., PC automatically restarts" : "e.g., Aircon not working"}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30"
          />
        </Field>

        <Field label="Description" className="md:col-span-2">
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue..."
            className="min-h-28 w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30"
          />
        </Field>
      </div>

      <ImageUploadField image={image} onImageChange={setImage} />

      <button type="submit" disabled={isSubmitting} className="mt-5 primary-button w-full rounded-full!">
        {isSubmitting ? <><Spinner className="size-5" /> Submitting...</> : "Submit Ticket"}
      </button>
    </form>
  );
}
