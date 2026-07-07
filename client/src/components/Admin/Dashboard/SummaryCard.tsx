import type { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: string;
  change: string;
  changeStatus: "good" | "bad" | "neutral";
  caption?: string;
  icon: LucideIcon;
};

export default function SummaryCard({
  title,
  value,
  change,
  changeStatus,
  caption = "from last month",
  icon: Icon,
}: SummaryCardProps) {
  const changeColor = {
    good: "text-emerald-500",
    bad: "text-red-500",
    neutral: "text-zinc-500",
  }[changeStatus];

  return (
    <div
      className="
        min-w-0
        w-full
        h-[174px]
        flex
        flex-col
        justify-between
        rounded-2xl
        border
        border-gray-200
        bg-linear-to-b
        from-white
        via-[#bf3419]/5
        via-50%
        to-[#bf3419]/10
        px-4 py-5
        sm:px-5 sm:py-6
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-zinc-800 sm:text-base">
            {title}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
            <span className={`font-medium ${changeColor}`}>
              {change}
            </span>{" "}
            {caption}
          </p>
        </div>

        <Icon
          aria-hidden="true"
          className="size-5 shrink-0 sm:size-6"
          strokeWidth={1.75}
        />
      </div>

      <h2 className="wrap-break-word text-2xl font-medium tracking-tight text-zinc-800 sm:text-3xl">
        {value}
      </h2>
    </div>
  );
}
