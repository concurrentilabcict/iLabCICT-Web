import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Image } from "lucide-react";

import placeholderPicture from "@/assets/profile-placeholder.png";
import { useAuth } from "@/auth/useAuth";
import { privateFetch } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import RemoveImageDialog from "./RemoveImageDialog";

type ProfileImageSectionProps = {
    isMobile: boolean;
};

const hasUploadedProfilePicture = (picture: string | null) => {
    if (!picture) return false;

    const normalizedPicture = picture.trim().toLowerCase();

    return normalizedPicture !== "null" && normalizedPicture !== "undefined";
};

export default function ProfileImageSection({ isMobile }: ProfileImageSectionProps) {
    const { role, profilePicture, setProfilePicture } = useAuth();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const userId = localStorage.getItem("id");
    const hasProfilePicture = hasUploadedProfilePicture(profilePicture);
    const displayedProfilePicture = hasProfilePicture ? profilePicture! : placeholderPicture;

    const syncProfilePicture = (profileImage: string | null) => {
        setProfilePicture(profileImage);

        if (profileImage) {
            localStorage.setItem("profilePicture", profileImage);
        } else {
            localStorage.removeItem("profilePicture");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        imageChangeMutation.mutate(file);
    };

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
            syncProfilePicture(data.profile_image);
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
            syncProfilePicture(data.profile_image);
        },

        onError: (err) => {
            console.error(err);

        }
    });

    return (
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
    );
}
