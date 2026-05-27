import { useAuth } from "@/auth/useAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { capitalize } from "@/utils/string";
import { EllipsisVertical, LogOut, User } from "lucide-react";
import placeholderPicture from "@/assets/profile-placeholder.png"

import { useNavigate } from "react-router-dom";

export default function ProfileFooter() {
    const { state } = useSidebar();

    const navigate = useNavigate();

    const { role, name, profilePicture } = useAuth();

    return (
        <SidebarFooter className="border-t">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="
    flex w-full items-center rounded-lg
    transition-colors hover:bg-muted
    h-[61px] px-2 overflow-hidden
  "
                    >
                        <div className="flex items-center gap-3 min-w-[32px] w-full">
                            <img
                                src={profilePicture || placeholderPicture}
                                alt="Profile"
                                className="size-8 rounded-full object-cover flex-shrink-0"
                            />

                            {state === "expanded" && (
                                <>
                                    <div className="min-w-0 flex flex-col text-left">
                                        <span className="truncate font-medium">
                                            {name}
                                        </span>

                                        <span className="truncate text-sm text-muted-foreground">
                                            {role}
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
                                src={profilePicture || placeholderPicture}
                                alt="Profile"
                                className="h-8 w-8 shrink-0 mt-0.5 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-black">{name ? capitalize(name) : "No Name"}</span>
                                <span className="text-xs text-muted-foreground">
                                    {role ? capitalize(role) : "No Role"}
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