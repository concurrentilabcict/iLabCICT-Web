import { CalendarDays, ChevronRight, FileText } from 'lucide-react';
//request, FileWarning - Report


export default function RepairLogCard() {
    return (
        <>
            <div className="primary-border-color flex flex-col border rounded-2xl px-3.5
             py-4 bg-white w-full max-w-[600px] md:max-w-[550px] gap-y-2 cursor-pointer">
                <div className="flex justify-between gap-x-3 items-start">
                    <div className='bg-purple-100 text-purple-700 p-2.5 rounded-lg mt-0.5'>
                        <FileText size={18} />
                    </div>
                    <div>
                        <h1 className='text-lg font-medium'>Defective Keyboard</h1>
                        <p className='text-sm secondary-text-color max-w-[75%] line-clamp-2 h-10'>sira yung mouse idol, nadatnan ko nalang yan ha baka masisi pa, lala naman!!!!!!!!!!!!!!!!!!!</p>
                    </div>
                </div>

                <div className="h-px w-full bg-gray-300 mb-1.5" />

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-x-1">
                        <CalendarDays size={14} />
                        <span className="text-sm">
                            May 23, 2026 • 7:32 AM
                        </span>
                    </div>

                    <ChevronRight size={25} />

                </div>
            </div>
        </>
    );
}