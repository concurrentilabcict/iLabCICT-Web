

import { Link } from "react-router-dom";
import { ArrowLeft, LaptopMinimal } from "lucide-react";
import { MapPin } from "lucide-react";


type ComputerTitleType = {
    computerCode: string,
    address: string,
    room: string
}

export default function ComputerTitle({
    computerCode,
    address,
    room
}:ComputerTitleType){

    return(
        <div className="flex flex-col gap-2 px-3 pt-3">
            <Link className="flex gap-1 items-center" to={`/manage-laboratory/${room}`}>
                <ArrowLeft size={20}/>
                <span className="text-sm"> Back to Computer List</span>
            </Link>

            <div className="flex gap-1 items-center">
                <div className="bg-[#FFE4DB] p-2 rounded-md">
                    <LaptopMinimal size={24} className="primary-text-color"/>
                </div>
                <span className="text-2xl font-semibold">{computerCode}</span>
            </div>

            <div className="flex gap-1 items-center">
                <MapPin className={'secondary-text-color'} size={12}/>
                <span className="secondary-text-color text-sm">{address}</span>
            </div>
        
        </div>
    );
}