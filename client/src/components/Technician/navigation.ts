import {
    Bell,
    BookOpen,
    Bot,
    ClipboardList,
    FileChartColumn,
    CircleHelp,
    LayoutDashboard,
    Monitor,
    ScanQrCode,
    ScrollText,
    User,
    Wrench,
    type LucideIcon,
} from "lucide-react";

type NavItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

export const technicianNavItems: NavItem[] = [
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

export const facultyNavItems: NavItem[] = [
    {
        title: "Manage Tickets",
        url: "/manage-ticket",
        icon: ScrollText,
    },
    {
        title: "Laboratory",
        url: "/manage-laboratory",
        icon: Monitor,
    },
    {
        title: "FAQ",
        url: "/faq",
        icon: CircleHelp,
    },
    {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
    },
    {
        title: "QR Code",
        url: "/qr-scanner",
        icon: ScanQrCode,
    },
];

export const adminNavItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Ticket Management",
        url: "/manage-ticket",
        icon: ScrollText,
    },
    {
        title: "Laboratory Management",
        url: "/manage-laboratory",
        icon: Monitor,
    },
    {
        title: "User Management",
        url: "/manage-user",
        icon: ClipboardList,
    },
    {
        title: "Technician Reports",
        url: "/weekly-reports",
        icon: FileChartColumn,
    },
    {
        title: "Repair Logs",
        url: "/repair-logs",
        icon: Wrench,
    },
]

const headerOnlyNavItems: NavItem[] = [
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

export function getAppNavIcon(pathname: string) {
    const navItems = [
        ...technicianNavItems,
        ...facultyNavItems,
        ...adminNavItems,
        ...headerOnlyNavItems,
    ];
    const activeItem = navItems.find((item) => {
        return pathname === item.url || pathname.startsWith(`${item.url}/`);
    });

    return activeItem?.icon ?? ScrollText;
}

export const getTechnicianNavIcon = getAppNavIcon;
