import { useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { Ticket } from "@/types/ticket";

type Range = "90d" | "30d" | "7d";

type ChartTicket = Pick<
    Ticket,
    "id" | "type" | "status" | "createdAt" | "updatedAt"
>;

type TicketChartData = {
    date: string;
    newReport: number;
    newRequest: number;
    resolved: number;
};

const rangeOptions: { label: string; value: Range; days: number }[] = [
    { label: "Last 3 months", value: "90d", days: 90 },
    { label: "Last 30 days", value: "30d", days: 30 },
    { label: "Last 7 days", value: "7d", days: 7 },
];

const chartConfig = {
    newReport: {
        label: "New Report",
        color: "#bf3419",
    },
    newRequest: {
        label: "New Request",
        color: "#e77962",
    },
    resolved: {
        label: "Resolved",
        color: "#7f2413",
    },
} satisfies ChartConfig;

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function buildChartData(tickets: ChartTicket[]): TicketChartData[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = Array.from({ length: 90 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (89 - index));

        return {
            date: getDateKey(date),
            newReport: 0,
            newRequest: 0,
            resolved: 0,
        };
    });

    const dataByDate = new Map(data.map((item) => [item.date, item]));

    tickets.forEach((ticket) => {
        const createdDate = new Date(ticket.createdAt);
        const createdItem = Number.isNaN(createdDate.getTime())
            ? undefined
            : dataByDate.get(getDateKey(createdDate));
        const type = ticket.type.trim().toLowerCase();

        if (createdItem && type === "report") {
            createdItem.newReport += 1;
        }

        if (createdItem && type === "request") {
            createdItem.newRequest += 1;
        }

        if (ticket.status.trim().toLowerCase() === "resolved") {
            const resolvedDate = new Date(ticket.updatedAt);
            const resolvedItem = Number.isNaN(resolvedDate.getTime())
                ? undefined
                : dataByDate.get(getDateKey(resolvedDate));

            if (resolvedItem) {
                resolvedItem.resolved += 1;
            }
        }
    });

    return data;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(new Date(`${value}T00:00:00`));
}

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

    const selectedRange = rangeOptions.find((option) => option.value === range)
        ?? rangeOptions[0];

    const ticketData = useMemo(() => buildChartData(tickets), [tickets]);

    const filteredData = useMemo(
        () => ticketData.slice(-selectedRange.days),
        [selectedRange.days, ticketData]
    );

    const totalActivity = useMemo(
        () => filteredData.reduce(
            (total, item) => (
                total + item.newReport + item.newRequest + item.resolved
            ),
            0
        ),
        [filteredData]
    );

    return (
        <section className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
            <div className="flex items-start justify-between gap-6">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-800">
                        Ticket Overview
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {isLoading
                            ? "Loading ticket activity..."
                            : isError
                                ? "Unable to load ticket activity"
                                : `${totalActivity.toLocaleString()} ticket activities in the ${selectedRange.label.toLowerCase()}`}
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
                <AreaChart
                    accessibilityLayer
                    data={filteredData}
                    margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="fillNewRequest" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-newRequest)"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-newRequest)"
                                stopOpacity={0.02}
                            />
                        </linearGradient>
                        <linearGradient id="fillNewReport" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-newReport)"
                                stopOpacity={0.25}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-newReport)"
                                stopOpacity={0.02}
                            />
                        </linearGradient>
                        <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-resolved)"
                                stopOpacity={0.2}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-resolved)"
                                stopOpacity={0.01}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} strokeDasharray="4 4" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        minTickGap={48}
                        tickFormatter={formatDate}
                    />
                    <YAxis hide domain={[0, "dataMax + 3"]} />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                indicator="line"
                                labelFormatter={(value) => formatDate(String(value))}
                            />
                        }
                    />
                    <ChartLegend content={<ChartLegendContent />} />

                    <Area
                        dataKey="newRequest"
                        type="monotone"
                        fill="url(#fillNewRequest)"
                        fillOpacity={1}
                        stroke="var(--color-newRequest)"
                        strokeWidth={2}
                    />
                    <Area
                        dataKey="newReport"
                        type="monotone"
                        fill="url(#fillNewReport)"
                        fillOpacity={1}
                        stroke="var(--color-newReport)"
                        strokeWidth={2}
                    />
                    <Area
                        dataKey="resolved"
                        type="monotone"
                        fill="url(#fillResolved)"
                        fillOpacity={1}
                        stroke="var(--color-resolved)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ChartContainer>
        </section>
    );
}
