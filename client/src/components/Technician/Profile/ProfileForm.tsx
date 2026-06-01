import { useAuth } from "@/auth/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { privateFetch } from "@/lib/api";
import placeholderPicture from "@/assets/profile-placeholder.png"

import { Image } from 'lucide-react';
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Spinner } from "@/components/ui/spinner"
import RemoveImageDialog from "./RemoveImageDialog";
import SaveProfileDialog from "./SaveProfileDialog";

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

export default function ProfileForm() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    const { role, name, profilePicture, setName, setProfilePicture } = useAuth();

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const initialName = splitFullName(name);
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(initialName.firstName);
    const [lastName, setLastName] = useState(initialName.lastName);
    const [profileError, setProfileError] = useState("");

    const userId = localStorage.getItem("id");
    const currentName = splitFullName(name);
    const isFirstNameEmpty = Boolean(profileError) && !firstName.trim();
    const isLastNameEmpty = Boolean(profileError) && !lastName.trim();
    const isNameUnchanged = firstName.trim() === currentName.firstName && lastName.trim() === currentName.lastName;
    const hasProfilePicture = hasUploadedProfilePicture(profilePicture);
    const displayedProfilePicture = hasProfilePicture ? profilePicture! : placeholderPicture;
    const firstNameInputClass = isEditing
        ? `primary-input ${isFirstNameEmpty || (profileError && isNameUnchanged) ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input max-w-[500px]";
    const lastNameInputClass = isEditing
        ? `primary-input ${isLastNameEmpty || (profileError && isNameUnchanged) ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input max-w-[500px]";

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        imageChangeMutation.mutate(file);
    }

    const imageChangeMutation = useMutation({
        mutationFn: async (file: File) => {

            const formData = new FormData();

            formData.append("profile_image", file);

            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/users/${userId}/`, {
                method: "PATCH",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to change profile");
            }

            return data;
        },

        onSuccess: (data) => {
            setProfilePicture(data.profile_image);
            if (data.profile_image) {
                localStorage.setItem("profilePicture", data.profile_image);
            } else {
                localStorage.removeItem("profilePicture");
            }
        },

        onError: (err) => {
            console.error(err);

        }
    });

    const imageRemoveMutation = useMutation({
        mutationFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/users/${userId}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    profile_image: null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to remove profile");
            }

            return data;
        },

        onSuccess: (data) => {
            setProfilePicture(data.profile_image);
            if (data.profile_image) {
                localStorage.setItem("profilePicture", data.profile_image);
            } else {
                localStorage.removeItem("profilePicture");
            }
        },

        onError: (err) => {
            console.error(err);

        }
    });

    const handleCancelEdit = () => {
        const currentName = splitFullName(name);

        setFirstName(currentName.firstName);
        setLastName(currentName.lastName);
        setProfileError("");
        setIsEditing(false);
    };

    const validateProfileChanges = () => {
        if (!firstName.trim() || !lastName.trim()) {
            setProfileError("First name and last name cannot be empty.");
            return false;
        }

        if (isNameUnchanged) {
            setProfileError("Please change your first name or last name before saving.");
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
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to change name");
            }

            return data;
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
            setIsEditing(false);
        },

        onError: (err) => {
            console.error(err);
        }
    });


    return (
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>My Profile</h1>
                <div className="h-px w-full bg-[#e5e5e5]" />

                <div className={`flex items-start gap-x-4 ${isMobile ? "px-3" : ""}`}>
                    <img src={displayedProfilePicture} alt="" className="w-15 h-15 sm:w-20 sm:h-20 lg:w-25 lg:h-25 rounded-full" />

                    <div className="flex flex-col gap-y-2">
                        <div className="flex text-sm gap-x-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer flex gap-x-1 items-center primary-button">
                                {!imageChangeMutation.isPending ? <><Image size={14} /> <span>Change Image</span></>
                                    : <><Spinner className="size-5" /> <span>Uploading...</span></>}

                            </button>

                            <RemoveImageDialog onRemove={() => imageRemoveMutation.mutate()}
                                isPending={imageRemoveMutation.isPending}
                                disabled={!hasProfilePicture} />

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />

                        </div>

                        <p className="secondary-text-color text-xs">We support PNGs, JPEGs, and WEBP</p>
                        <span className="text-sm md:text-base leading-none font-medium">{role}</span>
                    </div>
                </div>

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
                                aria-invalid={isFirstNameEmpty || Boolean(profileError && isNameUnchanged)}
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
                                aria-invalid={isLastNameEmpty || Boolean(profileError && isNameUnchanged)}
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
                            <input type="text" className="disable-input mb-1.5 w-full" placeholder="patricksoriaga14@gmail.com" />
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
            </div>
        </>
    );
}
