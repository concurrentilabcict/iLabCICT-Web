import type { ReactNode } from "react";
import { ChevronDown, ImagePlus, Plus, ScanQrCode, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiComputer, ApiRoom, TicketType } from "@/types/createTicket";
import { Skeleton } from "@/components/ui/skeleton";

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
            <div className={`truncate text-left ${selectedRoom ? "text-zinc-950" : ""}`}>
              {isLoadingRooms ? <Skeleton className="h-4 w-36" /> : selectedRoom ? selectedRoom.room_name : "Select Laboratory"}
            </div>
            <ChevronDown size={16} className="shrink-0 text-zinc-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-none p-2 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
          {rooms.map((room) => (
            <DropdownMenuItem key={room.id} className={`cursor-pointer rounded-none border-b border-zinc-100 py-2.5 last:border-b-0 ${roomId === String(room.id) ? "font-medium" : ""}`} onSelect={() => onSelectRoom(String(room.id))}>
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
            <div className={`truncate text-left ${selectedComputerCode ? "text-zinc-950" : ""}`}>
              {selectedRoom ? selectedComputerCode || (isLoadingComputers ? <Skeleton className="h-4 w-32" /> : "Select Computer") : "Select a laboratory first"}
            </div>
            <ChevronDown size={16} className="shrink-0 text-zinc-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-none p-2 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
          {computers.length > 0 ? computers.map((computer) => (
            <DropdownMenuItem key={computer.id} className={`cursor-pointer rounded-none border-b border-zinc-100 py-2.5 last:border-b-0 ${selectedComputerCode === computer.computer_code ? "font-medium" : ""}`} onSelect={() => onSelectComputer(computer.computer_code)}>
              {computer.computer_code}
            </DropdownMenuItem>
          )) : (
            <DropdownMenuItem disabled className="py-2.5">
              {isLoadingComputers ? <Skeleton className="h-4 w-full" /> : "No computers available"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}

export function ImageUploadField({ image, onImageChange }: { image: File | null; onImageChange: (image: File | null) => void }) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-700">
        Supporting Image <span className="ml-1 text-xs font-medium text-zinc-400">(optional)</span>
      </span>
      <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#efc8c0] bg-[#fff8f6] px-5 py-8 text-center transition hover:border-[#dc8f80]">
        <span className="flex size-12 items-center justify-center rounded-xl border border-[#f0c9c0] bg-[#fbf2f0] text-[#bf3419]">
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
    </div>
  );
}
