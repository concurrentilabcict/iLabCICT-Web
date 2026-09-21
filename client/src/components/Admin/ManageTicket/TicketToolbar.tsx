import { Archive, ChevronDown, Download, Inbox, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { StatusFilter, TicketTypeFilter } from '@/utils/ticket';
import type { Ticket } from '@/types/ticket';
import { appToast } from '@/utils/appToast';
import { exportTablePdf, formatPdfDate, getLocalDateStamp } from '@/utils/tabularPdf';

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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Checkbox } from "@/components/ui/checkbox";

import { DatePicker } from '../DatePicker/DatePicker';

const activeStatusOptions: StatusFilter[] = ['All', 'Open', 'Ongoing', 'Resolved'];
const typeOptions: TicketTypeFilter[] = ['All', 'Request', 'Report'];

type TicketToolbarProps = {
    tickets: Ticket[];
    isLoading?: boolean;
    ticketView: 'active' | 'archived';
    onTicketViewChange: (view: 'active' | 'archived') => void;
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

export default function TicketToolbar({
    tickets,
    isLoading = false,
    ticketView,
    onTicketViewChange,
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
    const statusOptions: StatusFilter[] = ticketView === 'archived'
        ? ['All', 'Archived']
        : activeStatusOptions;

    const clearSearch = () => {
        onSearchQueryChange('');
        searchInputRef.current?.focus();
    };

    const exportTickets = async () => {
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

        try {
            exportTablePdf({
                title: 'iLabCICT Ticket Management',
                subject: 'Ticket management export',
                filename: `iLabCICT_Tickets_${getLocalDateStamp()}.pdf`,
                headers,
                rows: tickets.map((ticket) => [
                    ticket.ticketCode,
                    `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`.trim(),
                    ticket.assignedTo
                        ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`.trim()
                        : 'Unassigned',
                    formatLabel(ticket.type),
                    formatLabel(ticket.status),
                    formatPdfDate(ticket.createdAt),
                ]),
                columnWidths: [20, 24, 24, 16, 16, 20],
                metadata: [
                    { label: 'View', value: ticketView === 'archived' ? 'Archived' : 'Active' },
                ],
            });
        } catch (error) {
            appToast.error(
                error instanceof Error ? error.message : "We couldn't export the tickets."
            );
        }
    };

    return (
        <div className="flex w-full flex-col gap-y-3 ">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                type="button"
                                disabled={isLoading || tickets.length === 0}
                                className="bg-white flex items-center gap-x-1.5 border rounded-xl py-2 px-3.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Download size={20} className='rotate-180' />
                                <span>Export</span>
                            </button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Export Tickets?</AlertDialogTitle>

                                <AlertDialogDescription>
                                    This will prepare the current tickets table as a legal-size PDF.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                <AlertDialogAction onClick={() => void exportTickets()}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <div className="flex rounded-xl border bg-white p-1" aria-label="Ticket view">
                        <button
                            type="button"
                            onClick={() => onTicketViewChange('active')}
                            aria-pressed={ticketView === 'active'}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${ticketView === 'active'
                                ? 'primary-bg-color text-white'
                                : 'secondary-text-color hover:bg-muted'
                                }`}
                        >
                            <Inbox size={16} />
                            Active
                        </button>
                        <button
                            type="button"
                            onClick={() => onTicketViewChange('archived')}
                            aria-pressed={ticketView === 'archived'}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${ticketView === 'archived'
                                ? 'primary-bg-color text-white'
                                : 'secondary-text-color hover:bg-muted'
                                }`}
                        >
                            <Archive size={16} />
                            Archived
                        </button>
                    </div>
                </div>

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
