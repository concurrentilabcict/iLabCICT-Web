import { Search, Funnel, ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { TicketTypeFilter } from '@/utils/ticket';

type SearchFilterProps = {
    searchQuery: string;
    selectedType: TicketTypeFilter;
    onSearchChange: (query: string) => void;
    onTypeChange: (type: TicketTypeFilter) => void;
};

const typeOptions: TicketTypeFilter[] = ['All', 'Request', 'Report'];

export default function SearchFilter({
    searchQuery,
    selectedType,
    onSearchChange,
    onTypeChange,
}: SearchFilterProps) {

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const filterRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const isSearchActive = isFocused || searchQuery.trim() !== '';

    const clearSearch = () => {
        onSearchChange('');
        setIsFocused(false);
        searchInputRef.current?.blur();
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target as Node)
            ) {
                setIsFilterOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsFilterOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

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
                    placeholder="Search Repair Logs..."
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
	                    className="w-full rounded-xl bg-white py-2 pl-10 pr-10 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none"
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

            <div
                ref={filterRef}
                className={`relative ${isSearchActive ? 'hidden md:block' : ''}`}
            >
                <button
                    type="button"
                    onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
	                    className='flex items-center justify-between gap-x-5 rounded-xl bg-white px-3 py-2 secondary-text-color shadow-[0_4px_14px_rgba(15,23,42,0.08)] cursor-pointer md:w-35'
                    aria-expanded={isFilterOpen}
                    aria-haspopup="listbox"
                >
                    <div className='flex items-center gap-x-1'>
                        <Funnel size={14} />
                        <span>{selectedType}</span>
                    </div>
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isFilterOpen && (
                    <div
	                        className='absolute right-0 top-full z-10 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]'
                        role="listbox"
                    >
                        {typeOptions.map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                                    selectedType === type ? 'font-medium' : ''
                                }`}
                                onClick={() => {
                                    onTypeChange(type);
                                    setIsFilterOpen(false);
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
