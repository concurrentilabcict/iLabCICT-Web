import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { ComputerCardType } from "@/types/computer"
import { Download, Upload, Plus } from "lucide-react"

type ButtonGroupType = {
    custodianName: string,
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void,
    setSelectedComputer: Function
}

export default function ButtonGroup({
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
                        
                        <span>Add Device</span>
                    </button>
                </div>

                <div className="flex gap-2.5">
                    <button
                        type="button"
                        className="flex gap-1.5 items-center bg-white shrink-0 rounded-full border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color"
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