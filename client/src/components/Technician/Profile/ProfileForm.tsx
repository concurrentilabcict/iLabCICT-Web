import { useAuth } from "@/auth/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { privateFetch } from "@/lib/api";
import placeholderPicture from "@/assets/profile-placeholder.png"

import { Image } from 'lucide-react';
import { useRef } from "react";

export default function ProfileForm() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    const { role, name, profilePicture, setProfilePicture } = useAuth();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const formData = new FormData();

        formData.append("profile_image", file);

        const res = await privateFetch("https://ilabcict-backend.onrender.com/api/users/5/",
            {
                method: "PATCH",
                body: formData,
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.error("failed to upload");
        }

        setProfilePicture(data.profile_image);
        localStorage.setItem("profilePicture", data.profile_image);

        console.log("nigga success");

    };

    const handleImageRemove = async () => {
        const res = await privateFetch("https://ilabcict-backend.onrender.com/api/users/5/",
            {
                method: "PATCH",
                body: JSON.stringify({
                    profile_image: null,
                }),
            }
        );

         const data = await res.json();

        if(!res.ok) {
            console.error("failed remove");
        }

        setProfilePicture(data.profile_image);
        localStorage.setItem("profilePicture", data.profile_image);
        console.log("damn thats my nigga right there");
    }

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
                                className="flex gap-x-1 items-center primary-button">
                                <Image size={14} />
                                Change Image
                            </button>

                            <button onClick={handleImageRemove} className="secondary-button">
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

                <div className={`flex mb-5 gap-x-2 ${isMobile ? "px-3" : ""}`}>
                    <div className="flex flex-col gap-y-1 w-full">
                        <span className="font-medium">First Name</span>
                        <input type="text" value="dsadsa" className="primary-input" />
                    </div>

                    <div className="flex flex-col gap-y-1 w-full">
                        <span className="font-medium">Last Name</span>
                        <input type="text" value="dsadsa" className="primary-input" />
                    </div>
                </div>
            </div>
        </>
    );
}