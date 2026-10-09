import { Archive, Cpu, Download, HardDrive, Hash, LaptopMinimal, LoaderCircle, MemoryStick, SquarePen, type LucideIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { statusConfig, type Status } from "@/utils/computer";
import type { ComputerCardType } from "@/types/computer";
import ComputerArchiveAction from "@/components/ComputerArchiveAction/ComputerArchiveAction";
import { downloadComputerQrPng } from "@/utils/computerQr";
import { appToast } from "@/utils/appToast";

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
    const [isExportingQr, setIsExportingQr] = useState(false);

    const handleEditComputerClick = (computer: ComputerCardType) => {
            setSelectedComputer(computer)
            setIsEditing(true)
            setSheetOpen(true)
        }

    const statusData = statusConfig[formatLabel(computer.computerStatus) as Status];
    const StatusIcon = computer.isArchived ? Archive : statusData.icon

    const {room} = useParams()
    const navigate = useNavigate()

    const handleExportQr = async () => {
        if (!room || isExportingQr) return;

        setIsExportingQr(true);
        try {
            await downloadComputerQrPng({
                computerCode: computer.computerCode,
                computerNumber: computer.computerNumber,
                roomName: room,
            });
            appToast.success("Computer QR exported successfully.");
        } catch (error) {
            appToast.error(
                error instanceof Error ? error.message : "We couldn't export the computer QR. Please try again."
            );
        } finally {
            setIsExportingQr(false);
        }
    };

    return(
        <article className="group flex w-full cursor-pointer flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
                            <LaptopMinimal size={18} />
                        </span>
                        <h1 className="truncate text-lg font-bold leading-snug text-zinc-950">{computer.computerCode}</h1>
                    </div>
                    <div
                        className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${computer.isArchived ? "bg-zinc-100 text-zinc-600" : statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span>{computer.isArchived ? "Archived" : formatLabel(computer.computerStatus)}</span>
                    </div>                    
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
                    {computer.computerNumber !== null && computer.computerNumber !== undefined && String(computer.computerNumber).trim() !== "" && (
                        <InfoTile icon={Hash} label="Computer No." value={String(computer.computerNumber)} highlight />
                    )}
                    <InfoTile icon={Cpu} label="CPU" value={computer.cpu} />
                    <InfoTile icon={HardDrive} label="GPU" value={computer.gpu} />
                    <InfoTile icon={MemoryStick} label="Memory" value={`${computer.ramSizeInstalled}GB RAM`} />
                </div>

                <div className="mt-auto h-px w-full bg-gray-100" />

                <div className="flex w-full gap-2 sm:justify-end">
                    <button
                        onClick={()=>navigate(`/manage-laboratory/${room}/${computer.computerCode}`)}
                        type="button"
                        className="flex h-9 min-w-0 flex-1 items-center sm:flex-none justify-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white"
                        >
                        <HardDrive className="size-[17px] shrink-0" />
                        <span className="truncate">View Specifications</span>
                    </button>

                    <button
                        onClick={handleExportQr}
                        type="button"
                        title="Export QR as PNG"
                        aria-label={`Export QR for ${computer.computerCode}`}
                        disabled={isExportingQr}
                        className="grid h-9 w-10 shrink-0 place-items-center rounded-xl border primary-border-color bg-white text-zinc-500 hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isExportingQr
                            ? <LoaderCircle className="size-[17px] animate-spin" />
                            : <Download size={17} />}
                    </button>

                    {!computer.isArchived && <button
                        onClick={()=>handleEditComputerClick(computer)}
                        type="button"
                        title="Edit computer"
                        aria-label={`Edit ${computer.computerCode}`}
                        className="grid h-9 w-10 shrink-0 place-items-center rounded-xl border primary-border-color bg-white text-zinc-500 hover:cursor-pointer hover:bg-gray-50"
                    >
                        <SquarePen size={17}/>
                    </button>}
                    <ComputerArchiveAction computer={computer} queryKey={["admin-room-computers", room ?? ""]} />

                </div>
             </article>
    );
}

type InfoTileProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    highlight?: boolean;
};

function InfoTile({ icon: Icon, label, value, highlight = false }: InfoTileProps) {
    return (
        <div className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-3 ${highlight ? "border-red-100 bg-red-50/40" : "border-gray-100 bg-zinc-50"}`}>
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-white ${highlight ? "primary-text-color" : "text-zinc-400"}`}>
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <p className={`text-[0.65rem] font-bold uppercase tracking-[0.12em] ${highlight ? "primary-text-color" : "text-zinc-400"}`}>{label}</p>
                <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{value}</p>
            </div>
        </div>
    );
}
