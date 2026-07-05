import { ChevronDown, Download, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { StatusFilter, TicketTypeFilter } from '@/utils/ticket';
import type { Ticket } from '@/types/ticket';

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

import { DatePicker } from '../DatePicker/DatePicker';

const statusOptions: StatusFilter[] = ['All', 'Open', 'Ongoing', 'Resolved'];
const typeOptions: TicketTypeFilter[] = ['All', 'Request', 'Report'];

type TicketToolbarProps = {
    tickets: Ticket[];
    isLoading?: boolean;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    selectedStatus: StatusFilter;
    onStatusChange: (status: StatusFilter) => void;
    selectedType: TicketTypeFilter;
    onTypeChange: (type: TicketTypeFilter) => void;
    selectedDate?: Date;
    onDateChange: (date?: Date) => void;
};

const formatLabel = (text: string) =>
    text
        .replace(/_/g, ' ')
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));

const escapeCsvCell = (value: string) =>
    `"${value.replace(/"/g, '""')}"`;

export default function TicketToolbar({
    tickets,
    isLoading = false,
    searchQuery,
    onSearchQueryChange,
    selectedStatus,
    onStatusChange,
    selectedType,
    onTypeChange,
    selectedDate,
    onDateChange,
}: TicketToolbarProps) {
    const [openFilter, setOpenFilter] = useState<'status' | 'type' | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const clearSearch = () => {
        onSearchQueryChange('');
        searchInputRef.current?.focus();
    };

    const exportTickets = () => {
        if (tickets.length === 0) {
            return;
        }

        const headers = [
            'Ticket ID',
            'Faculty',
            'Technician',
            'Type',
            'Status',
            'Created',
        ];

        const rows = tickets.map((ticket) => [
            ticket.ticketCode,
            `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`,
            `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`,
            formatLabel(ticket.type),
            formatLabel(ticket.status),
            formatDate(ticket.createdAt),
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCsvCell).join(','))
            .join('\r\n');
        const blob = new Blob([`\uFEFF${csv}`], {
            type: 'text/csv;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');

        downloadLink.href = url;
        downloadLink.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex w-full flex-col gap-y-3 ">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={exportTickets}
                    disabled={isLoading || tickets.length === 0}
                    className="bg-white flex items-center gap-x-1.5 border rounded-xl py-2 px-3.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={20} className='rotate-180' />
                    <span>Export</span>
                </button>

                <div className="relative w-[300px]">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(event) => onSearchQueryChange(event.target.value)}
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
                    <Popover
                        open={openFilter === 'status'}
                        onOpenChange={(isOpen) => setOpenFilter(isOpen ? 'status' : null)}
                    >
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="bg-white flex items-center justify-between gap-x-5 px-3 py-2 border primary-border-color rounded-xl cursor-pointer min-w-36"
                            >
                                <span>
                                    {selectedStatus === "All" ? "All Status" : selectedStatus}
                                </span>

                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${openFilter === 'status' ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            align="start"
                            className="w-50 p-1 rounded-3xl"
                        >
                            <Command>
                                <CommandInput placeholder="Status" />

                                <CommandList>
                                    <CommandEmpty>No status found.</CommandEmpty>

                                    <CommandGroup className="p-2">
                                        {statusOptions.map((status) => (
                                            <CommandItem
                                                key={status}
                                                onSelect={() => onStatusChange(status)}
                                                className={`flex items-center gap-3 rounded-2xl py-2 cursor-pointer ${selectedStatus === status ? "bg-muted data-selected:bg-muted" : ""
                                                    }`}
                                            >
                                                <Checkbox checked={selectedStatus === status} />
                                                <span>{status}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <Popover
                        open={openFilter === 'type'}
                        onOpenChange={(isOpen) => setOpenFilter(isOpen ? 'type' : null)}
                    >
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="bg-white flex items-center justify-between gap-x-5 px-3 py-2 border primary-border-color rounded-xl cursor-pointer min-w-36"
                            >
                                <span>
                                    {selectedType === "All" ? "All Type" : selectedType}
                                </span>

                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${openFilter === 'type' ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            align="start"
                            className="w-50 p-1 rounded-3xl"
                        >
                            <Command>
                                <CommandInput placeholder="Type" />

                                <CommandList>
                                    <CommandEmpty>No type found.</CommandEmpty>

                                    <CommandGroup className="p-2">
                                        {typeOptions.map((type) => (
                                            <CommandItem
                                                key={type}
                                                onSelect={() => onTypeChange(type)}
                                                className={`flex items-center gap-3 rounded-2xl py-2 cursor-pointer ${selectedType === type ? "bg-muted data-selected:bg-muted" : ""
                                                    }`}
                                            >
                                                <Checkbox checked={selectedType === type} />
                                                <span>{type}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <DatePicker date={selectedDate} onDateChange={onDateChange} />
            </div>
        </div>
    );
}
