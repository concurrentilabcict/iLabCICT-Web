import { ChevronDown, Download, Funnel, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { StatusFilter, TicketTypeFilter } from '@/utils/ticket';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DatePicker } from './DatePicker';

const statusOptions: StatusFilter[] = ['All', 'Open', 'Ongoing', 'Resolved'];
const typeOptions: TicketTypeFilter[] = ['All', 'Request', 'Report'];

export default function TicketToolbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');
    const [selectedType, setSelectedType] = useState<TicketTypeFilter>('All');
    const [openFilter, setOpenFilter] = useState<'status' | 'type' | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const clearSearch = () => {
        setSearchQuery('');
        searchInputRef.current?.focus();
    };

    return (
        <div className="flex w-full flex-col gap-y-3 ">
            <div className="flex items-center justify-between">
                <button className="bg-white cursor-pointer flex items-center gap-x-1.5 border rounded-xl py-2 px-3.5">
                    <Download size={20} className='rotate-180' />
                    <span>Export</span>
                </button>

                <div className="relative w-[300px]">
                    <Search
                        size={18}
                        className="secondary-text-color absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search Tickets..."
                        className="bg-white w-full rounded-xl border primary-border-color py-2 pl-10 pr-10 outline-none focus:border-black!"
                    />

                    {searchQuery && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 secondary-text-color hover:text-black"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                    <DropdownMenu
                        open={openFilter === 'status'}
                        onOpenChange={(isOpen) => setOpenFilter(isOpen ? 'status' : null)}
                    >
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="bg-white flex items-center justify-between gap-x-5 px-3 py-2 border primary-border-color rounded-xl cursor-pointer secondary-text-color min-w-36"
                            >
                                <span>{selectedStatus === "All" ? "All Status" : selectedStatus}</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${openFilter === 'status' ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" sideOffset={8} className="rounded-xl">
                            {statusOptions.map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    className={`px-3 py-2 ${selectedStatus === status ? 'font-medium' : ''}`}
                                    onSelect={() => setSelectedStatus(status)}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu
                        open={openFilter === 'type'}
                        onOpenChange={(isOpen) => setOpenFilter(isOpen ? 'type' : null)}
                    >
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="bg-white flex items-center justify-between gap-x-5 px-3 py-2 border primary-border-color rounded-xl cursor-pointer secondary-text-color min-w-36"
                            >
                                <span>{selectedType === "All" ? "All Type" : selectedType}</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${openFilter === 'type' ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" sideOffset={8} className="rounded-xl">
                            {typeOptions.map((type) => (
                                <DropdownMenuItem
                                    key={type}
                                    className={`px-3 py-2 ${selectedType === type ? 'font-medium' : ''}`}
                                    onSelect={() => setSelectedType(type)}
                                >
                                    {type}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <DatePicker />
            </div>
        </div>
    );
}
