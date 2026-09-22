import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SummaryCardProps = {
  title: string;
  value: string;
  change: string;
  changeStatus: "good" | "bad" | "neutral";
  caption?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  trend?: {
    value: string;
    label: string;
    direction: "up" | "down" | "flat";
    status: "good" | "bad" | "neutral";
  };
};

const COUNT_ANIMATION_DURATION = 900;

function hasNumber(value: string) {
  return /\d/.test(value);
}

function getAnimatedValue(value: string, progress: number) {
  return value.replace(/\d+/g, (match) => {
    const target = Number(match);

    if (!Number.isFinite(target)) return match;

    return String(Math.round(target * progress));
  });
}

export default function SummaryCard({
  title,
  value,
  change,
  changeStatus,
  caption = "from last month",
  icon: Icon,
  isLoading = false,
  trend,
}: SummaryCardProps) {
  const [animationProgress, setAnimationProgress] = useState(1);
  const shouldAnimateValue = useMemo(() => hasNumber(value), [value]);

  useEffect(() => {
    if (!shouldAnimateValue) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      return;
    }

    let animationFrame = 0;
    let startedAt: number | null = null;

    const animateValue = (time: number) => {
      startedAt ??= time;
      const elapsed = time - startedAt;
      const nextProgress = Math.min(elapsed / COUNT_ANIMATION_DURATION, 1);
      const easedProgress = 1 - Math.pow(1 - nextProgress, 3);

      setAnimationProgress(easedProgress);

      if (nextProgress < 1) {
        animationFrame = requestAnimationFrame(animateValue);
      }
    };

    animationFrame = requestAnimationFrame(animateValue);

    return () => cancelAnimationFrame(animationFrame);
  }, [shouldAnimateValue, value]);

  const displayValue = shouldAnimateValue
    ? getAnimatedValue(value, animationProgress)
    : value;

  const changeColor = {
    good: "text-emerald-500",
    bad: "text-red-500",
    neutral: "text-zinc-500",
  }[changeStatus];

  const trendColor = {
    good: "bg-green-200 text-green-800",
    bad: "bg-red-100 text-red-700",
    neutral: "bg-zinc-100 text-zinc-600",
  }[trend?.status ?? "neutral"];

  const TrendIcon = trend?.direction === "up"
    ? ArrowUp
    : trend?.direction === "down"
      ? ArrowDown
      : Minus;

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
        via-80%
        to-[#bf3419]/5
        px-4 py-5
        sm:px-5 sm:py-6
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-zinc-800 sm:text-base">
            {title}
          </h3>

          {isLoading ? (
            <Skeleton className="mt-2 h-4 w-32" />
          ) : (
            <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
              <span className={`font-medium ${changeColor}`}>
                {change}
              </span>{" "}
              {caption}
            </p>
          )}
        </div>

        <Icon
          aria-hidden="true"
          className="size-5 shrink-0 sm:size-6"
          strokeWidth={1.75}
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </>
        ) : (
          <>
            <h2
              aria-label={value}
              className="wrap-break-word text-2xl font-medium tracking-tight text-zinc-800 sm:text-3xl"
            >
              {displayValue}
            </h2>

            {trend && (
              <div
                className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trendColor}`}
              >
                <TrendIcon aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="shrink-0">{trend.value}</span>
                <span className="truncate font-normal">{trend.label}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
