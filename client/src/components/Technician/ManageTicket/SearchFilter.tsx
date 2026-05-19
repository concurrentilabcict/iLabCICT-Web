import { Search, Funnel, ChevronDown } from 'lucide-react';

export default function SearchFilter() {
    return (
        <div className="flex items-center gap-x-2 px-5 py-3">
            <div className="relative flex-1">
                <Search
                    size={18}
                    className="secondary-text-color absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                    type="text"
                    placeholder="Search"
                    className="bg-white w-full rounded-md border primary-border-color py-2 pl-10 pr-4 
                    outline-none focus:border-black!"
                />
            </div>

            <div className='bg-white flex items-center gap-x-5 px-3 py-2 border primary-border-color rounded-md
             cursor-pointer secondary-text-color justify-between'>
                <div className='flex items-center gap-x-1'>
                    <Funnel size={14} />
                    <span>All</span>
                </div>
                <ChevronDown size={14} />
            </div>
        </div>
    );
}
