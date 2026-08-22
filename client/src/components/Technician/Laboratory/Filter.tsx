
import  { floorConfig, type FloorFilter } from "@/utils/room";

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
        <div className="mx-3 my-3 flex flex-nowrap items-center gap-x-2 overflow-x-auto rounded-2xl bg-zinc-200/60 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            {floorOptions.map((floor) => {
                const isSelected = selectedFloor === floor;
                const label = floor === "All" ? "All" : floorConfig[floor];

                return (
                    <button
                        key={floor}
                        type="button"
                        onClick={() => onFloorChange(floor)}
                        className={`shrink-0 cursor-pointer rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                            isSelected
                                ? "primary-bg-color text-white shadow-[0_8px_18px_rgba(191,82,48,0.25)]"
                                : "text-zinc-500 hover:bg-white/60"
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
