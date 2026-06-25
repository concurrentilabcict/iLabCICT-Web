

export default function Filter(){
    return(
        <div className="flex flex-nowrap items-center gap-x-2 overflow-x-auto px-3 py-3">
            <button
                type="button"
                className="bg-white primary-bg-color shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white"
            >
                All
            </button>
            <button
                type="button"
                className="bg-white shrink-0 rounded-full border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color"
            >
                1st Floor
            </button>
            <button
                type="button"
                className="bg-white shrink-0 rounded-full border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color"
            >
                2nd Floor
            </button>
            <button
                type="button"
                className="bg-white shrink-0 rounded-full border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color"
            >
                3rd Floor
            </button>
        </div>
        );
}