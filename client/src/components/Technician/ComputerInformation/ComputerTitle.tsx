import { LaptopMinimal } from "lucide-react";

type ComputerTitleType = {
    computerCode: string,
    address: string,
    room: string
}

export default function ComputerTitle({
    computerCode,
}:ComputerTitleType){

    return(
        <div className="px-3 pt-3">
            <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
                    <LaptopMinimal size={18}/>
                </div>
                <span className="text-lg font-bold leading-snug text-zinc-950">{computerCode}</span>
            </div>
        </div>
    );
}
