import type { ReactNode } from "react";
import { Building2, DoorOpen, HardDrive, Keyboard, MemoryStick, Monitor, Mouse, Zap, type LucideIcon } from "lucide-react";

import type { ApiComputer, ApiRoom, PeripheralStatus, PeripheralTone } from "@/types/createTicket";

const statusToneClass: Record<PeripheralTone, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-400",
};

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 text-base font-semibold text-gray-950">{title}</h2>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {children}
      </div>
    </section>
  );
}

function InfoItem({ icon: Icon, primary, secondary }: { icon: LucideIcon; primary: string; secondary: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Icon className="size-5 shrink-0 text-gray-700" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{primary}</p>
        <p className="truncate text-xs text-gray-500">{secondary}</p>
      </div>
    </div>
  );
}

export function getPeripheralStatuses(computer: ApiComputer): PeripheralStatus[] {
  return [
    { label: "Mouse", status: formatStatus(computer.mouse_status), tone: getStatusTone(computer.mouse_status), icon: Mouse },
    { label: "Keyboard", status: formatStatus(computer.keyboard_status), tone: getStatusTone(computer.keyboard_status), icon: Keyboard },
    { label: "Monitor", status: formatStatus(computer.monitor_status), tone: getStatusTone(computer.monitor_status), icon: Monitor },
    { label: "UPS", status: formatStatus(computer.ups_status), tone: getStatusTone(computer.ups_status), icon: Zap },
  ];
}

export function ComputerInfoCard({ computer, isLoading }: { computer?: ApiComputer; isLoading: boolean }) {
  return (
    <InfoCard title="Computer Information">
      {isLoading ? (
        <InfoItem icon={Monitor} primary="Loading computer..." secondary="Please wait" />
      ) : computer ? (
        <>
          <InfoItem icon={Monitor} primary={computer.operating_system} secondary="Operating System" />
          <InfoItem icon={MemoryStick} primary={computer.cpu} secondary="Processor" />
          <InfoItem icon={Keyboard} primary={`${computer.ram_size_installed}GB RAM`} secondary={computer.computer_code} />
          <InfoItem icon={HardDrive} primary={`${computer.disk_size_installed}GB Storage`} secondary="Disk" />
        </>
      ) : null}
    </InfoCard>
  );
}

export function LaboratoryLocationCard({ room }: { room: ApiRoom }) {
  return (
    <InfoCard title="Laboratory Location">
      <InfoItem icon={Building2} primary={room.building_name} secondary="Building" />
      <InfoItem icon={DoorOpen} primary={room.room_name} secondary={`Floor ${room.floor_number}`} />
    </InfoCard>
  );
}

export function PeripheralStatusCard({ items }: { items: PeripheralStatus[] }) {
  return (
    <section>
      <h2 className="mb-1.5 text-base font-semibold text-gray-950">Peripheral Status</h2>
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {items.map(({ label, status, tone, icon: Icon }) => (
          <div key={label} className={`flex min-w-0 items-center gap-2.5 ${tone === "gray" ? "opacity-50" : ""}`}>
            <Icon className="size-5 shrink-0 text-gray-800" />
            <div className="min-w-0">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusToneClass[tone]}`}>{status}</span>
              <p className="mt-0.5 truncate text-xs font-medium text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getStatusTone(status: string): PeripheralTone {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === "active" || normalizedStatus === "operational") return "green";
  if (normalizedStatus === "broken" || normalizedStatus === "inactive") return "red";
  if (normalizedStatus === "fixing" || normalizedStatus === "maintenance") return "yellow";
  return "gray";
}

function formatStatus(status: string) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "None";
}
