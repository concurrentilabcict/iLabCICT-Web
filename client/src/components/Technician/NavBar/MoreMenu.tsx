import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
    CircleEllipsis,
    Bell,
    FileText
} from "lucide-react";

import { useNavigate } from "react-router-dom";

type MoreMenuProps = {
    isActive?: boolean;
};

export default function MoreMenu({ isActive }: MoreMenuProps) {

    const navigate = useNavigate();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`flex flex-col items-center gap-y-1 cursor-pointer outline-none
                    ${isActive ? "primary-text-color" : "secondary-text-color"}`}
                >
                    <CircleEllipsis size={23} />
                    <span className="text-sm">More</span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-40 rounded-lg"
                side="top"
                align="end"
                sideOffset={20}
            >
                <DropdownMenuItem onSelect={() => navigate("/weekly-reports")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Weekly Report
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => navigate("/notifications")}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
