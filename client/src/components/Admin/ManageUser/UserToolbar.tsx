import { ChevronDown, Download, Search, X, Plus } from "lucide-react";
import { useRef, useState } from "react";
import type { User } from "@/types/manageUser";
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

export type RoleFilter = "All Role" | "Technician" | "Faculty";
const roleOptions: RoleFilter[] = ["All Role", "Technician", "Faculty"];

type UserToolbarProps = {
  users: User[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedRole: RoleFilter;
  onRoleChange: (role: RoleFilter) => void;
  selectedDate?: Date;
  onDateChange: (date?: Date) => void;
  onAddUser: () => void;
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

export default function UserToolbar({
  users,
  isLoading = false,
  searchQuery,
  onSearchQueryChange,
  selectedRole,
  onRoleChange,
  selectedDate,
  onDateChange,
  onAddUser,
}: UserToolbarProps) {
  const [openFilter, setOpenFilter] = useState<"role" | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    onSearchQueryChange("");
    searchInputRef.current?.focus();
  };

  const exportUsers = () => {
    if (users.length === 0) {
      return;
    }

    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Created",
    ];

    const rows = users.map((user) => [
      user.userCode,
      `${user.firstName} ${user.lastName}`.trim() || user.username,
      user.email,
      formatLabel(user.role),
      formatDate(user.createdAt),
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
    downloadLink.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
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
          onClick={exportUsers}
          disabled={isLoading || users.length === 0}
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
            placeholder="Search Users..."
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
          <div className="flex">
            <Popover
              open={openFilter === "role"}
              onOpenChange={(isOpen) =>
                setOpenFilter(isOpen ? "role" : null)
              }
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="primary-border-color flex min-w-48 cursor-pointer items-center justify-between gap-x-5 rounded-xl border bg-white px-3 py-2"
                >
                  <span>{selectedRole}</span>

                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      openFilter === "role" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-60 rounded-3xl p-1">
                <Command>
                  <CommandInput placeholder="Role" />

                  <CommandList>
                    <CommandEmpty>No role found.</CommandEmpty>

                    <CommandGroup className="p-2">
                      {roleOptions.map((role) => (
                        <CommandItem
                          key={role}
                          onSelect={() => onRoleChange(role)}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                            selectedRole === role
                              ? "bg-muted data-selected:bg-muted"
                              : ""
                          }`}
                        >
                          <Checkbox checked={selectedRole === role} />
                          <span>{role}</span>
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

        <button
          type="button"
          onClick={onAddUser}
          className="flex cursor-pointer items-center gap-x-2 rounded-xl primary-bg-color px-3 py-2 text-white"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>
    </div>
  );
}
