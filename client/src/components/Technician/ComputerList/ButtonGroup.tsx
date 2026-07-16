import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { ComputerCardType } from "@/types/computer"
import { Download, Upload, Plus } from "lucide-react"
import toast from "react-hot-toast";
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

type ButtonGroupType = {
    roomName: string
    computers: ComputerCardType[] | []
    custodianName: string,
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void,
    setSelectedComputer: Function
}

const escapeCsvCell = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
};

export default function ButtonGroup({
    roomName,
    computers,
    custodianName,
    setSheetOpen,
    setIsEditing,
    setSelectedComputer
}: ButtonGroupType){

    const handleAddComputerClick = () => {
        setSelectedComputer(null);
        setIsEditing(false)
        setSheetOpen(true)
    }

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


    const isMobile = useMediaQuery("(max-width: 767px)")

    return(
        <>

        <div className="flex flex-col px-3 py-2 gap-2">
            <div className="flex items-center justify-between gap-x-2">
                <div>
                    <button
                    type="button"
                    onClick={handleAddComputerClick}
                    className="flex gap-1.5 items-center bg-white primary-bg-color shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white hover:cursor-pointer"
                    >
                        <Plus size={16}/> 
                        <span>Add Computer</span>
                    </button>
                        
                </div>

                <div className="flex gap-2.5">
                    <button
                        onClick={exportComputers}
                        type="button"
                        className="flex gap-1.5 items-center bg-white shrink-0 rounded-full border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color hover:cursor-pointer"
                    >
                        <Download size={16}/>
                        <span className={isMobile ? 'hidden' : ''} >Export</span>
                    </button>

                    <button
                        
                        type="button"
                        className="flex gap-1.5 items-center bg-white shrink-0 rounded-full border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color"
                    >
                        <Upload size={16}/>
                        <span className={isMobile ? 'hidden' : ''}>Import</span>
                    </button>

                    
                </div>

            </div>

            <div className="flex gap-1">
                <span className="text-sm secondary-text-color">Custodian: {custodianName || "No assigned custodian"}</span>
            </div>
        </div>
            
        </>
    )
}