import { Clock, User, Tickets, Monitor, Building2, CalendarDays, ChevronRight } from 'lucide-react';

export default function ManageTicketCard() {
    return (
        <>
            <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
             rounded-2xl p-3.5 w-full max-w-[600px]">
                <div className="flex items-center gap-x-2">
                    <div className="flex items-center gap-x-1">
                        <div className='flex pending-status gap-x-2 items-center  px-3 py-1.5 rounded-md'>
                            <Clock size={14} />
                            <span className='text-sm'>Pending</span>
                        </div>


                    </div>

                    <div className='flex report-status gap-x-2 items-center  px-3 py-1.5 rounded-md'>
                        <span className='text-sm'>Report</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1 className='text-lg font-medium'>Unresponsive Computer</h1>
                    <p className='text-sm secondary-text-color max-w-[75%] line-clamp-2'>The computer is not responding to any input.</p>
                </div>

                <div className='h-px w-full bg-gray-300 mb-1.5' />

                <div className="flex items-center justify-between">
                    <div className='flex items-center secondary-text-color gap-x-1'>
                        <User size={14} />
                        <span className='text-sm'>John Patrick Soriaga</span>
                    </div>

                    <div className='flex items-center secondary-text-color gap-x-1'>
                        <Tickets size={14} />
                        <span className='text-sm'>TK-2026-001</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                    <div className='flex items-center secondary-text-color gap-x-1'>
                        <Building2 size={14} />
                        <span className='text-sm'>Pimentel Hall, SDL 2</span>
                    </div>

                    <div className='flex items-center secondary-text-color gap-x-1'>
                        <Monitor size={14} />
                        <span className='text-sm'>2023106003</span>
                    </div>
                </div>

                <div className='h-px w-full bg-gray-300 mb-1.5' />
                
                <div className="flex items-center justify-between">
                    <div className='flex items-center gap-x-1'>
                        <CalendarDays size={14} />
                        <span className='text-sm'>May 13, 2026 2:45 PM</span>
                    </div>
                    <ChevronRight size={25} />
                </div>
            </div>
        </>
    );
}