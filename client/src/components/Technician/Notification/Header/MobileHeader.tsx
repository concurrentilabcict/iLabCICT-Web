import { ScrollText } from 'lucide-react';

export default function MobileHeader() {

    return(
        <>
            <div className="bg-white flex items-center justify-between p-5 border-b border-b-[#e5e5e5]">
                <div className='flex items-center gap-x-2'>
                        
                    <div className='primary-bg-color rounded-sm p-2'>
                        <ScrollText size={18} className='text-white' />
                    </div>
                    <h1 className='text-lg font-medium'>Notification</h1>
                </div>
                <span>profile</span>
            </div>
        </>
    );
}