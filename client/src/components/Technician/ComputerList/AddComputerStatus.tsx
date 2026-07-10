import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Checkbox } from "@/components/ui/checkbox";

import { ChevronDown } from "lucide-react";
import { useState } from "react";



type AddComputerStatusProps = {
    selectedStatus: any,
    isSubmitting: boolean,
    form: any,
    updateField: Function,
    statusOptions: any
}

export default function AddComputerStatus({
    selectedStatus,
    isSubmitting,
    form,
    updateField,
    statusOptions
}: AddComputerStatusProps){

    const [statusOpen, setStatusOpen] = useState(false);

 return(
    <>
    <Popover
            open={statusOpen}
            onOpenChange={(isOpen) => {
              if (!isSubmitting) {
                setStatusOpen(isOpen);
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={isSubmitting}
                className="primary-border-color flex h-10 w-full cursor-pointer items-center justify-between gap-x-5 rounded-xl border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{selectedStatus.label}</span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    statusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-60 rounded-3xl p-1">
              <Command>
                <CommandInput placeholder="Status" />

                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>

                  <CommandGroup className="p-2">
                    {statusOptions.map((status: any) => (
                      <CommandItem
                        key={status.value}
                        onSelect={() => {
                          updateField("computerStatus", status.value);
                          setStatusOpen(false);
                        }}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                          form.computerStatus === status.value
                            ? "bg-muted data-selected:bg-muted"
                            : ""
                        }`}
                      >
                        <Checkbox checked={form.computerStatus === status.value} />
                        <span>{status.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
    </>
 )   
}