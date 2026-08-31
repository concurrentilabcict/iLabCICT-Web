import {
  CalendarDays,
  Building2,
  Braces,
  ChevronDown,
  Cpu,
  DoorOpen,
  HardDrive,
  Info,
  Keyboard,
  Layers3,
  MemoryStick,
  Microchip,
  Monitor,
  Mouse,
  User,
  Wrench,
  Plug,
  type LucideIcon,
} from "lucide-react";

import type { ApiComputer, ApiRelatedTicket, ApiRoom, PeripheralStatus, PeripheralTone } from "@/types/createTicket";
import { Skeleton } from "@/components/ui/skeleton";

const statusToneClass: Record<PeripheralTone, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-600",
};

const iconBoxClass =
  "flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#f0c9c0] bg-[#fbf2f0] text-[#bf3419]";

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

function formatPerson(person?: { first_name: string; last_name: string } | null) {
  return person ? `${person.first_name} ${person.last_name}` : "Unassigned";
}

function formatDate(value?: string) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getPeripheralStatuses(computer: ApiComputer): PeripheralStatus[] {
  return [
    { label: "Mouse", status: formatStatus(computer.mouse_status), tone: getStatusTone(computer.mouse_status), icon: Mouse },
    { label: "Keyboard", status: formatStatus(computer.keyboard_status), tone: getStatusTone(computer.keyboard_status), icon: Keyboard },
    { label: "Monitor", status: formatStatus(computer.monitor_status), tone: getStatusTone(computer.monitor_status), icon: Monitor },
    { label: "UPS", status: formatStatus(computer.ups_status), tone: getStatusTone(computer.ups_status), icon: Plug },
  ];
}

export function RelatedTicketsCard({
  tickets,
  count,
  isOpen,
  onToggle,
}: {
  tickets: ApiRelatedTicket[];
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl bg-white p-4 text-left shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
      >
        <span className="min-w-0">
          <span className="block text-base font-bold text-zinc-950">Related tickets</span>
          <span className="block text-xs font-medium text-zinc-500">Tickets currently assigned to this computer</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{count}</span>
          <ChevronDown size={18} className={`shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {count > 0 && (
        <div className="flex gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
          <Info className="mt-0.5 size-5 shrink-0 text-yellow-600" />
          <p className="text-sm font-semibold leading-6">
            {count} related {count === 1 ? "ticket" : "tickets"} found for this computer. Please review {count === 1 ? "it" : "them"} first and avoid creating a duplicate ticket if your concern is already covered.
          </p>
        </div>
      )}

      {isOpen && tickets.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-[#efc8c0] bg-[#fff8f6] p-3">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="rounded-xl bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold uppercase tracking-wide text-zinc-400">{ticket.ticket_code ?? `TK${ticket.id}`}</p>
                  <h3 className="mt-1 text-base font-bold leading-tight text-zinc-950">{ticket.title}</h3>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${ticket.status === "open" ? "bg-sky-100 text-sky-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">{ticket.complaint_description}</p>
              <div className="mt-4 border-t border-zinc-100 pt-3">
                <RelatedTicketMeta icon={User} label="Reported by" value={formatPerson(ticket.reported_by)} />
                <RelatedTicketMeta icon={Wrench} label="Assigned to" value={formatPerson(ticket.assigned_to)} />
                <RelatedTicketMeta icon={CalendarDays} label="Created" value={formatDate(ticket.created_at)} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function ComputerInfoCard({ computer, isLoading }: { computer?: ApiComputer; isLoading: boolean }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Computer Information" subtitle="Hardware and system specifications" />
      <div className="rounded-xl bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5">
            {Array.from({ length: 2 }, (_, columnIndex) => (
              <div
                key={columnIndex}
                className={`space-y-4 ${columnIndex === 0 ? "border-r border-zinc-100 pr-4" : "pl-4"}`}
              >
                {Array.from({ length: 4 }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
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

function RelatedTicketMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 text-sm">
      <span className="flex items-center gap-2 font-semibold text-zinc-400">
        <Icon size={15} />
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-bold text-zinc-950">{value}</span>
    </div>
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
