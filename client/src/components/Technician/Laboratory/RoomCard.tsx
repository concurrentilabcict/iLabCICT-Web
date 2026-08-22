import { Building2, LaptopMinimal, Layers3, User, Wrench } from "lucide-react";
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
    const custodianTone = assignedCustodian === "No assigned custodian" ? "text-red-500" : "text-zinc-900";
    const technicianTone = technician === "No Assigned" ? "text-red-500" : "text-zinc-900";

    const navigate = useNavigate()
    return(
        <>
        <div
            onClick={() =>
                navigate(`/manage-laboratory/${room.id}`, {
                    state: { roomName: room.roomName },
                })
            }
            className="relative min-h-[290px] w-full max-w-[600px] cursor-pointer overflow-hidden rounded-3xl bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.10)] md:max-w-[550px]"
        >
                <div className="absolute -bottom-10 -right-6 h-44 w-36 rounded-t-[2rem] bg-[#f8eee9]" />
                <div className="absolute bottom-8 right-14 grid grid-cols-3 gap-4 opacity-90">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <span key={index} className="size-3 rounded-full bg-white" />
                    ))}
                </div>

                <div className="relative flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#f8eee9]">
                            <LaptopMinimal className="size-8 primary-text-color" />
                        </div>
                        <h1 className="truncate text-3xl font-bold text-zinc-950">{room.roomName}</h1>
                    </div>
                    <div
                        className={`flex w-fit shrink-0 items-center gap-x-2 rounded-full px-3 py-1.5 text-sm font-bold ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span>{statusData.value}</span>
                    </div>
                </div>

                <div className="relative my-6 h-px bg-zinc-100" />

                <div className="relative grid gap-4 pr-20">
                    <div className="flex items-center gap-4">
                        <span className="grid size-12 place-items-center rounded-xl bg-zinc-50">
                            <Building2 className="size-6 text-zinc-500" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Building</p>
                            <p className="text-lg font-bold text-zinc-900">{room.buildingName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="grid size-12 place-items-center rounded-xl bg-zinc-50">
                            <Layers3 className="size-6 text-zinc-500" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Floor</p>
                            <p className="text-lg font-bold text-zinc-900">{location.split(" - ")[1]?.split(",")[0] ?? room.floorNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="grid size-12 place-items-center rounded-xl bg-zinc-50">
                            <User className="size-6 text-zinc-500" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Custodian</p>
                            <p className={`text-lg font-bold ${custodianTone}`}>{assignedCustodian}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="grid size-12 place-items-center rounded-xl bg-zinc-50">
                            <Wrench className="size-6 text-zinc-500" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Assigned Technician</p>
                            <p className={`text-lg font-bold ${technicianTone}`}>{technician}</p>
                        </div>
                    </div>
                </div>
                
             </div>
                
        </>
    );
}
