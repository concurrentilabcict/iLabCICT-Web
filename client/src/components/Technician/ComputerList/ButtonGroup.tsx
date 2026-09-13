import type { ComputerCardType } from "@/types/computer"
import { Building2, Eye, Layers3, LaptopMinimal, Plus, User, Wrench } from "lucide-react"
import ComputerExcelActions from "@/components/ComputerExcelActions/ComputerExcelActions"

type ButtonGroupType = {
    roomName: string
    buildingName: string
    floorNumber: number
    technicianName: string
    computers: ComputerCardType[] | []
    custodianName: string,
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void
    onRequestHistoryClick: () => void,
    isRequestHistoryDisabled: boolean
    roomId: number | null
}

export default function ButtonGroup({
    roomName,
    buildingName,
    floorNumber,
    technicianName,
    computers,
    custodianName,
    setSheetOpen,
    setIsEditing,
    onRequestHistoryClick,
    isRequestHistoryDisabled,
    roomId
}: ButtonGroupType){

    const handleAddComputerClick = () => {
        setIsEditing(false)
        setSheetOpen(true)
    }

    return(
        <>

        <div className="mx-3 my-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold leading-snug text-zinc-950">{roomName}</h1>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-zinc-500">
                        <span className="flex items-center gap-1.5"><Building2 className="size-4 text-zinc-400" />{buildingName || "No building"}</span>
                        <span className="flex items-center gap-1.5"><Layers3 className="size-4 text-zinc-400" />{floorNumber ? `Floor ${floorNumber}` : "No floor"}</span>
                        <span className="flex items-center gap-1.5"><LaptopMinimal className="size-4 text-zinc-400" />{computers.length} computers</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleAddComputerClick}
                    className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white shadow-md shadow-[#bf3419]/20 hover:cursor-pointer"
                >
                    <Plus size={17} /> Add Computer
                </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400"><User size={16} /></span>
                    <div className="min-w-0">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Custodian</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{custodianName || "No Assigned"}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400"><Wrench size={16} /></span>
                    <div className="min-w-0">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Technician</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{technicianName || "No Assigned"}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2.5 border-t border-gray-100 pt-4">
                <button
                    type="button"
                    onClick={onRequestHistoryClick}
                    disabled={isRequestHistoryDisabled}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-[#bf3419] bg-white px-3.5 text-sm font-semibold primary-text-color shadow-sm shadow-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Eye size={16} />
                    <span>Request History</span>
                </button>
                <ComputerExcelActions
                        roomId={roomId}
                        roomName={roomName}
                        buildingName={buildingName}
                        floorNumber={floorNumber}
                        computers={computers}
                        buttonClassName="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color shadow-sm shadow-black/5 hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>
        </div>
            
        </>
    )
}
