import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AtSign,
  ChevronDown,
  IdCard,
  KeyRound,
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
import { createApiError, privateFetch, type ApiError } from "@/lib/api";

type UserFormProps = {
  closeSheet: () => void;
};

type AddUserForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: "technician" | "faculty";
  password: string;
};

const initialForm: AddUserForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "faculty",
  password: "",
};

const roleOptions: Array<{
  label: string;
  value: AddUserForm["role"];
}> = [
  {
    label: "Faculty",
    value: "faculty",
  },
  {
    label: "Technician",
    value: "technician",
  },
];

export default function UserForm({ closeSheet }: UserFormProps) {
  const [form, setForm] = useState<AddUserForm>(initialForm);
  const [roleOpen, setRoleOpen] = useState(false);
  const queryClient = useQueryClient();

  const addUserMutation = useMutation({
    mutationFn: async () => {
      const response = await privateFetch(
        "https://ilabcict-backend.onrender.com/api/users/",
        {
          method: "POST",
          body: JSON.stringify({
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            username: form.email.trim().toLowerCase(),
            email: form.email.trim().toLowerCase(),
            role: form.role,
            password: form.password,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || data.detail || "Failed to add user."
        );
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });

      toast.success("User added successfully.");
      closeSheet();
    },
    onError: (error: ApiError) => {
      if (error.status === 400) {
        toast.error(error.message || "Please check the user details.");
        return;
      }

      toast.error("Failed to add user.");
    },
  });

  const updateField = <Field extends keyof AddUserForm>(
    field: Field,
    value: AddUserForm[Field]
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addUserMutation.mutate();
  };

  const isSubmitting = addUserMutation.isPending;
  const selectedRole =
    roleOptions.find((role) => role.value === form.role) ?? roleOptions[0];

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle className="mb-2 text-lg font-semibold">Add User</SheetTitle>
        <SheetDescription>
          Create a new account for a faculty member or technician.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-4 px-4">
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
            className="h-10"
          />
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
                    {roleOptions.map((role) => (
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

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="secondary-text-color flex items-center gap-x-1.5">
            <KeyRound size={14} />
            Password
          </span>
          <Input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            required
            minLength={8}
            disabled={isSubmitting}
            className="h-10"
          />
        </label>
      </div>

      <SheetFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Add User
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
