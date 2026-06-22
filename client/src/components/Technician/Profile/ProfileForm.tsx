import { useMediaQuery } from "@/hooks/useMediaQuery";
import ProfileImageSection from "./ProfileImageSection";
import ProfileNameSection from "./ProfileNameSection";

export default function ProfileForm() {
    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
            <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>My Profile</h1>
            <div className="h-px w-full bg-[#e5e5e5]" />

            <ProfileImageSection isMobile={isMobile} />
            <ProfileNameSection isMobile={isMobile} />
        </div>
    );
}
