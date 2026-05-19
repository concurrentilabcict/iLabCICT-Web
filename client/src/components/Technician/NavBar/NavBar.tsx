import { ScrollText, Monitor, CircleEllipsis, ClipboardList, ScanQrCode } from 'lucide-react';

export default function NavBar() {
    return (
        <>
            <div className="fixed bottom-0 z-10 flex gap-x-3 bg-white p-4 w-full border-t
            border-t-[#e5e5e5] items-center justify-around">
                <button type="button" className='flex flex-col items-center gap-y-1
                cursor-pointer primary-text-color'>
                    <ScrollText size={23} />
                    <span className='text-sm'>Tickets</span>
                </button>

                <button type="button" className='flex flex-col items-center gap-y-1
                cursor-pointer secondary-text-color'>
                    <Monitor size={23} />
                    <span className='text-sm'>Laboratory</span>
                </button>

                <button type="button" className='primary-bg-color flex flex-col items-center gap-y-1
                 rounded-full px-3 py-3 text-white'>
                    <ScanQrCode size={25} />
                </button>


                <button type="button" className='flex flex-col items-center gap-y-1
                cursor-pointer secondary-text-color'>
                    <ClipboardList size={23} />
                    <span className='text-sm'>Repairs</span>
                </button>

                <button type="button" className='flex flex-col items-center gap-y-1
                cursor-pointer secondary-text-color'>
                    <CircleEllipsis size={23} />
                    <span className='text-sm'>More</span>
                </button>
            </div>
        </>
    );
}
