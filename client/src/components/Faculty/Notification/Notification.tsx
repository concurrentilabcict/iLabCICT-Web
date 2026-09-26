import { useNotifications } from "@/components/Technician/Notification/useNotifications";
import MobileNotification from "@/components/Technician/Notification/MobileNotification";
import NotificationSkeleton from "@/components/NotificationSkeleton/NotificationSkeleton";

export default function Notification() {
  const { notifications, isLoading, isError } = useNotifications();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[900px] md:px-3">
        <NotificationSkeleton />
      </div>
    );
  }

  if (isError) {
    return <NotificationMessage message="Failed to load notifications." isError />;
  }

  return (
    <section className="mx-auto w-full max-w-[900px] px-3 py-4 md:px-6 md:py-6">
      <MobileNotification notifications={notifications} />
    </section>
  );
}

function NotificationMessage({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[900px] px-3 py-5 md:px-6">
      <p className={`text-sm ${isError ? "text-red-600" : "secondary-text-color"}`}>
        {message}
      </p>
    </div>
  );
}
