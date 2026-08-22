import { Cpu, HardDrive, LaptopMinimal, MemoryStick, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { statusConfig, type Status } from "@/utils/computer";
import type { ComputerCardType } from "@/types/computer";

type CompCardType = {
    computer: ComputerCardType
    setSelectedComputer: (computer: ComputerCardType) => void
    setIsEditing: (open: boolean) => void,
    setSheetOpen: (open: boolean) => void
}
const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export default function ComputerCard({
    computer,
    setSelectedComputer,
    setIsEditing,
    setSheetOpen,
}: CompCardType){

    const handleEditComputerClick = (computer: ComputerCardType) => {
            setSelectedComputer(computer)
            setIsEditing(true)
            setSheetOpen(true)
        }

    const statusData = statusConfig[formatLabel(computer.computerStatus) as Status];
    const StatusIcon = statusData.icon

    const {room} = useParams()
    const navigate = useNavigate()
    return(
        <>
             <div className="relative min-h-[230px] w-full max-w-[600px] cursor-pointer overflow-hidden rounded-3xl bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.10)] md:max-w-[550px]">
                <div className="absolute -bottom-8 -right-10 h-36 w-40 rounded-t-3xl bg-zinc-100" />
                <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#f8eee9]">
                            <LaptopMinimal className="size-8 primary-text-color" />
                        </span>
                        <h1 className="truncate text-3xl font-bold text-zinc-950">{computer.computerCode}</h1>
                    </div>
                    <div
                        className={`flex w-fit shrink-0 gap-x-2 items-center px-3 py-1.5 rounded-full text-sm font-bold ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span>{formatLabel(computer.computerStatus)}</span>
                    </div>                    
                </div>

                <div className="relative mt-8 grid gap-4 pr-24">
                    <div className="flex items-center gap-4 text-lg font-bold text-zinc-600">
                        <Cpu className="size-5 text-zinc-500" />
                        <span className="truncate">{computer.cpu}</span>
                    </div>
                    <div className="flex items-center gap-4 text-lg font-bold text-zinc-600">
                        <HardDrive className="size-5 text-zinc-500" />
                        <span className="truncate">{computer.gpu}</span>
                    </div>
                    <div className="flex items-center gap-4 text-lg font-bold text-zinc-600">
                        <MemoryStick className="size-5 text-zinc-500" />
                        <span>{computer.ramSizeInstalled}GB RAM</span>
                    </div>
                </div>
                

                <div className="relative mt-6 flex w-full gap-2">
                    <button
                        onClick={()=>navigate(`/manage-laboratory/${room}/${computer.computerCode}`)}
                        type="button"
                        className="flex flex-1 justify-center shrink-0 gap-2.5 primary-bg-color rounded-xl px-4 py-2 text-sm font-bold text-white"
                        >
                        <HardDrive size={20}/> View Specifications
                    </button>

                    <button
                        onClick={()=>handleEditComputerClick(computer)}
                        type="button"
                        className="bg-white shrink-0 rounded-xl px-4 py-2 text-sm font-medium secondary-text-color shadow-[0_8px_22px_rgba(15,23,42,0.10)] hover: cursor-pointer"
                    >
                        <SquarePen size={20} className="secondary-text-color"/>
                    </button>

                </div>
             </div>
        </>
    );
}
