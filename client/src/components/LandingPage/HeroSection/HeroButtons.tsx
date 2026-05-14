import { ArrowRight, CirclePlay } from 'lucide-react';

export default function HeroButtons() {
    return(
        <>
            <div className="flex gap-x-3">
                <button className='button-primary'>
                    Access System
                    <ArrowRight size={16} />
                </button>

                <button className='button-secondary'>
                    <CirclePlay size={16} />
                    Watch Overview
                </button>
            </div>
        </>
    );
}