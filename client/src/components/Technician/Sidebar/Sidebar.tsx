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
    useSidebar,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";

import { NavLink, useLocation } from "react-router-dom";

import Logo from "@/assets/logo.png";
import ProfileFooter from "./ProfileFooter";
import { technicianNavItems } from "../navigation";

export default function Sidebar() {
    const { state } = useSidebar();
    const location = useLocation();

    return (
        <ShadSidebar collapsible="icon" className="flex">
            <SidebarHeader className="py-3 pl-3">
                <div className="flex items-center justify-between w-full">
                    <div
                        className={`
        relative flex w-8 items-center justify-center
        ${state === "collapsed" ? "group/logo" : ""}
      `}
                    >
                        <img
                            src={Logo}
                            alt="Logo"
                            className={`
          h-auto w-6 transition-opacity ml-1
          ${state === "collapsed"
                                    ? "group-hover/logo:opacity-0"
                                    : ""
                                }
        `}
                        />

                        {state === "collapsed" && (
                            <SidebarTrigger
                                className="
            absolute opacity-0 transition-opacity
            group-hover/logo:opacity-100
          "
                            />
                        )}
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
                            {technicianNavItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url || location.pathname.startsWith(`${item.url}/`)}
                                        className="
                                        py-5
                                        mb-1
                                        ml-1
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

            <ProfileFooter />
        </ShadSidebar>
    );
}
