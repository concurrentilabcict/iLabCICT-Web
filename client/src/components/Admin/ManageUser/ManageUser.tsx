import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

import UserDetails from "./UserDetails";
import UserForm from "./UserForm";
import UserToolbar, { type RoleFilter } from "./UserToolbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

const ITEMS_PER_PAGE = 10;

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

export default function ManageUser() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All Role");
  const [dateFilter, setDateFilter] = useState<Date>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sheetMode, setSheetMode] = useState<"details" | "add">("details");
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await privateFetch(
        "https://ilabcict-backend.onrender.com/api/users/"
      );
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || "Failed to fetch users."
        );
      }

      return getUsersFromResponse(data as ApiUser[] | { results?: ApiUser[] }).map(
        mapUser
      );
    },
  });

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const name = `${user.firstName} ${user.lastName}`.trim() || user.username;
      const role = formatLabel(user.role);
      const created = formatDate(user.createdAt);
      const searchableText = [
        user.userCode,
        name,
        user.email,
        role,
        created,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery === "" || searchableText.includes(normalizedQuery);
      const matchesRole = roleFilter === "All Role" || role === roleFilter;
      const matchesDate =
        !dateFilter ||
        new Date(user.createdAt).toDateString() === dateFilter.toDateString();

      return matchesSearch && matchesRole && matchesDate;
    }).sort(sortByNewest);
  }, [users, searchQuery, roleFilter, dateFilter]);

  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const maxPage = Math.max(totalPages, 1);
  const currentPage = Math.min(page, maxPage);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), maxPage));
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setSheetMode("details");
    setSheetOpen(true);
  };

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setSheetMode("add");
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setSelectedUser(null);
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="mt-5 flex w-full flex-col gap-4 p-3">
        <UserToolbar
          users={filteredUsers}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchQueryChange={(query) =>
            updateFilter(() => setSearchQuery(query))
          }
          selectedRole={roleFilter}
          onRoleChange={(role) => updateFilter(() => setRoleFilter(role))}
          selectedDate={dateFilter}
          onDateChange={(date) => updateFilter(() => setDateFilter(date))}
          onAddUser={handleAddUserClick}
        />

      <div className="overflow-hidden rounded-2xl border border-primary-color bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted">User ID</TableHead>
              <TableHead className="bg-muted">Name</TableHead>
              <TableHead className="bg-muted">Email</TableHead>
              <TableHead className="bg-muted">Role</TableHead>
              <TableHead className="bg-muted">Created</TableHead>
              <TableHead className="bg-muted text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center secondary-text-color"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            )}

            {isError && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-red-500"
                >
                  Failed to load users.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center secondary-text-color"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              paginatedUsers.map((user) => {
                const name =
                  `${user.firstName} ${user.lastName}`.trim() || user.username;

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
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {user.userCode}
                    </TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatLabel(user.role)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                          <DropdownMenuItem
                            onClick={() => handleUserClick(user)}
                          >
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

      {totalPages > 1 && (
        <Pagination
          className={`flex ${isMobile ? "justify-center" : "justify-end"}`}
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  isActive={currentPage === index + 1}
                  onClick={() => goToPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh]" : "w-[420px]!"}
        >
          {sheetMode === "add" ? (
            <UserForm closeSheet={() => setSheetOpen(false)} />
          ) : (
            selectedUser && <UserDetails user={selectedUser} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
