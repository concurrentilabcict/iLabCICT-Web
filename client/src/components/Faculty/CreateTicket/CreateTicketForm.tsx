import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronDown, DoorOpen, ImagePlus, Monitor, ScanQrCode, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createApiError, privateFetch } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

type TicketType = "report" | "request";

type ApiRoom = {
  id: number;
  building_name: string;
  room_name: string;
  floor_number: number;
};

type ScannerState = { computerCode?: string } | null;

const API_URL = "https://ilabcict-backend.onrender.com/api";

export default function CreateTicketForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const scannerState = location.state as ScannerState;
  const computerCode = scannerState?.computerCode?.trim() ?? "";
  const [type, setType] = useState<TicketType>(computerCode ? "report" : "request");
  const [roomId, setRoomId] = useState("");
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
    if (computerCode && type === "report") formData.append("computer_code", computerCode);
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

      <div className="grid w-full grid-cols-2 rounded-xl bg-gray-200 p-1">
        {(["report", "request"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`h-9 cursor-pointer rounded-lg text-sm font-semibold capitalize transition ${type === option ? "primary-bg-color text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {option}
          </button>
        ))}
      </div>

      {type === "report" && !computerCode && (
        <button
          type="button"
          onClick={() => navigate("/qr-scanner")}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium primary-text-color shadow-sm transition hover:bg-gray-50"
        >
          <ScanQrCode size={17} />
          Scan a PC QR code
        </button>
      )}

      {type === "report" && computerCode && (
        <InfoCard title="Computer Information">
          <InfoItem icon={Monitor} primary={computerCode} secondary="Scanned computer" />
          <InfoItem icon={Building2} primary={selectedRoom?.building_name || "Select laboratory"} secondary="Building" />
        </InfoCard>
      )}

      <Field label="Laboratory">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-gray-500 shadow-sm outline-none focus:ring-2 focus:ring-primary/30">
              <span className="truncate text-left">
                {isLoadingRooms ? "Loading laboratories..." : selectedRoom ? `${selectedRoom.building_name} — ${selectedRoom.room_name}` : "Select Laboratory"}
              </span>
              <ChevronDown size={14} className="shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={8} className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {rooms.map((room) => (
              <DropdownMenuItem key={room.id} className={`cursor-pointer ${roomId === String(room.id) ? "font-medium" : ""}`} onSelect={() => setRoomId(String(room.id))}>
                {room.building_name} — {room.room_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>

      {selectedRoom && (
        <InfoCard title="Laboratory Location">
          <InfoItem icon={Building2} primary={selectedRoom.building_name} secondary="Building" />
          <InfoItem icon={DoorOpen} primary={selectedRoom.room_name} secondary={`Floor ${selectedRoom.floor_number}`} />
        </InfoCard>
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

      <Field label="Supporting Image (Optional)">
        <label className="flex min-h-16 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 px-3 text-center text-sm font-semibold text-gray-500 transition hover:border-primary hover:text-primary">
          <ImagePlus className="size-5 shrink-0" />
          <span className="truncate">{image ? image.name : "Upload an Image"}</span>
          <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="sr-only" />
        </label>
        {image && (
          <button type="button" onClick={() => setImage(null)} className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600">
            <X size={13} /> Remove image
          </button>
        )}
      </Field>

      <button type="submit" disabled={isSubmitting} className="mt-5 primary-button w-full rounded-full!">
        {isSubmitting ? <><Spinner className="size-5" /> Submitting...</> : "Submit Ticket"}
      </button>
    </form>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>{children}</label>;
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2 className="mb-1.5 text-base font-semibold text-gray-950">{title}</h2><div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">{children}</div></section>;
}

function InfoItem({ icon: Icon, primary, secondary }: { icon: typeof Monitor; primary: string; secondary: string }) {
  return <div className="flex min-w-0 items-center gap-2.5"><Icon className="size-5 shrink-0 text-gray-700" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{primary}</p><p className="truncate text-xs text-gray-500">{secondary}</p></div></div>;
}
