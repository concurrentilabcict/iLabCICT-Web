import { ChevronDown, Download, Search, X } from "lucide-react";
import { useRef, useState } from "react";
import type { RepairLog } from "@/types/repairLog";
import type { TicketTypeFilter } from "@/utils/ticket";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

import { DatePicker } from "../DatePicker/DatePicker";

const typeOptions: TicketTypeFilter[] = ["All", "Request", "Report"];
export type TechnicianFilter =
  | "All Technician"
  | "John Patrick Soriaga"
  | "Limuel Camangon";
const technicianOptions: TechnicianFilter[] = [
  "All Technician",
  "John Patrick Soriaga",
  "Limuel Camangon",
];

type LogToolbarProps = {
  repairLogs: RepairLog[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedType: TicketTypeFilter;
  onTypeChange: (type: TicketTypeFilter) => void;
  selectedTechnician: TechnicianFilter;
  onTechnicianChange: (technician: TechnicianFilter) => void;
  selectedDate?: Date;
  onDateChange: (date?: Date) => void;
};

const formatLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const escapeCsvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default function LogToolbar({
  repairLogs,
  isLoading = false,
  searchQuery,
  onSearchQueryChange,
  selectedType,
  onTypeChange,
  selectedTechnician,
  onTechnicianChange,
  selectedDate,
  onDateChange,
}: LogToolbarProps) {
  const [openFilter, setOpenFilter] = useState<"technician" | "type" | null>(
    null
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    onSearchQueryChange("");
    searchInputRef.current?.focus();
  };

  const exportRepairLogs = () => {
    if (repairLogs.length === 0) {
      return;
    }

    const headers = [
      "Repair Log ID",
      "Faculty",
      "Technician",
      "Type",
      "Title",
      "Repair Notes",
      "Created",
    ];

    const rows = repairLogs.map((repairLog) => [
      repairLog.repairLogCode,
      `${repairLog.ticket.reportedBy.firstName} ${repairLog.ticket.reportedBy.lastName}`,
      `${repairLog.ticket.assignedTo.firstName} ${repairLog.ticket.assignedTo.lastName}`,
      formatLabel(repairLog.ticket.type),
      repairLog.title,
      repairLog.repairNotes,
      formatDate(repairLog.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = `repair-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={exportRepairLogs}
          disabled={isLoading || repairLogs.length === 0}
          className="flex cursor-pointer items-center gap-x-1.5 rounded-xl border bg-white px-3.5 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={20} className="rotate-180" />
          <span>Export</span>
        </button>

        <div className="relative w-[300px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search Repair Logs..."
            className="primary-border-color w-full rounded-xl border bg-white py-2 pl-10 pr-10 outline-none focus:border-black!"
          />

          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="secondary-text-color absolute right-3 top-1/2 -translate-y-1/2 hover:text-black"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <Popover
            open={openFilter === "technician"}
            onOpenChange={(isOpen) =>
              setOpenFilter(isOpen ? "technician" : null)
            }
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="primary-border-color flex min-w-48 cursor-pointer items-center justify-between gap-x-5 rounded-xl border bg-white px-3 py-2"
              >
                <span>{selectedTechnician}</span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    openFilter === "technician" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-60 rounded-3xl p-1">
              <Command>
                <CommandInput placeholder="Technician" />

                <CommandList>
                  <CommandEmpty>No technician found.</CommandEmpty>

                  <CommandGroup className="p-2">
                    {technicianOptions.map((technician) => (
                      <CommandItem
                        key={technician}
                        onSelect={() => onTechnicianChange(technician)}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                          selectedTechnician === technician
                            ? "bg-muted data-selected:bg-muted"
                            : ""
                        }`}
                      >
                        <Checkbox checked={selectedTechnician === technician} />
                        <span>{technician}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover
            open={openFilter === "type"}
            onOpenChange={(isOpen) => setOpenFilter(isOpen ? "type" : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="primary-border-color flex min-w-36 cursor-pointer items-center justify-between gap-x-5 rounded-xl border bg-white px-3 py-2"
              >
                <span>{selectedType === "All" ? "All Type" : selectedType}</span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    openFilter === "type" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-50 rounded-3xl p-1">
              <Command>
                <CommandInput placeholder="Type" />

                <CommandList>
                  <CommandEmpty>No type found.</CommandEmpty>

                  <CommandGroup className="p-2">
                    {typeOptions.map((type) => (
                      <CommandItem
                        key={type}
                        onSelect={() => onTypeChange(type)}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                          selectedType === type
                            ? "bg-muted data-selected:bg-muted"
                            : ""
                        }`}
                      >
                        <Checkbox checked={selectedType === type} />
                        <span>{type}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <DatePicker date={selectedDate} onDateChange={onDateChange} />
      </div>
    </div>
  );
}
