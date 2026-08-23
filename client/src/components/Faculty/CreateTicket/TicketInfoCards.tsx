import {
  Building2,
  Braces,
  Cpu,
  DoorOpen,
  HardDrive,
  Keyboard,
  Layers3,
  MemoryStick,
  Microchip,
  Monitor,
  Mouse,
  Plug,
  type LucideIcon,
} from "lucide-react";

import type { ApiComputer, ApiRoom, PeripheralStatus, PeripheralTone } from "@/types/createTicket";

const statusToneClass: Record<PeripheralTone, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-600",
};

const iconBoxClass =
  "flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 primary-text-color";

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-bold tracking-tight text-zinc-950">{title}</h2>
      <p className="text-xs font-medium text-zinc-500">{subtitle}</p>
    </div>
  );
}

function formatStatus(status: string) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "None";
}

function getStatusTone(status: string): PeripheralTone {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === "active" || normalizedStatus === "operational") return "green";
  if (normalizedStatus === "broken" || normalizedStatus === "inactive") return "red";
  if (normalizedStatus === "fixing" || normalizedStatus === "maintenance") return "yellow";
  return "gray";
}

function formatStorage(value?: number) {
  return typeof value === "number" ? `${value} GB` : "Not set";
}

function formatRam(value?: number) {
  return typeof value === "number" ? `${value} GB` : "Not set";
}

export function getPeripheralStatuses(computer: ApiComputer): PeripheralStatus[] {
  return [
    { label: "Mouse", status: formatStatus(computer.mouse_status), tone: getStatusTone(computer.mouse_status), icon: Mouse },
    { label: "Keyboard", status: formatStatus(computer.keyboard_status), tone: getStatusTone(computer.keyboard_status), icon: Keyboard },
    { label: "Monitor", status: formatStatus(computer.monitor_status), tone: getStatusTone(computer.monitor_status), icon: Monitor },
    { label: "UPS", status: formatStatus(computer.ups_status), tone: getStatusTone(computer.ups_status), icon: Plug },
  ];
}

export function ComputerInfoCard({ computer, isLoading }: { computer?: ApiComputer; isLoading: boolean }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Computer Information" subtitle="Hardware and system specifications" />
      <div className="rounded-xl bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
        {isLoading ? (
          <p className="text-sm font-semibold text-zinc-500">Loading computer information...</p>
        ) : computer ? (
          <div className="grid grid-cols-2 gap-x-5">
            <div className="space-y-4 border-r border-zinc-100 pr-4">
              <SpecRow icon={Monitor} value={computer.computer_code} label={formatStatus(computer.computer_status)} statusTone={getStatusTone(computer.computer_status)} />
              <SpecRow icon={Monitor} value={computer.operating_system} label="Operating System" />
              <SpecRow icon={Braces} value={computer.build_version ?? "Not set"} label="Build Version" />
              <SpecRow icon={Microchip} value={computer.motherboard ?? "Not set"} label="Motherboard" />
            </div>
            <div className="space-y-4 pl-4">
              <SpecRow icon={Cpu} value={computer.cpu} label="CPU" />
              <SpecRow icon={HardDrive} value={computer.gpu ?? "Not set"} label="GPU" />
              <SpecRow icon={MemoryStick} value={formatRam(computer.ram_size_installed)} label="RAM" />
              <SpecRow icon={HardDrive} value={formatStorage(computer.disk_size_installed)} label="Storage" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function LaboratoryLocationCard({ room }: { room: ApiRoom }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Laboratory Location" subtitle="Location associated with this computer" />
      <div className="rounded-xl bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
        <LocationRow icon={Building2} label="Building" value={room.building_name} />
        <LocationRow icon={Layers3} label="Floor" value={String(room.floor_number)} />
        <LocationRow icon={DoorOpen} label="Laboratory" value={room.room_name} isLast />
      </div>
    </section>
  );
}

export function PeripheralStatusCard({ items }: { items: PeripheralStatus[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Peripheral Status" subtitle="Current condition of connected peripherals" />
      <div className="rounded-xl bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-2 gap-x-5">
          <div className="space-y-4 border-r border-zinc-100 pr-4">
            {items
              .filter((item) => item.label === "Mouse" || item.label === "Monitor")
              .map((item) => (
                <PeripheralRow key={item.label} item={item} />
              ))}
          </div>
          <div className="space-y-4 pl-4">
            {items
              .filter((item) => item.label === "Keyboard" || item.label === "UPS")
              .map((item) => (
                <PeripheralRow key={item.label} item={item} />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecRow({
  icon: Icon,
  value,
  label,
  statusTone,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  statusTone?: PeripheralTone;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className={iconBoxClass}>
        <Icon size={17} />
      </span>
      <div className="min-w-0 pt-1">
        {statusTone ? (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusToneClass[statusTone]}`}>{label}</span>
        ) : (
          <p className="text-xs font-semibold text-zinc-500">{label}</p>
        )}
        <p className="mt-0.5 break-words text-sm font-bold leading-snug text-zinc-950">{value}</p>
      </div>
    </div>
  );
}

function PeripheralRow({ item }: { item: PeripheralStatus }) {
  const Icon = item.icon;

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className={iconBoxClass}>
        <Icon size={17} />
      </span>
      <div className="min-w-0 pt-1">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusToneClass[item.tone]}`}>{item.status}</span>
        <p className="mt-0.5 text-sm font-semibold text-zinc-500">{item.label}</p>
      </div>
    </div>
  );
}

function LocationRow({
  icon: Icon,
  label,
  value,
  isLast = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 py-3 ${isLast ? "" : "border-b border-zinc-100"}`}>
      <span className={iconBoxClass}>
        <Icon size={17} />
      </span>
      <div>
        <p className="text-xs font-semibold text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-zinc-950">{value}</p>
      </div>
    </div>
  );
}
