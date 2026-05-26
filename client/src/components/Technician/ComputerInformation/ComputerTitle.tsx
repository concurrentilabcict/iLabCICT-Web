

import { Link } from "react-router-dom";
import { ArrowLeft, LaptopMinimal } from "lucide-react";

export default function ComputerTitle(){

    return(
        <div className="flex flex-col gap-2 px-3 py-3">
            <Link className="flex gap-1 items-center" to={"/manage-laboratory/sdl1"}>
                <ArrowLeft size={20}/>
                <span className="text-sm"> Back to Computer List</span>
            </Link>

            <div className="flex gap-1 items-center">
                <div className="bg-[#FFE4DB] p-2 rounded-md">
                    <LaptopMinimal size={24} className="primary-text-color"/>
                </div>
                <span className="text-2xl font-semibold">PC - 2026-008</span>
            </div>

            <div className="flex gap-1 items-center">
                <span className="secondary-text-color text-xs">Windows 11 Pro • SDL 1, Floor 3</span>
            </div>
        
        </div>
    );
}