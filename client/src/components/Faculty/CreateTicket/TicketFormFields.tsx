import type { ReactNode } from "react";
import { ChevronDown, ImagePlus, ScanQrCode, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiComputer, ApiRoom, TicketType } from "@/types/createTicket";

export function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export function TicketTypeToggle({ type, onTypeChange }: { type: TicketType; onTypeChange: (type: TicketType) => void }) {
  return (
    <div className="grid w-full grid-cols-2 rounded-xl bg-gray-200 p-1">
      {(["report", "request"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onTypeChange(option)}
          className={`h-9 cursor-pointer rounded-lg text-sm font-semibold capitalize transition ${type === option ? "primary-bg-color text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function QrScanButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium primary-text-color shadow-sm transition hover:bg-gray-50"
    >
      <ScanQrCode size={17} />
      Scan a PC QR code
    </button>
  );
}

export function LaboratoryDropdown({
  rooms,
  selectedRoom,
  roomId,
  isLoadingRooms,
  onSelectRoom,
}: {
  rooms: ApiRoom[];
  selectedRoom?: ApiRoom;
  roomId: string;
  isLoadingRooms: boolean;
  onSelectRoom: (roomId: string) => void;
}) {
  return (
    <Field label="Laboratory">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-gray-500 shadow-sm outline-none focus:ring-2 focus:ring-primary/30">
            <span className="truncate text-left">
              {isLoadingRooms ? "Loading laboratories..." : selectedRoom ? `${selectedRoom.building_name} - ${selectedRoom.room_name}` : "Select Laboratory"}
            </span>
            <ChevronDown size={14} className="shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {rooms.map((room) => (
            <DropdownMenuItem key={room.id} className={`cursor-pointer ${roomId === String(room.id) ? "font-medium" : ""}`} onSelect={() => onSelectRoom(String(room.id))}>
              {room.building_name} - {room.room_name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}

export function ComputerDropdown({
  selectedRoom,
  selectedComputerCode,
  computers,
  isLoadingComputers,
  isOpen,
  onOpenChange,
  onSelectComputer,
}: {
  selectedRoom?: ApiRoom;
  selectedComputerCode: string;
  computers: ApiComputer[];
  isLoadingComputers: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectComputer: (computerCode: string) => void;
}) {
  return (
    <Field label="Computer">
      <DropdownMenu open={isOpen} onOpenChange={(open) => onOpenChange(Boolean(selectedRoom) && open)}>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={!selectedRoom} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-gray-500 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400">
            <span className="truncate text-left">{selectedRoom ? selectedComputerCode || (isLoadingComputers ? "Loading computers..." : "Select Computer") : "Select laboratory first"}</span>
            <ChevronDown size={14} className="shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {computers.length > 0 ? computers.map((computer) => (
            <DropdownMenuItem key={computer.id} className={`cursor-pointer ${selectedComputerCode === computer.computer_code ? "font-medium" : ""}`} onSelect={() => onSelectComputer(computer.computer_code)}>
              {computer.computer_code}
            </DropdownMenuItem>
          )) : (
            <DropdownMenuItem disabled>
              {isLoadingComputers ? "Loading computers..." : "No computers available"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}

export function ImageUploadField({ image, onImageChange }: { image: File | null; onImageChange: (image: File | null) => void }) {
  return (
    <Field label="Supporting Image (Optional)">
      <label className="flex min-h-16 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 px-3 text-center text-sm font-semibold text-gray-500 transition hover:border-primary hover:text-primary">
        <ImagePlus className="size-5 shrink-0" />
        <span className="truncate">{image ? image.name : "Upload an Image"}</span>
        <input type="file" accept="image/*" onChange={(event) => onImageChange(event.target.files?.[0] ?? null)} className="sr-only" />
      </label>
      {image && (
        <button type="button" onClick={() => onImageChange(null)} className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600">
          <X size={13} /> Remove image
        </button>
      )}
    </Field>
  );
}
