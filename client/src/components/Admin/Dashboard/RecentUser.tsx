import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MoreHorizontal, Search, X } from "lucide-react";

import UserDetails from "../ManageUser/UserDetails";
import placeholderPicture from "@/assets/profile-placeholder.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createApiError, privateFetch } from "@/lib/api";
import type { User } from "@/types/manageUser";

type ApiUser = {
  id: number;
  userCode?: string;
  user_code?: string;
  username: string;
  email: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  role: string;
  profileImage?: string;
  profile_image?: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at: string;
};

type RoleFilter = "All Role" | "Technician" | "Faculty";

const USERS_URL = "https://ilabcict-backend.onrender.com/api/users/";
const RECENT_LIMIT = 8;
const roleOptions: RoleFilter[] = ["All Role", "Technician", "Faculty"];

const formatLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const getUsersFromResponse = (data: ApiUser[] | { results?: ApiUser[] }) =>
  Array.isArray(data) ? data : data.results ?? [];

const sortByNewest = (firstUser: User, secondUser: User) =>
  Date.parse(secondUser.createdAt) - Date.parse(firstUser.createdAt);

const mapUser = (user: ApiUser): User => ({
  id: user.id,
  userCode: user.userCode ?? user.user_code ?? String(user.id),
  username: user.username,
  email: user.email,
  firstName: user.firstName ?? user.first_name ?? "",
  lastName: user.lastName ?? user.last_name ?? "",
  role: user.role,
  profileImage: user.profileImage ?? user.profile_image ?? "",
  isActive: user.isActive ?? user.is_active ?? false,
  createdAt: user.createdAt ?? user.created_at,
});

async function fetchUsers() {
  const response = await privateFetch(USERS_URL);
  const data = await response.json();

  if (!response.ok) {
    throw createApiError(
      response.status,
      data.message || "Failed to fetch recent users."
    );
  }

  return getUsersFromResponse(data as ApiUser[] | { results?: ApiUser[] }).map(
    mapUser
  );
}

export default function RecentUser() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All Role");
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: ["admin-dashboard-recent-users"],
    queryFn: fetchUsers,
    staleTime: 60_000,
  });

  const recentUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users
      .filter((user) => {
        const name = `${user.firstName} ${user.lastName}`.trim() || user.username;
        const role = formatLabel(user.role);
        const searchableText = [user.userCode, name, role]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          normalizedQuery === "" || searchableText.includes(normalizedQuery);
        const matchesRole = roleFilter === "All Role" || role === roleFilter;

        return matchesSearch && matchesRole;
      })
      .sort(sortByNewest)
      .slice(0, RECENT_LIMIT);
  }, [users, searchQuery, roleFilter]);

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setSelectedUser(null);
    }
  };

  return (
    <>
      <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-800">
            Recent Users
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[220px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search users..."
                className="primary-border-color w-full rounded-xl border bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-black!"
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="secondary-text-color absolute right-3 top-1/2 -translate-y-1/2 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Popover open={openFilter} onOpenChange={setOpenFilter}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="primary-border-color flex min-w-32 cursor-pointer items-center justify-between gap-x-4 rounded-xl border bg-white px-3 py-2 text-sm"
                >
                  <span>{roleFilter}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      openFilter ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-52 rounded-3xl p-1">
                <Command>
                  <CommandInput placeholder="Role" />
                  <CommandList>
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup className="p-2">
                      {roleOptions.map((role) => (
                        <CommandItem
                          key={role}
                          onSelect={() => {
                            setRoleFilter(role);
                            setOpenFilter(false);
                          }}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                            roleFilter === role
                              ? "bg-muted data-selected:bg-muted"
                              : ""
                          }`}
                        >
                          <Checkbox checked={roleFilter === role} />
                          <span>{role}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-color bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted">User ID</TableHead>
                <TableHead className="bg-muted">Name</TableHead>
                <TableHead className="bg-muted">Role</TableHead>
                <TableHead className="bg-muted text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center secondary-text-color"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-red-500">
                    Failed to load users.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && recentUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center secondary-text-color"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                !isError &&
                recentUsers.map((user) => {
                  const name =
                    `${user.firstName} ${user.lastName}`.trim() || user.username;
                  const displayedProfilePicture = user.profileImage?.trim()
                    ? user.profileImage
                    : placeholderPicture;

                  return (
                    <TableRow
                      key={user.id}
                      tabIndex={0}
                      role="button"
                      onClick={() => handleUserClick(user)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleUserClick(user);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {user.userCode}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={displayedProfilePicture}
                            alt={name}
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                          <span className="truncate">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatLabel(user.role)}</TableCell>
                      <TableCell
                        className="text-center"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`Actions for ${user.userCode}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUserClick(user)}>
                              View User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </section>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh]" : "w-[420px]!"}
        >
          {selectedUser && <UserDetails user={selectedUser} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
