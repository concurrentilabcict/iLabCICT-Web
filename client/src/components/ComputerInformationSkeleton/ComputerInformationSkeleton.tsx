import { Skeleton } from "@/components/ui/skeleton";

export default function ComputerInformationSkeleton() {
    return (
        <div className="space-y-3">
            <div className="rounded-3xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"><Skeleton className="h-[240px] w-full rounded-2xl" /></div>
            <div className="grid items-start gap-3 sm:grid-cols-2">
                <div className="space-y-3 rounded-3xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                    <Skeleton className="h-10 w-52" />
                    {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-16 w-full rounded-2xl" />)}
                </div>
                <div className="space-y-3">
                    <div className="space-y-3 rounded-3xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                        <Skeleton className="h-10 w-48" />
                        {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-20 w-full rounded-xl" />)}
                    </div>
                    <div className="space-y-3 rounded-3xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                        <Skeleton className="h-9 w-44" />
                        <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-14 rounded-xl" />)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
