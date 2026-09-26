import { Bell } from "lucide-react";
import { useState } from "react";
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
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, isLoading, isError } = useNotifications();

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
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

            <SheetContent
                side="right"
                className="w-full! gap-0 overflow-hidden p-0 sm:w-[440px]! sm:max-w-none"
            >
                <SheetHeader className="bg-white px-5 pb-2 pt-5 pr-14">
                    <SheetTitle className="text-2xl font-bold tracking-normal text-zinc-950">
                        Notifications
                    </SheetTitle>
                    <SheetDescription className="mt-0.5 text-sm text-zinc-500">
                        {unreadCount > 0
                            ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
                            : "You're all caught up"}
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto bg-white">
                    {isLoading && (
                        <NotificationSkeleton count={4} />
                    )}

                    {isError && (
                        <p className="px-5 py-6 text-sm text-red-600">
                            Failed to load notifications.
                        </p>
                    )}

                    {!isLoading && !isError && notifications.length === 0 && (
                        <p className="px-5 py-6 text-sm secondary-text-color">
                            No notifications yet.
                        </p>
                    )}

                    {!isLoading && !isError && notifications.length > 0 && (
                        <MobileNotification
                            notifications={notifications}
                            onNotificationOpen={() => setIsOpen(false)}
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
