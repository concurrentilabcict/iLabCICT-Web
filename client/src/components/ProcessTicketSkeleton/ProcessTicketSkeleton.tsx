import { Skeleton } from "@/components/ui/skeleton";

export default function ProcessTicketSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-3 py-4 pb-24 md:px-5 md:pb-8">
      <div className="flex gap-2">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="space-y-4 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
              >
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] lg:self-start">
          <div className="flex gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-44 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
