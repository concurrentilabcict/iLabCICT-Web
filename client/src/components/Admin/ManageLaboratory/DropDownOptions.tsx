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

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};


type DropDownOptionsProps = {
    fieldLabel: string,
    fieldType: string,
    selectedItem: any,
    isSubmitting: boolean,
    form: any,
    updateField: Function,
    itemOptions: any
}

export default function DropDownOptions({
    fieldLabel,
    fieldType,
    selectedItem,
    isSubmitting,
    form,
    updateField,
    itemOptions
}: DropDownOptionsProps){

    const [itemOpen, setItemOpen] = useState(false);

 return(
    <>
    <Popover
            open={itemOpen}
            onOpenChange={(isOpen) => {
              if (!isSubmitting) {
                setItemOpen(isOpen);
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={isSubmitting}
                className="primary-border-color flex h-10 w-full cursor-pointer items-center justify-between gap-x-5 rounded-xl border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{selectedItem?.label || "no custodian"}</span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    itemOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-60 rounded-3xl p-1">
              <Command>
                <CommandInput placeholder={fieldLabel}/>

                <CommandList>
                  <CommandEmpty>No {fieldLabel} found.</CommandEmpty>

                  <CommandGroup className="p-2">
                    {itemOptions?.map((item: any) => (
                      <CommandItem
                        key={item?.value}
                        onSelect={() => {
                          updateField(fieldType, item?.value);
                          console.log(fieldType, item?.value)
                          setItemOpen(false);
                        }}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2 ${
                          form[fieldType] === item?.value
                            ? "bg-muted data-selected:bg-muted"
                            : ""
                        }`}
                      >
                        <Checkbox checked={form[fieldType] === item.value} />
                        <span>{item?.label}</span>
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