import { Skeleton } from "@/components/ui/skeleton";

type ManageTicketSkeletonProps = { count?: number };

export default function ManageTicketSkeleton({ count = 4 }: ManageTicketSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex w-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-7 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <Skeleton className="mt-1 h-6 w-2/3" />
                    <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {Array.from({ length: 5 }, (_, field) => <Skeleton key={field} className="h-10 rounded-md" />)}
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                        <Skeleton className="h-4 w-36" /><Skeleton className="h-9 w-28 rounded-full" />
                    </div>
                </div>
            ))}
        </>
    );
}
