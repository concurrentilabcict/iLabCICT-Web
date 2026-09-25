import type { StatusFilter } from "@/utils/ticket";

export type FacultyTicketView = "Recent" | "Older" | "Archived";

type FilterProps = {
  selectedView: FacultyTicketView;
  onViewChange: (view: FacultyTicketView) => void;
  selectedStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
};

const viewOptions: FacultyTicketView[] = ["Recent", "Older", "Archived"];
const statusOptions: StatusFilter[] = ["All", "Open", "Ongoing", "Resolved"];

export default function Filter({ selectedView, onViewChange, selectedStatus, onStatusChange }: FilterProps) {
  return (
    <div className="px-3 pt-3">
      <div className="flex items-center gap-2" aria-label="Ticket status filter">
        {statusOptions.map((status) => (
          <button key={status} type="button" onClick={() => onStatusChange(status)}
            aria-pressed={selectedStatus === status}
            className={`min-w-0 flex-1 cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              selectedStatus === status
                ? "primary-bg-color text-white shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
                : "bg-white text-gray-500 shadow-[0_3px_10px_rgba(15,23,42,0.10)] hover:bg-gray-50"
            }`}>{status}</button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2" aria-label="Ticket age and archive view">
        {viewOptions.map((view) => (
          <button key={view} type="button" onClick={() => onViewChange(view)}
            aria-pressed={selectedView === view}
            className={`min-w-0 flex-1 cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              selectedView === view
                ? "primary-bg-color text-white shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
                : "bg-white text-gray-500 shadow-[0_3px_10px_rgba(15,23,42,0.10)] hover:bg-gray-50"
            }`}>{view}</button>
        ))}
      </div>
    </div>
  );
}
