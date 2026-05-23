import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { EllipsisVertical, LogOut, User } from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function ProfileFooter() {
    const { state } = useSidebar();

    const navigate = useNavigate();

    return (
        <SidebarFooter className="border-t">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="
              flex w-full items-center rounded-lg
              transition-colors hover:bg-muted h-[61px] px-2
            "
                    >
                        <div className="flex items-center gap-3 overflow-hidden w-full">
                            <img
                                src="https://github.com/shadcn.png"
                                alt="Profile"
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                            />

                            {state === "expanded" && (
                                <>
                                    <div className="min-w-0 flex flex-col text-left">
                                        <span className="truncate font-medium">
                                            John Patrick Soriaga
                                        </span>

                                        <span className="truncate text-sm text-muted-foreground">
                                            Technician
                                        </span>
                                    </div>

                                    <EllipsisVertical className="ml-auto h-4 w-4 shrink-0" />
                                </>
                            )}
                        </div>
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-56 rounded-lg"
                    side="top"
                    align="end"
                    sideOffset={20}
                >
                    <DropdownMenuLabel>

                        <div className="flex gap-x-3">
                            <img
                                src="https://github.com/shadcn.png"
                                alt="Profile"
                                className="h-8 w-8 shrink-0 mt-0.5 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-black">John Patrick Soriaga</span>
                                <span className="text-xs text-muted-foreground">
                                    Technician
                                </span>
                            </div>
                        </div>


                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onSelect={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
    );
}