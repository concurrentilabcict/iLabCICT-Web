import { Menu, ScrollText } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/auth/useAuth";
import PlaceHolder from "@/assets/profile-placeholder.png"
import { useNavigate } from "react-router-dom";

type HeaderProps = {
    title: string;
};

export default function Header({ title }: HeaderProps) {
    const { toggleSidebar } = useSidebar();

    const { profilePicture } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="bg-white flex items-center justify-between p-5 border-b border-b-[#e5e5e5]">
            <div className="flex items-center gap-x-2">
                <button onClick={toggleSidebar} className="cursor-pointer">
                    <Menu size={25} className="hidden md:block lg:hidden mr-2" />
                </button>

                <div className="primary-bg-color rounded-sm p-2">
                    <ScrollText size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-medium">{title}</h1>
            </div>

            <button onClick={() => navigate("/profile")} className="cursor-pointer">
                <img src={profilePicture || PlaceHolder} alt="User Profile" className="h-9 w-9 rounded-full object-cover" />
            </button>
        </div>
    );
}
