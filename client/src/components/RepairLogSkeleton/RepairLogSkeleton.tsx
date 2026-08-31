import { Skeleton } from "@/components/ui/skeleton";

type RepairLogSkeletonProps = {
  count?: number;
};

export default function RepairLogSkeleton({
  count = 4,
}: RepairLogSkeletonProps) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className="flex h-full min-h-[330px] w-full max-w-[600px] flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.08)] md:max-w-[550px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="size-16 shrink-0 rounded-3xl" />
      </div>

      <div className="space-y-2 border-l-2 border-muted pl-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, itemIndex) => (
          <div key={itemIndex} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-36 max-w-full" />
          </div>
        ))}
      </div>

      <div className="mt-auto h-px w-full bg-gray-100" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  ));
}
