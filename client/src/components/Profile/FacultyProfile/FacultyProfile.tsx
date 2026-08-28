import {
  Camera,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Image,
  Info,
  LogOut,
  PenLine,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import placeholderPicture from "@/assets/profile-placeholder.png";
import { useAuth } from "@/auth/useAuth";
import { buildApiUrl, createApiError, privateFetch, type ApiError } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type FacultyTicketsPerDay = {
  day: string;
  count: number;
  date: string;
};

type FacultyProfileStatsResponse = {
  id: number;
  stats: {
    tickets_per_day: FacultyTicketsPerDay[];
    tickets_submitted_today: {
      request_tickets: number;
      report_tickets: number;
    };
    total_tickets_today: number;
  };
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(" ").filter(Boolean);

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1).join(" "),
  };
};

const hasUploadedProfilePicture = (picture: string | null) => {
  if (!picture) return false;

  const normalizedPicture = picture.trim().toLowerCase();
  return normalizedPicture !== "null" && normalizedPicture !== "undefined";
};

export default function FacultyProfile() {
  const navigate = useNavigate();
  const { name, role, profilePicture, logout, setName, setProfilePicture } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentName = splitFullName(name);
  const userId = localStorage.getItem("id");
  const email = localStorage.getItem("email") || "";
  const facultyId = Number(userId);
  const hasProfilePicture = hasUploadedProfilePicture(profilePicture);
  const displayedProfilePicture = hasProfilePicture ? profilePicture! : placeholderPicture;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [firstName, setFirstName] = useState(currentName.firstName);
  const [lastName, setLastName] = useState(currentName.lastName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { data: profileStats, isError } = useQuery<FacultyProfileStatsResponse>({
    queryKey: ["faculty-profile-ticket-stats", facultyId],
    enabled: Number.isInteger(facultyId) && facultyId > 0,
    queryFn: async () => {
      const response = await privateFetch(buildApiUrl(`/api/users/${facultyId}/?include=faculty-stats`));
      const data: FacultyProfileStatsResponse & { message?: string } = await response.json();

      if (!response.ok) {
        throw createApiError(response.status, data.message || "Failed to load ticket stats.");
      }

      return data;
    },
  });

  const stats = useMemo(() => {
    const fallbackDays = ["M", "T", "W", "TH", "F", "SA", "SU"].map((label) => ({
      label,
      count: 0,
    }));
    const apiStats = profileStats?.stats;

    return {
      createdByDay: apiStats?.tickets_per_day.map((day) => ({
        label: day.day,
        count: day.count,
      })) ?? fallbackDays,
      todayTotal: apiStats?.total_tickets_today ?? 0,
      reportsToday: apiStats?.tickets_submitted_today.report_tickets ?? 0,
      requestsToday: apiStats?.tickets_submitted_today.request_tickets ?? 0,
    };
  }, [profileStats]);

  const syncProfilePicture = (profileImage: string | null) => {
    setProfilePicture(profileImage);

    if (profileImage) {
      localStorage.setItem("profilePicture", profileImage);
    } else {
      localStorage.removeItem("profilePicture");
    }
  };

  const imageChangeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profile_image", file);

      const response = await privateFetch(buildApiUrl(`/api/users/${userId}/`), {
        method: "PATCH",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(response.status, data.message || "Failed to change profile image.");
      }

      return data as { profile_image: string | null };
    },
    onSuccess: (data) => {
      syncProfilePicture(data.profile_image);
      setIsPhotoMenuOpen(false);
      toast.success("Profile image updated successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.status === 500 ? "Server error. Please try again later." : "Failed to change profile image.");
    },
  });

  const profileSaveMutation = useMutation({
    mutationFn: async () => {
      const response = await privateFetch(buildApiUrl(`/api/users/${userId}/`), {
        method: "PATCH",
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(response.status, data.message || "Failed to update profile.");
      }

      return data as { first_name?: string; last_name?: string; email?: string };
    },
    onSuccess: (data) => {
      const updatedFirstName = data.first_name ?? firstName.trim();
      const updatedLastName = data.last_name ?? lastName.trim();
      const updatedName = `${updatedFirstName} ${updatedLastName}`.trim();

      setFirstName(updatedFirstName);
      setLastName(updatedLastName);
      setName(updatedName);
      localStorage.setItem("name", updatedName);
      setProfileError("");
      setIsProfileOpen(false);
      toast.success("Profile updated successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.status === 500 ? "Server error. Please try again later." : "Failed to update profile.");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await privateFetch(buildApiUrl(`/api/users/reset-password/${userId}/`), {
        method: "PATCH",
        body: JSON.stringify({
          old_password: currentPassword,
          password: newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(response.status, data.message || "Failed to change password.");
      }
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setPasswordError("");
      setIsPasswordOpen(false);
      toast.success("Password updated successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.status === 400 ? "Incorrect current password." : "Failed to change the password.");
    },
  });

  const handleProfileSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setProfileError("First name and last name cannot be empty.");
      return;
    }

    if (firstName.trim() === currentName.firstName && lastName.trim() === currentName.lastName) {
      setProfileError("Please change your name before saving.");
      return;
    }

    profileSaveMutation.mutate();
  };

  const handlePasswordSave = () => {
    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill out both password fields.");
      return;
    }

    changePasswordMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    imageChangeMutation.mutate(file);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 px-3 py-3 pb-28 md:px-5 md:pb-8">
      <section className="relative overflow-hidden rounded-3xl primary-bg-color p-5 text-white shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="absolute -left-12 -top-12 size-40 rounded-full bg-white/10" />
        <div className="absolute right-8 top-8 size-24 rounded-full bg-black/10" />
        <div className="relative flex flex-col items-center text-center">
          <button
            type="button"
            onClick={() => setIsPhotoPreviewOpen(true)}
            onContextMenu={(event) => {
              event.preventDefault();
              setIsPhotoMenuOpen(true);
            }}
            className="group relative cursor-pointer"
          >
            <img
              src={displayedProfilePicture}
              alt="Profile"
              className="size-32 rounded-full border-4 border-white object-cover shadow-[0_12px_26px_rgba(15,23,42,0.20)]"
            />
            <span className="absolute bottom-2 right-2 size-5 rounded-full border-4 border-white bg-emerald-500" />
          </button>
          <button
            type="button"
            onClick={() => setIsPhotoMenuOpen(true)}
            className="mt-3 rounded-full bg-black/25 px-4 py-1.5 text-xs font-medium text-white/90"
          >
            Tap to view photo - hold to change
          </button>
          <h1 className="mt-3 text-xl font-bold">{name}</h1>
          <p className="mt-1 text-sm font-medium text-white/75">{email}</p>
          <p className="mt-2 text-lg font-bold uppercase italic text-white/55">{role}</p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="My Tickets"
          description="Monitor your daily ticket submissions this week."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ActivityCard createdByDay={stats.createdByDay} />
          <OverviewCard
            total={stats.todayTotal}
            reports={stats.reportsToday}
            requests={stats.requestsToday}
          />
        </div>
        {isError && <p className="text-sm text-red-600">Failed to load ticket stats.</p>}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={21} />
            </span>
            <div>
              <h2 className="text-base font-bold">Smooth sailing today!</h2>
              <p className="mt-1 text-sm font-medium leading-relaxed">
                No PC issues or facility requests reported today. Everything seems to be running smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <SectionHeading
            title="Account Information"
            description="Manage and view your personal account details."
          />
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl primary-bg-color px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,0.12)]"
          >
            <PenLine size={16} />
            Update
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoField label="First Name" value={currentName.firstName} />
          <InfoField label="Last Name" value={currentName.lastName} />
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      <section className="space-y-3">
        <SectionHeading
          title="Password & Security"
          description="Manage your password and keep your account secure."
        />
        <button
          type="button"
          onClick={() => setIsPasswordOpen(true)}
          className="h-12 w-full cursor-pointer rounded-xl border border-[#efc8c0] bg-[#fff8f6] text-sm font-semibold text-[#bf3419] transition-colors hover:bg-[#fbf2f0]"
        >
          Change password
        </button>
      </section>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-[520px] rounded-3xl p-0">
          <DialogTitle className="sr-only">Update profile information</DialogTitle>
          <DialogDescription className="sr-only">Manage your personal details.</DialogDescription>
          <ModalHeader icon={UserRound} eyebrow="Account Profile" title="Update Info" description="Manage your personal details" />
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 primary-text-color">
                <PenLine size={18} />
              </span>
              <h3 className="text-base font-bold text-zinc-950">Personal Information</h3>
            </div>
            <TextInput label="First Name" value={firstName} onChange={setFirstName} />
            <TextInput label="Last Name" value={lastName} onChange={setLastName} />
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            <ModalActions
              cancelLabel="Cancel"
              submitLabel="Save Changes"
              isPending={profileSaveMutation.isPending}
              onCancel={() => setIsProfileOpen(false)}
              onSubmit={handleProfileSave}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-[560px] rounded-3xl p-0">
          <DialogTitle className="sr-only">Change password</DialogTitle>
          <DialogDescription className="sr-only">Keep your account secure.</DialogDescription>
          <ModalHeader icon={UserRound} eyebrow="Security Settings" title="Change Password" description="Keep your account secure" />
          <div className="space-y-4 p-6">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-[#bf3419]">
              <div className="flex gap-3">
                <Info size={18} className="mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold">Password Requirements</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium">
                    <li>Must be between 8 and 64 characters.</li>
                    <li>Include uppercase, lowercase, number, and special character.</li>
                  </ul>
                </div>
              </div>
            </div>
            <PasswordInput label="Old Password" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            <ModalActions
              cancelLabel="Cancel"
              submitLabel="Change Password"
              isPending={changePasswordMutation.isPending}
              onCancel={() => setIsPasswordOpen(false)}
              onSubmit={handlePasswordSave}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="max-w-[420px] rounded-3xl p-6">
          <DialogTitle className="text-xl font-bold">Log Out</DialogTitle>
          <DialogDescription className="text-base font-semibold text-zinc-950">
            Are you sure you want to log out?
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsLogoutOpen(false)} className="secondary-button cursor-pointer text-sm font-semibold">
              <X size={16} />
              Cancel
            </button>
            <button type="button" onClick={handleLogout} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhotoMenuOpen} onOpenChange={setIsPhotoMenuOpen}>
        <DialogContent className="max-w-[520px] overflow-hidden rounded-3xl p-0">
          <div className="primary-bg-color p-6 text-white">
            <DialogTitle className="text-xl font-bold">Change Profile Photo</DialogTitle>
            <DialogDescription className="mt-1 text-sm font-medium text-white/80">
              Choose how you would like to update your profile picture.
            </DialogDescription>
          </div>
          <div className="space-y-3 p-6">
            <PhotoAction icon={Camera} title="Take Photo" description="Use your camera to capture a new profile picture." onClick={() => fileInputRef.current?.click()} />
            <PhotoAction icon={Image} title="Choose from Gallery" description="Select an existing photo from your device." onClick={() => fileInputRef.current?.click()} />
            <button type="button" onClick={() => setIsPhotoMenuOpen(false)} className="secondary-button w-full justify-center text-sm font-semibold">
              <X size={16} />
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
        <DialogContent className="max-w-[760px] border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Profile photo preview</DialogTitle>
          <DialogDescription className="sr-only">Preview your profile photo.</DialogDescription>
          <button
            type="button"
            onClick={() => setIsPhotoPreviewOpen(false)}
            className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-black/50 text-white"
          >
            <X size={22} />
          </button>
          <img src={displayedProfilePicture} alt="Profile preview" className="max-h-[80vh] w-full object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-zinc-950">{title}</h2>
      <p className="mt-1 text-sm font-medium text-zinc-500">{description}</p>
    </div>
  );
}

