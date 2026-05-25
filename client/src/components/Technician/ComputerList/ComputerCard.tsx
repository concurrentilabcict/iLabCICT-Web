import { LaptopMinimal, Calendar, SquarePen, Trash, HardDrive} from "lucide-react";


export default function ComputerCard(){
    return(
        <>
             <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
             rounded-2xl p-3.5 w-full max-w-[420px] md:max-w-[370px]">
                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">PC-2026-003</h1>                    
                </div>

                <div className="flex items-center gap-2">
                    <h1 className="secondary-text-color text-sm">Windows 11 Pro</h1>
                </div>

                <div className="flex justify-between ">
                    
                    <div className="flex gap-1.5 items-center">
                        <LaptopMinimal className="primary-text-color" size={22}/>
                        <span className="font-light secondary-text-color text-sm">PC-28</span>
                    </div>

                    <div className="flex gap-1.5 items-center">
                        <Calendar className="secondary-text-color" size={22}/>
                        <span className="font-light secondary-text-color text-sm">2 days ago</span>
                    </div>
                </div>

                <div className="border-t primary-border-color my-2"></div>
                

                <div className="flex w-full gap-2">
                    <button
                        type="button"
                        className="flex flex-1 justify-center shrink-0 gap-2.5 bg-white primary-bg-color rounded-md px-4 py-2 text-sm font-medium text-white"
                        >
                        <HardDrive size={20}/> View Specifications
                    </button>

                    <button
                        type="button"
                        className="bg-white shrink-0 rounded-md border primary-border-color px-4 py-2 text-sm font-medium secondary-text-color"
                    >
                        <SquarePen size={20} className="secondary-text-color"/>
                    </button>

                    <button
                        type="button"
                        className="bg-white shrink-0 rounded-md border primary-border-color px-4 py-2 text-sm font-medium"
                    >
                        <Trash size={20} className="text-[#FF0000]"/>
                    </button>
                </div>
                



             </div>
        </>
    );
}