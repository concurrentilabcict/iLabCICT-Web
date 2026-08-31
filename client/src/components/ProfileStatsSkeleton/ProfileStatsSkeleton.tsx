import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileStatsSkeleton() {
  return (
    <section className="flex flex-col gap-4 px-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="space-y-5 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-8 w-28 rounded-xl" />
            </div>
            <div className="grid h-24 grid-cols-7 items-end gap-2">
              {Array.from({ length: 7 }, (_, barIndex) => (
                <Skeleton
                  key={barIndex}
                  className="w-full rounded-full"
                  style={{ height: `${20 + ((barIndex * 11) % 36)}px` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-5 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-14" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </section>
  );
}
