import { Skeleton } from "@/components/ui/skeleton";

type ComputerListSkeletonProps = { count?: number };

export default function ComputerListSkeleton({ count = 4 }: ComputerListSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex min-h-[300px] w-full max-w-[600px] flex-col gap-3 rounded-2xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:max-w-[550px]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3"><Skeleton className="size-10 rounded-xl" /><Skeleton className="h-6 w-32" /></div>
                        <Skeleton className="h-8 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="mt-auto h-9 rounded-xl" />
                </div>
            ))}
        </>
    );
}
