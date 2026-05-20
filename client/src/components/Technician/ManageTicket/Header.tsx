import { ScrollText, Menu } from 'lucide-react';

import { useSidebar } from "@/components/ui/sidebar";

export default function Header() {

    const {toggleSidebar } = useSidebar();

    return(
        <>
            <div className="bg-white flex items-center justify-between p-5 border-b border-b-[#e5e5e5]">
                <div className='flex items-center gap-x-2'>
                        <button onClick={toggleSidebar} className='cursor-pointer'>
                            <Menu size={25} className='hidden md:block lg:hidden mr-2' />
                        </button>
                        
                    <div className='primary-bg-color rounded-sm p-2'>
                        <ScrollText size={18} className='text-white' />
                    </div>
                    <h1 className='text-lg font-medium'>Ticket Queue</h1>
                </div>
                <span>profile</span>
            </div>
        </>
    );
}