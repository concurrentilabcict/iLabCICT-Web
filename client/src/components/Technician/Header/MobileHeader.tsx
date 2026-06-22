import { useAuth } from "@/auth/useAuth";
import { ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PlaceHolder from "@/assets/profile-placeholder.png"

type MobileHeaderProps = {
    title: string;
};

export default function MobileHeader({ title }: MobileHeaderProps) {

    const { profilePicture } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="bg-white flex items-center justify-between p-5 border-b border-b-[#e5e5e5]">
            <div className="flex items-center gap-x-2">
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
