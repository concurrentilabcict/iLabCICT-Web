import { Skeleton } from "@/components/ui/skeleton";

type MaintenanceHistorySkeletonProps = {
  count?: number;
};

export default function MaintenanceHistorySkeleton({
  count = 5,
}: MaintenanceHistorySkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-start gap-2">
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
