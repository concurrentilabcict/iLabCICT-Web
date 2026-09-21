import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ticket } from "@/types/ticket";

type Range = "90d" | "30d" | "7d";

type ChartTicket = Pick<
  Ticket,
  "id" | "status" | "createdAt" | "updatedAt"
>;

type TicketChartData = {
  label: string;
  created: number;
  resolved: number;
};

type RangeOption = {
  label: string;
  value: Range;
  days: number;
  bucketDays: number;
};

const rangeOptions: RangeOption[] = [
  { label: "Last 3 months", value: "90d", days: 90, bucketDays: 14 },
  { label: "Last 30 days", value: "30d", days: 30, bucketDays: 5 },
  { label: "Last 7 days", value: "7d", days: 7, bucketDays: 1 },
];

const chartConfig = {
  created: {
    label: "Created",
    color: "#bf3419",
  },
  resolved: {
    label: "Resolved",
    color: "#7f2413",
  },
} satisfies ChartConfig;

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

const formatBucketLabel = (start: Date, end: Date) => {
  if (start.getTime() === end.getTime()) {
    return formatShortDate(start);
  }

  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = formatShortDate(start);
  const endLabel = sameMonth ? String(end.getDate()) : formatShortDate(end);

  return `${startLabel}-${endLabel}`;
};

const buildChartData = (
  tickets: ChartTicket[],
  rangeOption: RangeOption
): TicketChartData[] => {
  const today = startOfDay(new Date());
  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - (rangeOption.days - 1));

  const buckets: Array<{
    start: Date;
    end: Date;
    data: TicketChartData;
  }> = [];

  for (
    let offset = 0;
    offset < rangeOption.days;
    offset += rangeOption.bucketDays
  ) {
    const start = new Date(rangeStart);
    start.setDate(rangeStart.getDate() + offset);
    const remainingDays = rangeOption.days - offset;
    const end = new Date(start);
    end.setDate(
      start.getDate() + Math.min(rangeOption.bucketDays, remainingDays) - 1
    );

    buckets.push({
      start,
      end,
      data: {
        label: formatBucketLabel(start, end),
        created: 0,
        resolved: 0,
      },
    });
  }

  const findBucket = (value: string) => {
    const date = startOfDay(new Date(value));

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return buckets.find(
      (bucket) => date >= bucket.start && date <= bucket.end
    );
  };

  tickets.forEach((ticket) => {
    const createdBucket = findBucket(ticket.createdAt);
    if (createdBucket) {
      createdBucket.data.created += 1;
    }

    if (ticket.status.trim().toLowerCase() === "resolved") {
      const resolvedBucket = findBucket(ticket.updatedAt);
      if (resolvedBucket) {
        resolvedBucket.data.resolved += 1;
      }
    }
  });

  return buckets.map((bucket) => bucket.data);
};

type TicketChartProps = {
  tickets: ChartTicket[];
  isLoading: boolean;
  isError: boolean;
};

export default function TicketChart({
  tickets,
  isLoading,
  isError,
}: TicketChartProps) {
  const [range, setRange] = useState<Range>("90d");
  const selectedRange =
    rangeOptions.find((option) => option.value === range) ?? rangeOptions[0];
  const chartData = useMemo(
    () => buildChartData(tickets, selectedRange),
    [selectedRange, tickets]
  );
  const totals = useMemo(
    () =>
      chartData.reduce(
        (result, item) => ({
          created: result.created + item.created,
          resolved: result.resolved + item.resolved,
        }),
        { created: 0, resolved: 0 }
      ),
    [chartData]
  );

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-10 w-52 rounded-xl" />
        </div>
        <Skeleton className="mt-6 h-[300px] w-full rounded-xl" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-800">
            Ticket Overview
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {isError
              ? "Unable to load ticket activity"
              : `${totals.created.toLocaleString()} created, ${totals.resolved.toLocaleString()} resolved`}
          </p>
        </div>

        <div className="flex shrink-0 overflow-hidden rounded-xl border border-gray-200">
          {rangeOptions.map((option) => {
            const isActive = range === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setRange(option.value)}
                className={`border-r border-gray-200 px-4 py-2 text-sm font-medium transition-colors last:border-r-0 ${
                  isActive
                    ? "bg-[#bf3419]/10 text-[#bf3419]"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <ChartContainer
        config={chartConfig}
        className="mt-6 h-[300px] w-full aspect-auto"
        initialDimension={{ width: 900, height: 300 }}
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={12}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={34}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="created"
            fill="var(--color-created)"
            radius={[4, 4, 0, 0]}
            maxBarSize={34}
          />
          <Bar
            dataKey="resolved"
            fill="var(--color-resolved)"
            radius={[4, 4, 0, 0]}
            maxBarSize={34}
          />
        </BarChart>
      </ChartContainer>
    </section>
  );
}
