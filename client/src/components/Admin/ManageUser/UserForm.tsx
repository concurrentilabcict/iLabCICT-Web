import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/utils/appToast";
import {
  AtSign,
  ChevronDown,
  IdCard,
  ShieldCheck,
} from "lucide-react";

import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  buildApiUrl,
  createApiError,
  privateFetch,
  type ApiError,
} from "@/lib/api";
import type { User } from "@/types/manageUser";

type UserFormProps = {
  closeSheet: () => void;
  existingUsers: User[];
  user?: User | null;
};

type UserFormState = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "technician" | "faculty";
  isActive: boolean;
};

const initialForm: UserFormState = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "faculty",
  isActive: true,
};

const roleOptions: Array<{
  label: string;
  value: UserFormState["role"];
}> = [
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "Faculty",
    value: "faculty",
  },
  {
    label: "Technician",
    value: "technician",
  },
];

export default function UserForm({ closeSheet, existingUsers, user }: UserFormProps) {
  const isEditing = Boolean(user);
  const currentRole = user?.role.trim().toLowerCase();
  const [form, setForm] = useState<UserFormState>(() => user ? {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: currentRole === "admin" || currentRole === "technician" ? currentRole : "faculty",
    isActive: user.isActive,
  } : initialForm);
  const [roleOpen, setRoleOpen] = useState(false);
  const queryClient = useQueryClient();

  const normalizedEmail = form.email.trim().toLowerCase();
  const emailAlreadyExists = useMemo(
    () =>
      normalizedEmail !== "" &&
      existingUsers.some(
        (existingUser) => existingUser.id !== user?.id &&
          existingUser.email.trim().toLowerCase() === normalizedEmail
      ),
    [existingUsers, normalizedEmail, user?.id]
  );

  const saveUserMutation = useMutation({
    mutationFn: async () => {
      const response = await privateFetch(
        buildApiUrl(isEditing ? `/api/users/${user?.id}/` : "/api/users/"),
        {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            username: isEditing
              ? form.username.trim()
              : form.email.trim().toLowerCase(),
            email: form.email.trim().toLowerCase(),
            role: form.role,
            ...(isEditing ? { is_active: form.isActive } : {}),
          }),
        }
      );
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const payload = typeof data === "object" && data !== null
          ? data as { message?: string; detail?: string }
          : null;
        throw createApiError(
          response.status,
          payload?.message || payload?.detail || `Failed to ${isEditing ? "update" : "add"} user.`
        );
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard-users"],
      });

      appToast.success(`User ${isEditing ? "updated" : "added"} successfully.`);
      closeSheet();
    },
    onError: (error: ApiError) => {
      if (error.status === 400) {
        appToast.warning("Please review the user details and try again.");
        return;
      }

      appToast.error(error.message || `We couldn't ${isEditing ? "update" : "add"} the user. Please try again.`);
    },
  });

  const updateField = <Field extends keyof UserFormState>(
    field: Field,
    value: UserFormState[Field]
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (emailAlreadyExists) {
      appToast.warning("This email is already registered.");
      return;
    }

    saveUserMutation.mutate();
  };

  const isSubmitting = saveUserMutation.isPending;
  const selectedRole =
    roleOptions.find((role) => role.value === form.role) ?? roleOptions[0];

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle className="mb-2 text-lg font-semibold">{isEditing ? "Edit User" : "Add User"}</SheetTitle>
        <SheetDescription>
          {isEditing ? "Update this user's account details and access." : "Create a new account for a faculty member or technician."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-1">
        {isEditing && (
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="secondary-text-color flex items-center gap-x-1.5">
              <AtSign size={14} />
              Username
            </span>
            <Input
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              required
              disabled={isSubmitting}
              className="h-10"
            />
          </label>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="secondary-text-color flex items-center gap-x-1.5">
              <IdCard size={14} />
              First Name
            </span>
            <Input
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              required
              disabled={isSubmitting}
              className="h-10"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="secondary-text-color flex items-center gap-x-1.5">
              <IdCard size={14} />
              Last Name
            </span>
            <Input
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              required
              disabled={isSubmitting}
              className="h-10"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="secondary-text-color flex items-center gap-x-1.5">
            <AtSign size={14} />
            Email
          </span>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
            disabled={isSubmitting}
            aria-invalid={emailAlreadyExists}
            className="h-10"
          />
          {emailAlreadyExists && (
            <span className="text-xs font-medium text-red-500">
              This email is already registered.
            </span>
          )}
        </label>

        <div className="flex flex-col gap-2 text-sm font-medium">
          <span className="secondary-text-color flex items-center gap-x-1.5">
            <ShieldCheck size={14} />
            Role
          </span>

          <Popover
            open={roleOpen}
            onOpenChange={(isOpen) => {
              if (!isSubmitting) {
                setRoleOpen(isOpen);
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={isSubmitting}
                className="primary-border-color flex h-10 w-full cursor-pointer items-center justify-between gap-x-5 rounded-xl border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{selectedRole.label}</span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    roleOpen ? "rotate-180" : ""
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
                    {roleOptions.filter((role) => isEditing || role.value !== "admin").map((role) => (
                      <CommandItem
                        key={role.value}
                        onSelect={() => {
                          updateField("role", role.value);
                          setRoleOpen(false);
                        }}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                          form.role === role.value
                            ? "bg-muted data-selected:bg-muted"
                            : ""
                        }`}
                      >
                        <Checkbox checked={form.role === role.value} />
                        <span>{role.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {isEditing && (
          <label className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3 text-sm font-medium">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(checked) => updateField("isActive", checked === true)}
              disabled={isSubmitting}
            />
            <span>
              Active account
              <span className="block text-xs font-normal secondary-text-color">
                Inactive users cannot access the system.
              </span>
            </span>
          </label>
        )}
      </div>

      <SheetFooter>
        <Button type="submit" disabled={isSubmitting || emailAlreadyExists}>
          {isSubmitting && <Spinner />}
          {isEditing ? "Save Changes" : "Add User"}
        </Button>

         <SheetClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </SheetClose>
      </SheetFooter>
    </form>
  );
}
