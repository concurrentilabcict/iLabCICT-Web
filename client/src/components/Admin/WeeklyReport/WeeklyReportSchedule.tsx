import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buildApiUrl, createApiError, privateFetch, type ApiError } from "@/lib/api";

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

const toPythonWeekday = (date: Date) => (date.getDay() + 6) % 7;

const getDateForWeekday = (weekday: number) => {
  const today = new Date();
  const todayWeekday = toPythonWeekday(today);
  const daysUntilWeekday = (weekday - todayWeekday + 7) % 7;

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilWeekday
  );
};

const getTimeValue = (time: string) => time.slice(0, 8);

export default function WeeklyReportSchedule() {
  const queryClient = useQueryClient();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [date, setDate] = useState<Date>();
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

    setDate(
      scheduler.next_execution
        ? new Date(scheduler.next_execution)
        : getDateForWeekday(scheduler.weekday)
    );
    setStartTime(getTimeValue(scheduler.execution_time));
  }, [scheduler]);

  const updateSchedulerMutation = useMutation({
    mutationFn: async () => {
      if (!date) {
        throw createApiError(400, "Please select a schedule date.");
      }

      const response = await privateFetch(buildApiUrl(REPORT_SCHEDULER_ENDPOINT), {
        method: "PATCH",
        body: JSON.stringify({
          weekday: toPythonWeekday(date),
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
      toast.success("Report schedule updated.");
      setPopoverOpen(false);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update report schedule.");
    },
  });

  const isSubmitting = updateSchedulerMutation.isPending;
  const scheduleLabel = date
    ? `${format(date, "EEEE")} at ${startTime}`
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
          <span className="truncate">{isLoading ? "Loading schedule..." : scheduleLabel}</span>
          <CalendarIcon className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto overflow-hidden rounded-2xl p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
          classNames={{
            day_button:
              "data-[selected-single=true]:!bg-[#bf3419] data-[selected-single=true]:!text-white",
          }}
        />

        <div className="border-t bg-card p-3">
          <label
            htmlFor="report-scheduler-start-time"
            className="mb-2 block text-sm font-medium"
          >
            Start Time
          </label>
          <InputGroup className="h-10">
            <InputGroupInput
              id="report-scheduler-start-time"
              type="time"
              step="1"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              disabled={isSubmitting}
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <InputGroupAddon align="inline-end">
              <Clock2Icon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>

          <Button
            type="button"
            disabled={!date || isSubmitting}
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
