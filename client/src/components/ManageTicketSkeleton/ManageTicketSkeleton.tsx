import { Skeleton } from "@/components/ui/skeleton";

type ManageTicketSkeletonProps = { count?: number };

export default function ManageTicketSkeleton({ count = 4 }: ManageTicketSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex min-h-[430px] w-full max-w-[600px] flex-col gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:max-w-[550px]">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-7 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <Skeleton className="mt-1 h-6 w-2/3" />
                    <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div>
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <div className="grid grid-cols-2 gap-3"><Skeleton className="h-14 rounded-2xl" /><Skeleton className="h-14 rounded-2xl" /></div>
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                        <Skeleton className="h-4 w-36" /><Skeleton className="h-9 w-28 rounded-full" />
                    </div>
                </div>
            ))}
        </>
    );
}
