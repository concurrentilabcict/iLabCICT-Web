import { Cpu, HardDrive, LaptopMinimal, MemoryStick, type LucideIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { statusConfig, type Status } from "@/utils/computer";
import type { ComputerCardType } from "@/types/computer";

type CompCardType = {
    computer: ComputerCardType
}
const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export default function ComputerCard({computer}: CompCardType){


    const statusData = statusConfig[formatLabel(computer.computerStatus) as Status];
    const StatusIcon = statusData.icon

    const {room} = useParams()
    const navigate = useNavigate()
    return(
        <>
             <article className="group flex h-full min-h-[300px] w-full max-w-[600px] cursor-pointer flex-col gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] md:max-w-[550px]">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl primary-bg-color text-white shadow-md shadow-[#bf3419]/20">
                            <LaptopMinimal size={18} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold leading-snug text-zinc-950">{computer.computerCode}</h1>
                            <p className="mt-0.5 truncate text-sm font-medium text-zinc-500">{computer.operatingSystem}</p>
                        </div>
                    </div>
                    <div
                        className={`flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span>{formatLabel(computer.computerStatus)}</span>
                    </div>                    
                </div>

                <div className="grid gap-2.5">
                    <InfoTile icon={Cpu} label="Processor" value={computer.cpu} />
                    <InfoTile icon={LaptopMinimal} label="Graphics" value={computer.gpu} />
                    <InfoTile icon={MemoryStick} label="Memory" value={`${computer.ramSizeInstalled} GB RAM`} />
                </div>

                <div className="mt-auto border-t border-gray-100 pt-3">
                    <button
                        onClick={()=>navigate(`/manage-laboratory/${room}/${computer.computerCode}`)}
                        type="button"
                        className="flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white shadow-md shadow-[#bf3419]/20"
                        >
                        <HardDrive size={17}/> View Specifications
                    </button>
                </div>
             </article>
        </>
    );
}

type InfoTileProps = {
    icon: LucideIcon;
    label: string;
    value: string;
};

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
    return (
        <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-zinc-50 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400">
                <Icon size={16} />
            </span>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{value}</p>
            </div>
        </div>
    );
}
