import { Skeleton } from "@/components/ui/skeleton";

type NotificationSkeletonProps = { count?: number };

export default function NotificationSkeleton({ count = 5 }: NotificationSkeletonProps) {
    return (
        <div className="flex flex-col gap-3 px-3 py-3">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl bg-white px-4 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-4/5" /><Skeleton className="mt-3 h-4 w-36" /></div>
                </div>
            ))}
        </div>
    );
}
