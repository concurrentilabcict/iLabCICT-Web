import { useAuth } from "@/auth/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import PlaceHolder from "@/assets/profile-placeholder.png"
import { getAppNavIcon } from "@/components/Technician/navigation";
import DesktopNotification from "@/components/Technician/Notification/DesktopNotification";
import { createElement } from "react";

type MobileHeaderProps = {
    title: string;
};

export default function MobileHeader({ title }: MobileHeaderProps) {

    const { profilePicture } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <div className="bg-white flex items-center justify-between p-5 border-b border-b-[#e5e5e5]">
            <div className="flex min-w-0 items-center gap-x-2">
                <div className="primary-bg-color rounded-sm p-2">
                    {createElement(getAppNavIcon(pathname), {
                        size: 18,
                        className: "text-white",
                    })}
                </div>
                <h1 className="truncate text-lg font-medium">{title}</h1>
            </div>

            <div className="flex shrink-0 items-center gap-x-2">
                <DesktopNotification />

                <div className="h-6 w-px bg-gray-300" />

                <button onClick={() => navigate("/profile")} className="cursor-pointer">
                    <img src={profilePicture || PlaceHolder} alt="User Profile" className="h-9 w-9 rounded-full object-cover" />
                </button>
            </div>
        </div>
    );
}
