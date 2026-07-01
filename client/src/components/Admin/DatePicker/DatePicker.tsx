
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  date?: Date;
  onDateChange: (date?: Date) => void;
};

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className="
              w-[200px]
              justify-between
              rounded-xl
              font-normal
              h-[42px] px-3
              text-base
            "
          >
            {date ? format(date, "dd/MM/yyyy") : "dd/mm/yyyy"}

            <CalendarIcon className={`h-4 w-4 opacity-70 ${date ? "mr-6" : ""}`} />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>

      {date && (
        <button
          type="button"
          aria-label="Clear date filter"
          onClick={() => onDateChange(undefined)}
          className="secondary-text-color absolute right-3 top-1/2 z-10 -translate-y-1/2 hover:text-black"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
