import { useMediaQuery } from "@/hooks/useMediaQuery";
import ProfileImageSection from "./ProfileImageSection";
import ProfileNameSection from "./ProfileNameSection";

export default function ProfileForm() {
    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <div className={`${isMobile ? "px-3" : "px-3"}`}>
            <div className="flex flex-col gap-y-5 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <h1 className="text-lg font-semibold">My Profile</h1>
            <div className="h-px w-full bg-[#e5e5e5]" />

            <ProfileImageSection isMobile={false} />
            <ProfileNameSection isMobile={false} />
            </div>
        </div>
    );
}
