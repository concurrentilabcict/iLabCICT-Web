import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/auth/useAuth";
import { createApiError, privateFetch, type ApiError } from "@/lib/api";
import SaveProfileDialog from "./SaveProfileDialog";
import toast from "react-hot-toast";

type ProfileNameSectionProps = {
    isMobile: boolean;
};

const splitFullName = (fullName: string) => {
    const parts = fullName.trim().split(" ").filter(Boolean);

    return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts.slice(-1).join(" "),
    };
};

export default function ProfileNameSection({ isMobile }: ProfileNameSectionProps) {
    const { name, setName } = useAuth();
    const initialName = splitFullName(name);
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(initialName.firstName);
    const [lastName, setLastName] = useState(initialName.lastName);
    const [email, setEmail] = useState(localStorage.getItem("email") || "");
    const [profileError, setProfileError] = useState("");

    const userId = localStorage.getItem("id");
    const currentName = splitFullName(name);
    const isFirstNameEmpty = Boolean(profileError) && !firstName.trim();
    const isLastNameEmpty = Boolean(profileError) && !lastName.trim();
    const isEmailEmpty = Boolean(profileError) && !email.trim();
    const isProfileUnchanged =
        firstName.trim() === currentName.firstName &&
        lastName.trim() === currentName.lastName &&
        email.trim() === (localStorage.getItem("email") || "");
    const firstNameInputClass = isEditing
        ? `primary-input ${isFirstNameEmpty || (profileError && isProfileUnchanged) ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input max-w-[500px]";
    const lastNameInputClass = isEditing
        ? `primary-input ${isLastNameEmpty || (profileError && isProfileUnchanged) ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input max-w-[500px]";
    const emailInputClass = isEditing
        ? `primary-input max-w-full! mb-1.5 ${isEmailEmpty || (profileError && isProfileUnchanged) ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input mb-1.5 w-full";

    const handleCancelEdit = () => {
        const currentName = splitFullName(name);

        setFirstName(currentName.firstName);
        setLastName(currentName.lastName);
        setEmail(localStorage.getItem("email") || "");
        setProfileError("");
        setIsEditing(false);
    };

    const validateProfileChanges = () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setProfileError("First name, last name, and email cannot be empty.");
            return false;
        }

        if (isProfileUnchanged) {
            setProfileError("Please change your name or email before saving.");
            return false;
        }

        setProfileError("");
        return true;
    };

    const handleSaveProfile = () => {
        if (!validateProfileChanges()) {
            return;
        }

        profileSaveMutation.mutate();
    };

    const profileSaveMutation = useMutation({
        mutationFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/users/${userId}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(
                    res.status,
                    data.message || "Failed to change name"
                );
            }

            return data;
        },

        onSuccess: (data) => {
            const updatedFirstName = data.first_name ?? firstName.trim();
            const updatedLastName = data.last_name ?? lastName.trim();
            const updatedEmail = data.email ?? email.trim();
            const updatedName = `${updatedFirstName} ${updatedLastName}`.trim();

            setFirstName(updatedFirstName);
            setLastName(updatedLastName);
            setEmail(updatedEmail);
            setName(updatedName);
            localStorage.setItem("name", updatedName);
            localStorage.setItem("email", updatedEmail);
            setProfileError("");
            setIsEditing(false);

            toast.success("Profile updated successfully.");
        },

        onError: (error: ApiError) => {
            if (error.status === 500) {
                toast.error("Server error. Please try again later.");
                return;
            }

            toast.error("Failed to update profile.");
        }
    });

    return (
        <div className={`flex mb-5 flex-col gap-y-4 ${isMobile ? "px-3" : ""}`}>
            <div className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-2">
                <div className="flex flex-col gap-y-1 w-full">
                    <span className="font-medium">First Name</span>
                    <input
                        type="text"
                        value={firstName}
                        disabled={!isEditing}
                        onChange={(e) => { setFirstName(e.target.value); setProfileError("") }}
                        className={firstNameInputClass}
                        aria-invalid={isFirstNameEmpty || Boolean(profileError && isProfileUnchanged)}
                    />
                </div>

                <div className="flex flex-col gap-y-1 w-full">
                    <span className="font-medium">Last Name</span>
                    <input
                        type="text"
                        value={lastName}
                        disabled={!isEditing}
                        onChange={(e) => { setLastName(e.target.value); setProfileError("") }}
                        className={lastNameInputClass}
                        aria-invalid={isLastNameEmpty || Boolean(profileError && isProfileUnchanged)}
                    />
                </div>
            </div>

            {profileError && (
                <p className="text-sm text-red-600">
                    {profileError}
                </p>
            )}

            <div className="flex flex-col gap-y-1">
                <span className="font-medium">Email</span>
                <div className="flex sm:justify-between sm:items-center flex-col gap-y-1 sm:flex-row sm:gap-x-3">
                    <input
                        type="email"
                        value={email}
                        disabled={!isEditing}
                        onChange={(e) => { setEmail(e.target.value); setProfileError("") }}
                        className={emailInputClass}
                        aria-invalid={isEmailEmpty || Boolean(profileError && isProfileUnchanged)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-x-2">
                {isEditing ? (
                    <>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="secondary-button cursor-pointer text-sm font-medium"
                            disabled={profileSaveMutation.isPending}
                        >
                            Cancel
                        </button>
                        <SaveProfileDialog
                            onSave={handleSaveProfile}
                            onBeforeOpen={validateProfileChanges}
                            isPending={profileSaveMutation.isPending}
                        />
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="secondary-button cursor-pointer text-sm font-medium"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
}
