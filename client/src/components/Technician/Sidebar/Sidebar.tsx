import {
    Sidebar as ShadSidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    SidebarFooter,
    useSidebar,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { EllipsisVertical, ScrollText, Monitor, ClipboardList, BookOpen } from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

import Logo from "@/assets/logo.png";

const items = [
    {
        title: "Tickets",
        url: "/manage-ticket",
        icon: ScrollText,
    },
    {
        title: "Laboratory",
        url: "/laboratory",
        icon: Monitor,
    },
    {
        title: "Repairs",
        url: "/repairs",
        icon: ClipboardList,
    },
    {
        title: "Weekly Reports",
        url: "/weekly-reports",
        icon: BookOpen,
    },
];

export default function Sidebar() {
    const { state } = useSidebar();
    const location = useLocation();

    return (
        <ShadSidebar collapsible="icon">
            <SidebarHeader className="py-3 pl-3">
                <div className="flex items-center justify-between w-full">
                    <div className="group/logo relative flex w-8 items-center justify-center">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="
          h-auto w-6
          transition-opacity
          group-hover/logo:opacity-0
        "
                        />

                        <SidebarTrigger
                            className="
          absolute
          opacity-0
          transition-opacity
          group-hover/logo:opacity-100
        "
                        />
                    </div>

                    {state === "expanded" && <SidebarTrigger />}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url}
                                        className="
                                        py-5
                                        mb-1
                                        transition-colors
                                        data-[active=true]:bg-muted
                                        data-[active=true]:text-foreground
                                        "
                                    >
                                        <NavLink to={item.url}>
                                            <item.icon className="h-5 w-5" />
                                            <span className="font-medium">{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t">
                <button
                    className="
      flex w-full items-center rounded-lg
      transition-colors hover:bg-muted h-[61px]
    "
                >
                    <div className="flex items-center gap-3 overflow-hidden">
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
            </SidebarFooter>
        </ShadSidebar>
    );
}
