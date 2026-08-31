import { useEffect, useState } from "react";
import { CalendarIcon, Clock2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/utils/appToast";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";

type ApiReportScheduler = {
  id: number;
  type: "report";
  enabled: boolean;
  frequency: "weekly";
  weekday: number;
  execution_time: string;
  next_execution: string;
  last_execution: string | null;
};

const REPORT_SCHEDULER_QUERY_KEY = ["report-scheduler", 6] as const;
const REPORT_SCHEDULER_ENDPOINT = "/api/scheduler/6/";

const getTimeValue = (time: string) => time.slice(0, 8);

const formatTimeLabel = (time: string) => {
  const [hourValue = "0", minutes = "00", seconds = "00"] = time.split(":");
  const hour = Number(hourValue);
  const displayHour = String(hour % 12 || 12).padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";

  return `${displayHour}:${minutes}:${seconds} ${period}`;
};

const hourOptions = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0")
);

const weekdayOptions = [
  { label: "Su", value: 6, name: "Sunday" },
  { label: "Mo", value: 0, name: "Monday" },
  { label: "Tu", value: 1, name: "Tuesday" },
  { label: "We", value: 2, name: "Wednesday" },
  { label: "Th", value: 3, name: "Thursday" },
  { label: "Fr", value: 4, name: "Friday" },
  { label: "Sa", value: 5, name: "Saturday" },
] as const;

export default function WeeklyReportSchedule() {
  const queryClient = useQueryClient();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [weekday, setWeekday] = useState<number>();
  const [startTime, setStartTime] = useState("22:00:00");

  const { data: scheduler, isLoading } = useQuery<ApiReportScheduler>({
    queryKey: REPORT_SCHEDULER_QUERY_KEY,
    queryFn: async () => {
      const response = await privateFetch(buildApiUrl(REPORT_SCHEDULER_ENDPOINT));
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || "Failed to fetch report scheduler."
        );
      }

      return data as ApiReportScheduler;
    },
  });

  useEffect(() => {
    if (!scheduler) {
      return;
    }

    setWeekday(scheduler.weekday);
    setStartTime(getTimeValue(scheduler.execution_time));
  }, [scheduler]);

  const updateSchedulerMutation = useMutation({
    mutationFn: async () => {
      if (weekday === undefined) {
        throw createApiError(400, "Please select a schedule day.");
      }

      const response = await privateFetch(buildApiUrl(REPORT_SCHEDULER_ENDPOINT), {
        method: "PATCH",
        body: JSON.stringify({
          weekday,
          execution_time: startTime,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || data.detail || "Failed to update report scheduler."
        );
      }

      return data as ApiReportScheduler;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: REPORT_SCHEDULER_QUERY_KEY,
      });
      appToast.success("Report schedule updated successfully.");
      setPopoverOpen(false);
    },
    onError: () => {
      appToast.error("We couldn't update the report schedule. Please try again.");
    },
  });

  const isSubmitting = updateSchedulerMutation.isPending;
  const selectedWeekday = weekdayOptions.find(
    (weekdayOption) => weekdayOption.value === weekday
  );
  const scheduleLabel = selectedWeekday
    ? `${selectedWeekday.name} at ${formatTimeLabel(startTime)}`
    : "Schedule report";

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          className="h-[42px] w-[200px] justify-between rounded-xl bg-white px-3 text-base font-normal"
        >
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="truncate">{scheduleLabel}</span>
          )}
          <CalendarIcon className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto overflow-hidden rounded-2xl p-0">
        <div className="grid grid-cols-7 gap-1 p-3">
          {weekdayOptions.map((weekdayOption) => (
            <button
              key={weekdayOption.value}
              type="button"
              disabled={isSubmitting}
              onClick={() => setWeekday(weekdayOption.value)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                weekday === weekdayOption.value
                  ? "bg-[#bf3419] text-white"
                  : "text-foreground hover:bg-muted"
              }`}
              aria-label={weekdayOption.name}
            >
              {weekdayOption.label}
            </button>
          ))}
        </div>

        <div className="border-t bg-card p-3">
          <label
            htmlFor="report-scheduler-start-time"
            className="mb-2 block text-sm font-medium"
          >
            Start Time
          </label>
          <div className="relative">
            <select
              id="report-scheduler-start-time"
              value={startTime.slice(0, 2)}
              onChange={(event) =>
                setStartTime(`${event.target.value}:${startTime.slice(3, 8)}`)
              }
              disabled={isSubmitting}
              className="h-10 w-full appearance-none rounded-lg border border-input bg-transparent px-3 pr-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {formatTimeLabel(`${hour}:${startTime.slice(3, 8)}`)}
                </option>
              ))}
            </select>
            <Clock2Icon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <Button
            type="button"
            disabled={weekday === undefined || isSubmitting}
            onClick={() => updateSchedulerMutation.mutate()}
            className="mt-3 h-9 w-full rounded-xl"
          >
            {isSubmitting ? "Saving..." : "Save Schedule"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
