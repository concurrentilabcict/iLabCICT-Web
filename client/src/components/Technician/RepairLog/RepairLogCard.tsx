import type { RepairLog } from '@/types/repairLog';
import { formatDateTime } from '@/utils/string';
import { CalendarDays, ChevronRight, FileWarning, User, Wrench } from 'lucide-react';

type RepairLogCardProps = {
    repairLog: RepairLog;
    onClick?: () => void;
}

export default function RepairLogCard({ repairLog, onClick }: RepairLogCardProps) {

    const reportedBy = repairLog.ticket.reportedBy.firstName + " " + repairLog.ticket.reportedBy.lastName;

    return (
        <>
            <div
                onClick={onClick}
                className="primary-border-color flex flex-col border rounded-2xl px-3.5
             py-4 bg-white w-full max-w-[600px] md:max-w-[550px] gap-y-2 cursor-pointer">
                <div className="flex justify-between gap-x-3 items-start">
                    <div className='bg-red-100 text-red-700 p-2.5 rounded-lg mt-0.5'>
                        <FileWarning size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className='text-lg font-medium'>{repairLog.title}</h1>
                        <p className='text-sm secondary-text-color max-w-[75%] line-clamp-2 h-10'>{repairLog.repairNotes}</p>
                    </div>
                </div>

                <div className="h-px w-full bg-gray-300 mb-1.5" />

                <div className="flex items-center justify-between">

                    <div className="flex items-center secondary-text-color gap-x-1">
                        <User size={14} />
                        <span className="text-sm">{reportedBy}</span>
                    </div>

                    <div className="flex items-center secondary-text-color gap-x-1">
                            <Wrench size={14} />
                            <span className='text-sm'>{repairLog.repairLogCode}</span>
                        </div>

                </div>

                <div className="h-px w-full bg-gray-300 mb-1.5" />

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-x-5">
                        <div className="flex items-center gap-x-1">
                            <CalendarDays size={14} />
                            <span className="text-sm">
                                {formatDateTime(repairLog.createdAt)}
                            </span>
                        </div>
                    </div>

                    <ChevronRight size={25} />

                </div>
            </div>
        </>
    );
}
