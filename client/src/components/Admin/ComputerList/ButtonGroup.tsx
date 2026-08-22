import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { ComputerCardType } from "@/types/computer"
import { Building2, Download, Layers3, LaptopMinimal, Plus, Upload, User, Wrench } from "lucide-react"

type ButtonGroupType = {
    roomName: string,
    buildingName: string,
    floorNumber: number,
    technicianName: string,
    computers: ComputerCardType[] | []
    custodianName: string,
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void
}

const escapeCsvCell = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

export default function ButtonGroup({
    roomName,
    buildingName,
    floorNumber,
    technicianName,
    computers,
    custodianName,
    setSheetOpen,
    setIsEditing
}: ButtonGroupType){

    const handleAddComputerClick = () => {
        setIsEditing(false)
        setSheetOpen(true)
    }


    const isMobile = useMediaQuery("(max-width: 767px)")

    const exportComputers = ()=> {

        if(computers.length===0){
            return;
        }
           
        const headers = [
            "Computer Code",
            "Operating System",
            "GPU",
            "CPU",
            "Motherboard",
            "RAM Installed (GB)",
            "Disk Installed (GB)",
            "Build Version",
            "Computer Status",
            "Monitor Status",
            "Mouse Status",
            "Keyboard Status",
            "UPS Status",
            "Room",
            "Updated At",
            "Created At",
        ];

        const rows = computers.map((computer) => [
            computer.computerCode,
            computer.operatingSystem,
            computer.gpu,
            computer.cpu,
            computer.motherboard,
            computer.ramSizeInstalled,
            computer.diskSizeInstalled,
            computer.buildVersion,
            computer.computerStatus,
            computer.monitorStatus,
            computer.mouseStatus,
            computer.keyboardStatus,
            computer.upsStatus,
            roomName,
            formatDate(computer.updatedAt),
            formatDate(computer.createdAt)
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCsvCell).join(","))
            .join("\r\n");
        const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = `computers-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(url);

    } 

    return(
        <>

        <div className="mx-3 my-3 overflow-hidden rounded-3xl primary-bg-color p-4 text-white shadow-[0_16px_38px_rgba(191,82,48,0.22)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
                <div className="flex flex-1 items-center gap-4 rounded-2xl bg-white/95 p-4 text-zinc-950">
                    <div>
                        <h1 className="text-4xl font-bold leading-none">{roomName}</h1>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-zinc-600">
                            <span className="flex items-center gap-1.5"><Building2 className="size-4 text-zinc-400" />{buildingName || "No building"}</span>
                            <span className="flex items-center gap-1.5"><Layers3 className="size-4 text-zinc-400" />{floorNumber ? `Floor ${floorNumber}` : "No floor"}</span>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleAddComputerClick}
                    className="flex min-w-[220px] items-center justify-center gap-3 rounded-2xl bg-white/10 px-5 py-5 text-2xl font-bold text-white ring-1 ring-white/15 hover:cursor-pointer"
                >
                    <div>
                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60">
                            <LaptopMinimal className="size-5" /> Computers <span className="text-3xl tracking-normal text-white">{computers.length}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <Plus className="size-7" /> Add Computer
                        </div>
                    </div>
                </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-red-500/75 px-4 py-3 font-bold">
                    <User className="size-5 text-white/70" />
                    <span className="uppercase tracking-[0.2em] text-white/60">Custodian</span>
                    <span>{custodianName || "No Assigned"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 font-bold">
                    <Wrench className="size-5 text-white/70" />
                    <span className="uppercase tracking-[0.2em] text-white/60">Technician</span>
                    <span>{technicianName || "No Assigned"}</span>
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2.5">
                <button
                    onClick={exportComputers}
                    type="button"
                    className="flex gap-1.5 items-center rounded-full bg-white px-4 py-2 text-sm font-medium secondary-text-color shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:cursor-pointer"
                >
                    <Download size={16}/>
                    <span className={isMobile ? 'hidden' : ''} >Export</span>
                </button>
                <button
                    type="button"
                    className="flex gap-1.5 items-center rounded-full bg-white px-4 py-2 text-sm font-medium secondary-text-color shadow-[0_8px_24px_rgba(15,23,42,0.10)]"
                >
                    <Upload size={16}/>
                    <span className={isMobile ? 'hidden' : ''}>Import</span>
                </button>
            </div>
        </div>
            
        </>
    )
}
