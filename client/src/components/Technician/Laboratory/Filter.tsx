
import  { floorConfig, type FloorFilter, type Floor } from "@/utils/room";

type FilterProps = {
    selectedFloor: FloorFilter;
    onFloorChange: (floor: FloorFilter) => void;
}
const floorOptions: FloorFilter[] = ["All", 1, 2, 3]


export default function Filter({
    selectedFloor,
    onFloorChange
}: FilterProps){
    return (
        <div className="flex flex-nowrap items-center gap-x-2 overflow-x-auto px-3 py-3">
            {floorOptions.map((floor) => {
                const isSelected = selectedFloor === floor;
                const label = floor === "All" ? "All" : floorConfig[floor];

                return (
                    <button
                        key={floor}
                        type="button"
                        onClick={() => onFloorChange(floor)}
                        className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            isSelected
                                ? "primary-bg-color text-white"
                                : "bg-white border primary-border-color secondary-text-color hover:bg-gray-50"
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}