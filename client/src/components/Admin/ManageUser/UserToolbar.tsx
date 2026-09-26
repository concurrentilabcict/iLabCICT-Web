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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { appToast } from "@/utils/appToast";
import { exportTablePdf, formatPdfDate, getLocalDateStamp } from "@/utils/tabularPdf";

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

  const exportUsers = async () => {
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

    try {
      exportTablePdf({
        title: "iLabCICT User Directory",
        subject: "User directory export",
        filename: `iLabCICT_Users_${getLocalDateStamp()}.pdf`,
        headers,
        rows: users.map((user) => [
          user.userCode,
          `${user.firstName} ${user.lastName}`.trim() || user.username,
          user.email,
          formatLabel(user.role),
          formatPdfDate(user.createdAt),
        ]),
        columnWidths: [18, 28, 34, 18, 20],
      });
    } catch (error) {
      appToast.error(
        error instanceof Error ? error.message : "We couldn't export the users."
      );
    }
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              disabled={isLoading || users.length === 0}
              className="flex cursor-pointer items-center gap-x-1.5 rounded-xl border bg-white px-3.5 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={20} className="rotate-180" />
              <span>Export</span>
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Export Users?</AlertDialogTitle>

              <AlertDialogDescription>
                This will prepare the current users table as an A4 PDF.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction onClick={() => void exportUsers()}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
