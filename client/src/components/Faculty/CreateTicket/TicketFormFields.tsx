import type { ReactNode } from "react";
import { ChevronDown, ImagePlus, Plus, ScanQrCode, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiComputer, ApiRoom, TicketType } from "@/types/createTicket";

export function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-zinc-700">{label}</span>
      {children}
    </div>
  );
}

export function TicketTypeToggle({ type, onTypeChange }: { type: TicketType; onTypeChange: (type: TicketType) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {(["report", "request"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onTypeChange(option)}
          className={`shrink-0 cursor-pointer rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors ${
            type === option
              ? "primary-bg-color text-white shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
              : "bg-white text-zinc-500 shadow-[0_3px_10px_rgba(15,23,42,0.10)] hover:bg-gray-50 hover:text-zinc-700"
          }`}
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
      className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium primary-text-color shadow-[0_3px_10px_rgba(15,23,42,0.10)] transition hover:bg-gray-50"
    >
      <ScanQrCode size={16} />
      Scan QR Code
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
          <button type="button" className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-4 text-sm font-medium text-zinc-400 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none focus:ring-2 focus:ring-primary/30">
            <span className={`truncate text-left ${selectedRoom ? "text-zinc-950" : ""}`}>
              {isLoadingRooms ? "Loading laboratories..." : selectedRoom ? selectedRoom.room_name : "Select Laboratory"}
            </span>
            <ChevronDown size={16} className="shrink-0 text-zinc-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-none p-2 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
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
          <button type="button" disabled={!selectedRoom} className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-4 text-sm font-medium text-zinc-400 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-white disabled:text-zinc-300">
            <span className={`truncate text-left ${selectedComputerCode ? "text-zinc-950" : ""}`}>
              {selectedRoom ? selectedComputerCode || (isLoadingComputers ? "Loading computers..." : "Select Computer") : "Select a laboratory first"}
            </span>
            <ChevronDown size={16} className="shrink-0 text-zinc-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-none p-2 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
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
    <Field label="Supporting Image">
      <span className="-mt-7 mb-2 ml-32 block text-xs font-medium text-zinc-400">Optional</span>
      <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/25 bg-primary/5 px-5 text-center transition hover:border-primary/45">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 primary-text-color">
          <ImagePlus className="size-6 shrink-0" />
        </span>
        <span className="text-base font-semibold text-zinc-950">{image ? image.name : "Add a supporting image"}</span>
        <span className="text-xs font-medium text-zinc-500">Upload a photo to help technicians understand the issue</span>
        <span className="mt-1 inline-flex items-center gap-2 rounded-full primary-bg-color px-5 py-2 text-sm font-medium text-white">
          <Plus size={16} />
          Choose Image
        </span>
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
