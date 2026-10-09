import { Skeleton } from "@/components/ui/skeleton";

type ComputerListSkeletonProps = { count?: number };

export default function ComputerListSkeleton({ count = 4 }: ComputerListSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex w-full flex-col gap-3 rounded-2xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3"><Skeleton className="size-10 rounded-xl" /><Skeleton className="h-6 w-32" /></div>
                        <Skeleton className="h-8 w-20 rounded-full" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, field) => <Skeleton key={field} className="h-14 rounded-xl" />)}</div>
                    <Skeleton className="h-9 rounded-xl sm:w-44 sm:self-end" />
                </div>
            ))}
        </>
    );
}
