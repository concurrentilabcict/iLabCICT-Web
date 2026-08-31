import { Building2, LaptopMinimal, Layers3, Monitor, TriangleAlert, User, Wrench, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { statusConfig, type Status } from "@/utils/room";
import type { Room } from "@/types/room";

type RoomCardProps = {
    status: Status,
    location:string,
    assignedCustodian: string,
    room: Room
}

export default function RoomCard({
    status,
    location,
    assignedCustodian,
    room
}: RoomCardProps){

    const statusData = statusConfig[status];
    const StatusIcon = statusData.icon
    const technician = room.assignedTechnician
        ? `${room.assignedTechnician.firstName} ${room.assignedTechnician.lastName}`
        : "No Assigned";
    const floorLabel = location.split(" - ")[1]?.split(",")[0] ?? `Floor ${room.floorNumber}`;

    const navigate = useNavigate()
    return(
        <article
            onClick={() =>
                navigate(`/manage-laboratory/${room.id}`, {
                    state: { roomName: room.roomName },
                })
            }
            className="group flex h-full min-h-[360px] w-full max-w-[600px] cursor-pointer flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] md:max-w-[550px]"
        >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fbf2f0] text-[#bf3419]">
                            <LaptopMinimal size={18} />
                        </div>
                        <h1 className="truncate text-lg font-bold leading-snug text-zinc-950">{room.roomName}</h1>
                    </div>
                    
                    <div
                        className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span>{statusData.value}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <InfoTile icon={Monitor} label="Computers" value={String(room.computerCount)} />
                    <InfoTile icon={TriangleAlert} label="Active Issues" value={String(room.activeIssuesCount)} />
                </div>

                <div className="grid gap-3">
                    <InfoTile icon={Building2} label="Building" value={room.buildingName} />
                    <InfoTile icon={Layers3} label="Floor" value={floorLabel} />
                    <InfoTile icon={User} label="Custodian" value={assignedCustodian} />
                    <InfoTile icon={Wrench} label="Assigned Technician" value={technician} />
                </div>
                
                <div className="mt-auto h-px w-full bg-gray-100" />

                <div className="flex w-full gap-2">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/manage-laboratory/${room.id}`, {
                                state: { roomName: room.roomName },
                            });
                        }}
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
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-zinc-50 p-3 shadow-sm shadow-black/[0.01]">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-400">
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{value}</p>
            </div>
        </div>
    );
}
