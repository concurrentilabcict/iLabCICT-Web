import { useAuth } from "@/auth/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { privateFetch } from "@/lib/api";
import placeholderPicture from "@/assets/profile-placeholder.png"

import { Image } from 'lucide-react';
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

const splitFullName = (fullName: string) => {
    const parts = fullName.trim().split(" ").filter(Boolean);

    return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts.slice(-1).join(" "),
    };
};

export default function ProfileForm() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    const { role, name, profilePicture, setName, setProfilePicture } = useAuth();

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const initialName = splitFullName(name);
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(initialName.firstName);
    const [lastName, setLastName] = useState(initialName.lastName);
    const [isSaving, setIsSaving] = useState(false);

    const userId = localStorage.getItem("id");

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
            localStorage.setItem("profilePicture", data.profile_image);
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
            localStorage.setItem("profilePicture", data.profile_image);
        },

        onError: (err) => {
            console.error(err);

        }
    });

    const handleCancelEdit = () => {
        const currentName = splitFullName(name);

        setFirstName(currentName.firstName);
        setLastName(currentName.lastName);
        setIsEditing(false);
    };

    const handleProfileSave = async () => {
        try {
            setIsSaving(true);

            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/users/${userId}/`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error("failed to update profile");
                return;
            }

            const updatedFirstName = data.first_name ?? firstName.trim();
            const updatedLastName = data.last_name ?? lastName.trim();
            const updatedName = `${updatedFirstName} ${updatedLastName}`.trim();

            setFirstName(updatedFirstName);
            setLastName(updatedLastName);
            setName(updatedName);
            localStorage.setItem("name", updatedName);
            setIsEditing(false);
        } catch (err) {
            console.error("Error occurred while updating profile:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>My Profile</h1>
                <div className="h-px w-full bg-[#e5e5e5]" />

                <div className={`flex items-start gap-x-4 ${isMobile ? "px-3" : ""}`}>
                    <img src={profilePicture || placeholderPicture} alt="" className="w-15 h-15 sm:w-20 sm:h-20 lg:w-25 lg:h-25 rounded-full" />

                    <div className="flex flex-col gap-y-2">
                        <div className="flex text-sm gap-x-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer flex gap-x-1 items-center primary-button">
                                <Image size={14} />
                                Change Image
                            </button>

                            <button onClick={() => imageRemoveMutation.mutate()} className=" cursor-pointer secondary-button">
                                Remove Image
                            </button>

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
                                onChange={(e) => setFirstName(e.target.value)}
                                className={isEditing ? "primary-input" : "disable-input max-w-[500px]"}
                            />
                        </div>

                        <div className="flex flex-col gap-y-1 w-full">
                            <span className="font-medium">Last Name</span>
                            <input
                                type="text"
                                value={lastName}
                                disabled={!isEditing}
                                onChange={(e) => setLastName(e.target.value)}
                                className={isEditing ? "primary-input" : "disable-input max-w-[500px]"}
                            />
                        </div>
                    </div>

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
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProfileSave}
                                    className="primary-button cursor-pointer text-sm font-medium"
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
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
