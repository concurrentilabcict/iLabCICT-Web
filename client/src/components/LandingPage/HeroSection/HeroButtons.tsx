import { LayoutTemplate, ArrowRight, CirclePlay } from 'lucide-react';

export default function HeroButtons() {
    return(
        <>
            <div className="flex gap-x-3">
                <button className='font-medium flex items-center gap-x-3 bg-[#bf3419] text-white
                px-3 py-2 rounded-lg'>
                    Access System
                    <ArrowRight size={16} />
                </button>

                <button className='font-medium flex items-center gap-x-3 outline outline-[#bf3419]
                 text-[#bf3419] px-3 py-2 rounded-lg'>
                    <CirclePlay size={16} />
                    Watch Overview
                </button>
            </div>
        </>
    );
}