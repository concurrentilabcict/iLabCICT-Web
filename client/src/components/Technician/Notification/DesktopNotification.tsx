
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import MobileNotification from "./MobileNotification";
import { useNotifications } from "./useNotifications";
import NotificationSkeleton from "@/components/NotificationSkeleton/NotificationSkeleton";

export default function DesktopNotification() {
    const { notifications, isLoading, isError } = useNotifications();

    const unreadCount = notifications.filter(
        (notification) => notification.status.toLowerCase() === "unread"
    ).length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="relative"
                    aria-label="Open notifications"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-0 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium leading-none text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full! gap-0 p-0 sm:w-[420px]! sm:max-w-none">
                <SheetHeader className="border-b border-b-[#e5e5e5] px-4 py-4">
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription className="sr-only">
                        View and open your latest notifications.
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {isLoading && (
                        <NotificationSkeleton count={4} />
                    )}

                    {isError && (
                        <p className="px-3 py-4 text-sm text-red-600">
                            Failed to load notifications.
                        </p>
                    )}

                    {!isLoading && !isError && notifications.length === 0 && (
                        <p className="px-3 py-4 text-sm secondary-text-color">
                            No notifications yet.
                        </p>
                    )}

                    {!isLoading && !isError && notifications.length > 0 && (
                        <MobileNotification notifications={notifications} />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
