import { Search, Funnel, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function SearchFilter() {

    const [filter, setFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const filterRef = useRef<HTMLDivElement>(null);

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
        <div className="flex items-center justify-between gap-x-2 px-5 py-3">
            <div className="relative w-full max-w-sm">
                <Search
                    size={18}
                    className="secondary-text-color absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                    type="text"
                    placeholder="Search Tickets..."
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="bg-white w-full rounded-md border primary-border-color py-2 pl-10 pr-4 
                    outline-none focus:border-black!"
                />
            </div>

            <div ref={filterRef} className={isFocused ? "hidden" : "relative"}>
                <button
                    type="button"
                    onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                    className='bg-white flex items-center gap-x-5 px-3 py-2 border primary-border-color rounded-md
             cursor-pointer secondary-text-color justify-between md:w-35'
                    aria-expanded={isFilterOpen}
                    aria-haspopup="listbox"
                >
                    <div className='flex items-center gap-x-1'>
                        <Funnel size={14} />
                        <span>{filter}</span>
                    </div>
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isFilterOpen && (
                    <div
                        className='absolute right-0 top-full z-10 mt-2 w-full rounded-md bg-white
                         border primary-border-color shadow-sm overflow-hidden'
                        role="listbox"
                    >
                        <button className='block w-full text-left px-3 py-2 hover:bg-gray-100' onClick={() => {
                            setFilter('All');
                            setIsFilterOpen(false);
                        }}>
                            All
                        </button>
                        <button className='block w-full text-left px-3 py-2 hover:bg-gray-100' onClick={() => {
                            setFilter('Request');
                            setIsFilterOpen(false);
                        }}>
                            Request
                        </button>
                        <button className='block w-full text-left px-3 py-2 hover:bg-gray-100' onClick={() => {
                            setFilter('Report');
                            setIsFilterOpen(false);
                        }}>
                            Report
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
