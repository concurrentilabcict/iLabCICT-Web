import { Skeleton } from "@/components/ui/skeleton";

type LaboratorySkeletonProps = { count?: number };

export default function LaboratorySkeleton({ count = 4 }: LaboratorySkeletonProps) {
    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex min-h-[360px] w-full max-w-[600px] flex-col gap-3 rounded-2xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:max-w-[550px]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3"><Skeleton className="size-10 rounded-xl" /><Skeleton className="h-6 w-24" /></div>
                        <Skeleton className="h-8 w-28 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div>
                    <Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="mt-auto h-9 rounded-xl" />
                </div>
            ))}
        </>
    );
}
