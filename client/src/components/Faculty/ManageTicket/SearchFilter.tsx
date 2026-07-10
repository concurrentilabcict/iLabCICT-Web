import { ChevronDown, Funnel, Search, X } from "lucide-react";
import { useRef, useState } from "react";
import type { TicketTypeFilter } from "@/utils/ticket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SearchFilterProps = {
  searchQuery: string;
  selectedType: TicketTypeFilter;
  onSearchChange: (query: string) => void;
  onTypeChange: (type: TicketTypeFilter) => void;
};

const typeOptions: TicketTypeFilter[] = ["All", "Request", "Report"];

export default function SearchFilter({
  searchQuery,
  selectedType,
  onSearchChange,
  onTypeChange,
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSearchActive = isFocused || searchQuery.trim() !== "";

  const clearSearch = () => {
    onSearchChange("");
    setIsFocused(false);
    searchInputRef.current?.blur();
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-3">
      <div className={`relative w-full ${isSearchActive ? "max-w-none md:max-w-sm" : "max-w-sm"}`}>
        <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tickets..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full rounded-xl bg-white py-2 pl-10 pr-10 outline-none shadow-sm focus:ring-2 focus:ring-primary/30"
        />
        {isSearchActive && (
          <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={clearSearch} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-950">
            <X size={16} />
          </button>
        )}
      </div>

      <div className={isSearchActive ? "hidden md:block" : ""}>
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex w-32 cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-gray-500 shadow-sm">
              <span className="flex items-center gap-1"><Funnel size={14} />{selectedType}</span>
              <ChevronDown size={14} className={isFilterOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8}>
            {typeOptions.map((type) => (
              <DropdownMenuItem key={type} className={selectedType === type ? "font-medium" : ""} onSelect={() => onTypeChange(type)}>
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
