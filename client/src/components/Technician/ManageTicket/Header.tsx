import { ScrollText } from 'lucide-react';

export default function Header() {
    return(
        <>
            <div className="flex items-center justify-between p-5 border-b border-b-[#ECEDF0]">
                <div className='flex items-center gap-x-2'>
                    <div className='primary-bg-color rounded-sm p-2'>
                        <ScrollText size={18} className='text-white' />
                    </div>
                    <h1 className='font-medium'>Ticket Queue</h1>
                </div>
                <span>profile</span>
            </div>
        </>
    );
}