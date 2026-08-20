import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileNotification from "./MobileNotification";
import { useNotifications } from "./useNotifications";

export default function Notification() {
    const isMobile = useMediaQuery("(max-width: 767px)");
    const { notifications, isLoading, isError } = useNotifications();

    if (isLoading) {
        return (
            <div className="flex flex-col py-3 gap-y-3">
                <p className="px-3 text-sm secondary-text-color">Loading notifications...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col py-3 gap-y-3">
                <p className="px-3 text-sm text-red-600">Failed to load notifications.</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col py-3 gap-y-3">
                <p className="px-3 text-sm secondary-text-color">No notifications yet.</p>
            </div>
        );
    }

    return (
        <>
            {isMobile ? <MobileNotification notifications={notifications} /> : null}
        </>
    );
}
