import { Building2, LaptopMinimal, Monitor, TriangleAlert, User, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { statusConfig, type Status } from "@/utils/room";

type RoomCardProps = {
    status: Status,
    location:string,
    assignedCustodian: string,
    roomName: string,
    computerCount: number,
    activeIssuesCount: number,
    roomId: number
}

export default function RoomCard({
    roomId,
    status,
    location,
    assignedCustodian,
    roomName,
    computerCount,
    activeIssuesCount
}: RoomCardProps){

    const statusData = statusConfig[status];
    const StatusIcon = statusData.icon

    const navigate = useNavigate()
    return(
        <article className="group flex h-full min-h-[290px] w-full max-w-[600px] cursor-pointer flex-col gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] md:max-w-[550px]">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fbf2f0] text-[#bf3419]">
                            <LaptopMinimal size={18} />
                        </div>
                        <h1 className="truncate text-lg font-bold leading-snug text-zinc-950">{roomName}</h1>
                    </div>
                    
                    <div
                        className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span>{status}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <InfoTile icon={Monitor} label="Computers" value={String(computerCount)} />
                    <InfoTile icon={TriangleAlert} label="Active Issues" value={String(activeIssuesCount)} />
                </div>

                <div className="grid gap-3">
                    <InfoTile icon={Building2} label="Location" value={location} />
                    <InfoTile icon={User} label="Custodian" value={assignedCustodian} />
                </div>
                
                <div className="mt-auto h-px w-full bg-gray-100" />

                <div className="flex w-full gap-2">
                    <button
                        onClick={()=> navigate(`/manage-laboratory/${roomName}`)}
                        type="button"
                        className="flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white shadow-md shadow-[#bf3419]/20"
                        >
                        <LaptopMinimal size={17}/> View Computers
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
