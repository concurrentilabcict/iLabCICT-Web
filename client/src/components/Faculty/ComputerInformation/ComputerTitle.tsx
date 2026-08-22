

import { Link } from "react-router-dom";
import { ArrowLeft, LaptopMinimal } from "lucide-react";

type ComputerTitleType = {
    computerCode: string,
    address: string,
    room: string
}

export default function ComputerTitle({
    computerCode,
    room
}:ComputerTitleType){

    return(
        <div className="flex flex-col gap-2 px-3 pt-3">
            <Link className="flex gap-1 items-center" to={`/manage-laboratory/${room}`}>
                <ArrowLeft size={20}/>
                <span className="text-sm"> Back to Computer List</span>
            </Link>

            <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
                    <LaptopMinimal size={18}/>
                </div>
                <span className="text-lg font-bold leading-snug text-zinc-950">{computerCode}</span>
            </div>
        
        </div>
    );
}
