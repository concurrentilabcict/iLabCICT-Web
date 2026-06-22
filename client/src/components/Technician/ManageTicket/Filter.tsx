
import type { StatusFilter } from "@/utils/ticket";

type FilterProps = {
    selectedStatus: StatusFilter;
    onStatusChange: (status: StatusFilter) => void;
};

const statusOptions: StatusFilter[] = ["All", "Open", "Ongoing", "Resolved"];

export default function Filter({
    selectedStatus,
    onStatusChange,
}: FilterProps) {
    return (
        <div className="flex flex-nowrap items-center gap-x-2 overflow-x-auto px-3 py-3">
            {statusOptions.map((status) => {
                const isSelected = selectedStatus === status;

                return (
                    <button
                        key={status}
                        type="button"
                        onClick={() => onStatusChange(status)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            isSelected
                                ? "primary-bg-color text-white"
                                : "bg-white border primary-border-color secondary-text-color hover:bg-gray-50"
                        }`}
                    >
                        {status}
                    </button>
                );
            })}
        </div>
    );
}
