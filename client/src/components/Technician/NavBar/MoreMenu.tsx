import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
    CircleEllipsis,
    Bell,
    FileText,
    LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

type MoreMenuProps = {
    isActive?: boolean;
    showWeeklyReport?: boolean;
};

export default function MoreMenu({ isActive, showWeeklyReport = true }: MoreMenuProps) {

    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`relative z-10 flex h-16 w-full min-w-0 max-w-full cursor-pointer flex-col items-center justify-end gap-y-1 rounded-2xl px-0.5 text-center outline-none transition min-[360px]:px-1
                    ${isActive ? "primary-text-color" : "secondary-text-color"}`}
                >
                    <CircleEllipsis size={23} />
                    <span className="text-[11px] min-[360px]:text-sm">More</span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-40 rounded-2xl"
                side="top"
                align="end"
                sideOffset={20}
            >
                {showWeeklyReport && (
                    <DropdownMenuItem onSelect={() => navigate("/weekly-reports")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Weekly Report
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onSelect={() => navigate("/notifications")}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                </DropdownMenuItem>

                <DropdownMenuItem
                    onSelect={logout}
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
