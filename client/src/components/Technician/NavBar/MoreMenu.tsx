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

export default function MoreMenu() {

    const navigate = useNavigate();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex flex-col items-center gap-y-1 cursor-pointer secondary-text-color outline-none"
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

                <DropdownMenuItem onSelect={() => navigate("/weekly-report")}>
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