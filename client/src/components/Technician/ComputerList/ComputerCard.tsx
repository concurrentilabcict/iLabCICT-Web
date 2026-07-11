import { LaptopMinimal, Calendar, SquarePen, Trash, HardDrive, History} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { statusConfig, type Status } from "@/utils/computer";
import { formatDateTime } from "@/utils/string";
import type { ComputerCardType } from "@/types/computer";

type CompCardType = {
    computer: ComputerCardType
    setSelectedComputer: Function
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
             <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
        rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px] cursor-pointer">
                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">{computer.computerCode}</h1>
                    <div
                        className={`flex w-fit gap-x-2 items-center px-3 py-1.5 rounded-md ${statusData.className}`}
                    >
                        <StatusIcon size={14} />
                        <span className="text-sm">{formatLabel(computer.computerStatus)}</span>
                    </div>                    
                </div>

                <div className="flex items-center gap-2">
                    <h1 className="secondary-text-color text-sm">{computer.operatingSystem}</h1>
                </div>

                <div className="flex justify-between ">

                    <div className="flex gap-1.5 items-center">
                        <History className="secondary-text-color" size={22}/>
                        <span className="font-light secondary-text-color text-sm">{formatDateTime(computer.updatedAt)}</span>
                    </div>
                </div>

                <div className="border-t primary-border-color my-2"></div>
                

                <div className="flex w-full gap-2">
                    <button
                        onClick={()=>navigate(`/manage-laboratory/${room}/${computer.computerCode}`)}
                        type="button"
                        className="flex flex-1 justify-center shrink-0 gap-2.5 bg-white primary-bg-color rounded-md px-4 py-2 text-sm font-medium text-white"
                        >
                        <HardDrive size={20}/> View Specifications
                    </button>

                    <button
                        onClick={()=>handleEditComputerClick(computer)}
                        type="button"
                        className="bg-white shrink-0 rounded-md border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color hover: cursor-pointer"
                    >
                        <SquarePen size={20} className="secondary-text-color"/>
                    </button>

                </div>
             </div>
        </>
    );
}