import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import placeholderPicture from "@/assets/profile-placeholder.png";
import type { User as ManageUser } from "@/types/manageUser";
import { formatDateTime } from "@/utils/string";

type UserDetailsProps = {
  user: ManageUser;
};

const formatLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default function UserDetails({ user }: UserDetailsProps) {
  const name =
    `${user.firstName} ${user.lastName}`.trim() || user.username;
  const displayedProfilePicture = user.profileImage?.trim()
    ? user.profileImage
    : placeholderPicture;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="mb-2 text-lg font-semibold">
          User Details
        </SheetTitle>

        <div className="flex items-center justify-between">
          <SheetDescription>
            {user.userCode}
          </SheetDescription>

          <div
            className={`flex w-fit items-center gap-x-2 rounded-md px-3 py-1.5 ${
              user.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <BadgeCheck size={14} />
            <span className="text-sm">{user.isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 px-4">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/30 p-4">
          <img
            src={displayedProfilePicture}
            alt={name}
            className="h-24 w-24 rounded-full object-cover"
          />

          <div className="text-center">
            <h3 className="text-base font-semibold">{name}</h3>
            <p className="secondary-text-color text-sm">@{user.username}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <IdCard size={14} />
            <h3>User ID</h3>
          </div>
          <span>{user.userCode}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <AtSign size={14} />
            <h3>Email</h3>
          </div>
          <span className="text-right">{user.email}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <ShieldCheck size={14} />
            <h3>Role</h3>
          </div>
          <span>{formatLabel(user.role)}</span>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className="secondary-text-color flex items-center gap-x-1.5 font-medium">
            <CalendarDays size={14} />
            <h3>Created</h3>
          </div>
          <span>{formatDateTime(user.createdAt)}</span>
        </div>
      </div>
    </>
  );
}