function ActivityCard({ createdByDay }: { createdByDay: Array<{ label: string; count: number }> }) {
  const highestCount = Math.max(1, ...createdByDay.map((day) => day.count));

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Activity</p>
          <h3 className="text-lg font-bold">Last 7 Days</h3>
        </div>
        <div className="rounded-xl bg-gray-100 px-3 py-1 text-xs font-semibold text-zinc-500">Tickets</div>
      </div>
      <div className="mt-5 grid h-24 grid-cols-7 items-end gap-2">
        {createdByDay.map((day) => {
          const barHeight = day.count > 0 ? Math.max(12, Math.round((day.count / highestCount) * 48)) : 4;

          return (
            <div key={day.label} className="flex h-full flex-col items-center justify-end gap-1">
              <span className="text-xs font-semibold text-zinc-500">{day.count}</span>
              <div className="flex h-12 w-full items-end justify-center">
                <div
                  className={`w-7 rounded-full ${day.count > 0 ? "primary-bg-color" : "bg-gray-200"}`}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              <span className="text-xs font-semibold text-zinc-400">{day.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewCard({ total, reports, requests }: { total: number; reports: number; requests: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Overview</p>
          <h3 className="text-lg font-bold">Today</h3>
        </div>
        <div className="rounded-xl bg-[#fbf2f0] p-2.5 text-[#bf3419]">
          <ClipboardList size={20} />
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold secondary-text-color">
        <span className="text-2xl font-bold primary-text-color">{total}</span> tickets submitted
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat icon={Info} label="Report" value={reports} active />
        <MiniStat icon={FileText} label="Request" value={requests} />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, active = false }: { icon: LucideIcon; label: string; value: number; active?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${active ? "primary-bg-color text-white" : "bg-zinc-100 text-zinc-600"}`}>
      <div className="flex items-center justify-between">
        <Icon size={17} />
        <p className="text-xl font-bold">{value}</p>
      </div>
      <p className="mt-1 text-sm font-semibold">{label}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-zinc-600">{label}</p>
      <div className="rounded-2xl bg-white px-4 py-4 text-base font-semibold text-zinc-950 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
        {value || "Not set"}
      </div>
    </div>
  );
}

function ModalHeader({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description: string }) {
  return (
    <div className="flex items-center gap-5 bg-zinc-50 p-6">
      <span className="grid size-20 shrink-0 place-items-center rounded-3xl primary-bg-color text-white">
        <Icon size={38} />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm font-medium text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-zinc-600">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl bg-white px-4 text-sm font-medium shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}

function PasswordInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-semibold text-zinc-600">
        {label}
        <span className="text-zinc-400">{value.length}/64</span>
      </span>
      <div className="relative">
        <input type="password" maxLength={64} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl bg-white px-4 pr-11 text-sm font-medium shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none focus:ring-2 focus:ring-primary/30" />
        <Eye size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
      </div>
    </label>
  );
}

function ModalActions({ cancelLabel, submitLabel, isPending, onCancel, onSubmit }: { cancelLabel: string; submitLabel: string; isPending: boolean; onCancel: () => void; onSubmit: () => void }) {
  return (
    <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
      <button type="button" onClick={onCancel} className="secondary-button cursor-pointer text-sm font-semibold" disabled={isPending}>
        <X size={16} />
        {cancelLabel}
      </button>
      <button type="button" onClick={onSubmit} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-emerald-200" disabled={isPending}>
        {isPending ? <Spinner className="size-4" /> : <Check size={16} />}
        {submitLabel}
      </button>
    </div>
  );
}

function PhotoAction({ icon: Icon, title, description, onClick }: { icon: LucideIcon; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left hover:bg-zinc-50">
      <span className="grid size-14 place-items-center rounded-full bg-[#fbf2f0] primary-text-color">
        <Icon size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-zinc-950">{title}</span>
        <span className="mt-1 block text-sm font-medium text-zinc-500">{description}</span>
      </span>
    </button>
  );
}
