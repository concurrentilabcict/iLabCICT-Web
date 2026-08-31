import { Skeleton } from "@/components/ui/skeleton";

type WeeklyReportSkeletonProps = { count?: number };

export default function WeeklyReportSkeleton({ count = 4 }: WeeklyReportSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex min-h-[430px] w-full max-w-[600px] flex-col gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:max-w-[550px]">
                    <div className="flex items-center justify-between"><Skeleton className="h-7 w-28 rounded-lg" /><Skeleton className="h-8 w-20 rounded-full" /></div>
                    <Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-28" />
                    <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div>
                    <Skeleton className="h-16 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-3"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-16 rounded-2xl" /></div>
                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4"><Skeleton className="h-4 w-32" /><Skeleton className="size-9 rounded-full" /></div>
                </div>
            ))}
        </>
    );
}
