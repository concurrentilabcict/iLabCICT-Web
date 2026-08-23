import type { LucideIcon } from "lucide-react";

export type TicketType = "report" | "request";

export type ApiRoom = {
  id: number;
  building_name: string;
  room_name: string;
  floor_number: number;
};

export type ApiComputer = {
  id: number;
  room: ApiRoom;
  computer_code: string;
  operating_system: string;
  gpu?: string;
  cpu: string;
  motherboard?: string;
  ram_size_installed: number;
  disk_size_installed: number;
  build_version?: string;
  computer_status: string;
  monitor_status: string;
  mouse_status: string;
  keyboard_status: string;
  ups_status: string;
  created_at?: string;
  updated_at?: string;
};

export type ScannerState = { computerCode?: string } | null;

export type PeripheralTone = "green" | "red" | "yellow" | "gray";

export type PeripheralStatus = {
  label: string;
  status: string;
  tone: PeripheralTone;
  icon: LucideIcon;
};
