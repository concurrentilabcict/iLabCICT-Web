import { Cpu, HardDrive, LaptopMinimal, MemoryStick, SquarePen, type LucideIcon } from "lucide-react";
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
        <article className="group flex h-full min-h-[300px] w-full max-w-[600px] cursor-pointer flex-col gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] md:max-w-[550px]">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
                            <LaptopMinimal size={18} />
                        </span>
                        <h1 className="truncate text-lg font-bold leading-snug text-zinc-950">{computer.computerCode}</h1>
                    </div>
                    <div
                        className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span>{formatLabel(computer.computerStatus)}</span>
                    </div>                    
                </div>

                <div className="grid gap-3">
                    <InfoTile icon={Cpu} label="CPU" value={computer.cpu} />
                    <InfoTile icon={HardDrive} label="GPU" value={computer.gpu} />
                    <InfoTile icon={MemoryStick} label="Memory" value={`${computer.ramSizeInstalled}GB RAM`} />
                </div>

                <div className="mt-auto h-px w-full bg-gray-100" />

                <div className="flex w-full gap-2">
                    <button
                        onClick={()=>navigate(`/manage-laboratory/${room}/${computer.computerCode}`)}
                        type="button"
                        className="flex h-9 flex-1 shrink-0 items-center justify-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white shadow-md shadow-[#bf3419]/20"
                        >
                        <HardDrive size={17}/> View Specifications
                    </button>

                    <button
                        onClick={()=>handleEditComputerClick(computer)}
                        type="button"
                        className="grid h-9 w-10 shrink-0 place-items-center rounded-xl border primary-border-color bg-white text-zinc-500 shadow-sm shadow-black/5 hover:cursor-pointer hover:bg-gray-50"
                    >
                        <SquarePen size={17}/>
                    </button>

                </div>
             </article>
    );
}

type InfoTileProps = {
    icon: LucideIcon;
    label: string;
    value: string;
};

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
    return (
        <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3 shadow-sm shadow-black/[0.01]">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400">
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{value}</p>
            </div>
        </div>
    );
}
