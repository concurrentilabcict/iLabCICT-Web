import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { ComputerCardType } from "@/types/computer"
import { Building2, Download, Eye, Layers3, LaptopMinimal, Plus, Upload, User, Wrench } from "lucide-react"

type ButtonGroupType = {
    roomName: string,
    buildingName: string,
    floorNumber: number,
    technicianName: string,
    computers: ComputerCardType[] | []
    custodianName: string,
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void
    onRequestHistoryClick: () => void,
    isRequestHistoryDisabled: boolean
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
    setIsEditing,
    onRequestHistoryClick,
    isRequestHistoryDisabled
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

        <div className="mx-3 my-3 rounded-2xl border border-gray-200 bg-white p-4">
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
                    className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl primary-bg-color px-3.5 text-sm font-semibold text-white hover:cursor-pointer"
                >
                    <Plus size={17} /> Add Computer
                </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-gray-100 bg-zinc-50 p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-400"><User size={16} /></span>
                    <div className="min-w-0">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Custodian</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-zinc-800">{custodianName || "No Assigned"}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-gray-100 bg-zinc-50 p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-400"><Wrench size={16} /></span>
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
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-[#bf3419] bg-white px-3.5 text-sm font-semibold primary-text-color disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Eye size={16} />
                    <span>Request History</span>
                </button>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={exportComputers}
                        type="button"
                        className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color hover:cursor-pointer hover:bg-gray-50"
                    >
                        <Download size={16}/>
                        <span className={isMobile ? 'hidden' : ''} >Export</span>
                    </button>
                    <button
                        type="button"
                        className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color hover:bg-gray-50"
                    >
                        <Upload size={16}/>
                        <span className={isMobile ? 'hidden' : ''}>Import</span>
                    </button>
                </div>
            </div>
        </div>
            
        </>
    )
}
