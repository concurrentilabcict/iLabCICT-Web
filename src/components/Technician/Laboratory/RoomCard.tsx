import { Building, LaptopMinimal, TriangleAlert } from "lucide-react";


export default function RoomCard(){
    return(
        <>
             <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
             rounded-2xl p-3.5 w-full max-w-[420px] md:max-w-[370px]">
                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">SDL 1</h1>                    
                    <h2 className="text-[#10B981]">● Available</h2>
                </div>

                <div className="flex items-center gap-2">
                    <Building className="secondary-text-color" size={16}/>
                    <h1 className="secondary-text-color">Pimentel Hall - Floor 3</h1>
                </div>

                <div className="flex justify-between ">
                    <div className="flex flex-col gap-3 p-3 bg-[#f8fafc] rounded-xl">
                       <span className="flex items-center gap-3 ">
                            <LaptopMinimal size={20}
                                className="primary-text-color"
                            />
                            <h1 className="secondary-text-color">Computers</h1>
                        </span>

                        <span className="font-bold text-2xl">27</span> 
                    </div>

                    <div className="flex flex-col gap-3 p-3 bg-[#f8fafc] rounded-xl">
                       <span className="flex items-center gap-3">
                            <TriangleAlert 
                                className="text-[#FF0000]"
                                size={20}/>
                            <h1 className="secondary-text-color">Active Issues</h1>
                        </span>

                        <span className="font-bold text-2xl">3</span> 
                    </div>
                </div>

                <div className="border-t primary-border-color my-2"></div>
                

                <div className="flex w-full gap-2">
                    <button
                        type="button"
                        className="flex w-full justify-center gap-2.5 bg-white primary-bg-color shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white"
                        >
                        <LaptopMinimal size={20}/> View Computers
                    </button>
                </div>
                



             </div>
        </>
    );
}