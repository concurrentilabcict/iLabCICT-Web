import {
    Bell,
    BookOpen,
    Bot,
    ClipboardList,
    Monitor,
    ScanQrCode,
    ScrollText,
    User,
    type LucideIcon,
} from "lucide-react";

type TechnicianNavItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

export const technicianNavItems: TechnicianNavItem[] = [
    {
        title: "Tickets",
        url: "/manage-ticket",
        icon: ScrollText,
    },
    {
        title: "Laboratory",
        url: "/manage-laboratory",
        icon: Monitor,
    },
    {
        title: "Repair Logs",
        url: "/repair-logs",
        icon: ClipboardList,
    },
    {
        title: "Weekly Reports",
        url: "/weekly-reports",
        icon: BookOpen,
    },
];

const headerOnlyNavItems: TechnicianNavItem[] = [
    {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
    },
    {
        title: "Profile",
        url: "/profile",
        icon: User,
    },
    {
        title: "QR Scanner",
        url: "/qr-scanner",
        icon: ScanQrCode,
    },
    {
        title: "Chatbot",
        url: "/chatbot",
        icon: Bot,
    },
];

export function getTechnicianNavIcon(pathname: string) {
    const navItems = [...technicianNavItems, ...headerOnlyNavItems];
    const activeItem = navItems.find((item) => {
        return pathname === item.url || pathname.startsWith(`${item.url}/`);
    });

    return activeItem?.icon ?? ScrollText;
}
