import { Skeleton } from "@/components/ui/skeleton";

type RequestHistorySkeletonProps = {
  count?: number;
};

export default function RequestHistorySkeleton({
  count = 3,
}: RequestHistorySkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
