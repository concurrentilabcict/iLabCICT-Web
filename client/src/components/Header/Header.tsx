import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/auth/useAuth";
import PlaceHolder from "@/assets/profile-placeholder.png"
import { useLocation, useNavigate } from "react-router-dom";
import DesktopNotification from "@/components/Technician/Notification/DesktopNotification";
import { getAppNavIcon } from "@/components/Technician/navigation";

type HeaderProps = {
    title: string;
};

export default function Header({ title }: HeaderProps) {
    const { toggleSidebar } = useSidebar();

    const { profilePicture } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const HeaderIcon = getAppNavIcon(pathname);

    return (
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/50 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur-xl supports-backdrop-filter:bg-white/55">
            <div className="flex items-center gap-x-2">
                <button onClick={toggleSidebar} className="cursor-pointer">
                    <Menu size={25} className="hidden md:block lg:hidden mr-2" />
                </button>

                <div className="primary-bg-color rounded-sm p-2">
                    <HeaderIcon size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-medium">{title}</h1>
            </div>

            <div className="flex items-center gap-x-2">
                <DesktopNotification />

                <div className="h-6 w-px bg-gray-300 ml-1 mr-2" />

                <button onClick={() => navigate("/profile")} className="cursor-pointer">
                    <img src={profilePicture || PlaceHolder} alt="User Profile" className="h-9 w-9 rounded-full object-cover" />
                </button>
            </div>
        </div>
    );
}
