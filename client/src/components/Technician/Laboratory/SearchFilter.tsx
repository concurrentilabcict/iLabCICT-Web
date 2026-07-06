import { Search, Funnel, ChevronDown, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { StatusFilter } from '@/utils/room';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SearchFilterProps = {
    searchQuery: string;
    selectedStatus: StatusFilter;
    onSearchChange: (query: string) => void;
    onStatusChange: (type: StatusFilter) => void;
};

const statusOptions: StatusFilter[] = ["All", "Operational", "Maintenance", "Degraded", "OutOfService"];

export default function SearchFilter({
    searchQuery,
    selectedStatus,
    onSearchChange,
    onStatusChange,
}: SearchFilterProps) {

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const isSearchActive = isFocused || searchQuery?.trim() !== '';

    const clearSearch = () => {
        onSearchChange('');
        setIsFocused(false);
        searchInputRef.current?.blur();
    };

    return (
        <div className="flex items-center justify-between gap-x-2 px-3 py-3">
            <div
                className={`relative w-full transition-all ${
                    isSearchActive ? 'max-w-none md:max-w-sm' : 'max-w-sm'
                }`}
            >
                <Search
                    size={18}
                    className="secondary-text-color absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search Tickets..."
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="bg-white w-full rounded-md border primary-border-color py-2 pl-10 pr-10 
                    outline-none focus:border-black!"
                />

                {isSearchActive && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 secondary-text-color hover:text-black"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className={isSearchActive ? 'hidden md:block' : ''}>
                <DropdownMenu
                    open={isFilterOpen}
                    onOpenChange={setIsFilterOpen}
                >
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className='bg-white flex items-center gap-x-5 px-3 py-2 border primary-border-color rounded-md
                 cursor-pointer secondary-text-color justify-between md:w-35'
                        >
                            <div className='flex items-center gap-x-1'>
                                <Funnel size={14} />
                                <span>{selectedStatus}</span>
                            </div>
                            <ChevronDown
                                size={14}
                                className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="rounded-md"
                    >
                        {statusOptions.map((status) => (
                            <DropdownMenuItem
                                key={status}
                                className={`px-3 py-2 ${
                                    selectedStatus === status ? 'font-medium' : ''
                                }`}
                                onSelect={() => onStatusChange(status)}
                            >
                                {status}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
