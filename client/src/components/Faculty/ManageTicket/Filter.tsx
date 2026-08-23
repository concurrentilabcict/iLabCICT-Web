import type { StatusFilter } from "@/utils/ticket";

type FilterProps = {
  selectedStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
};

const statusOptions: StatusFilter[] = ["All", "Open", "Ongoing", "Resolved"];

export default function Filter({ selectedStatus, onStatusChange }: FilterProps) {
  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 py-3">
      {statusOptions.map((status) => {
        const isSelected = selectedStatus === status;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onStatusChange(status)}
	            className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
	              isSelected
	                ? "primary-bg-color text-white shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
	                : "bg-white text-gray-500 shadow-[0_3px_10px_rgba(15,23,42,0.10)] hover:bg-gray-50"
	            }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}
