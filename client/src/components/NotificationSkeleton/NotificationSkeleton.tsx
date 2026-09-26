import { Skeleton } from "@/components/ui/skeleton";

type NotificationSkeletonProps = { count?: number };

export default function NotificationSkeleton({ count = 5 }: NotificationSkeletonProps) {
    return (
        <div className="px-4 py-3">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                    <Skeleton className="size-12 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-14" /></div>
                </div>
            ))}
        </div>
    );
}
