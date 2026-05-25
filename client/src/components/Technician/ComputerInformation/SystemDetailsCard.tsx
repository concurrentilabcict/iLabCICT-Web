import { Cpu } from "lucide-react";

export default function SystemDetailsCard(){
    return(
            <>
                <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
                rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px]">
                    
                    <div className="flex gap-2 items-center">
                        <Cpu size={20} className="primary-text-color"/>
                        <span className="text-md font-semibold">Specifications</span>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">CPU</span>

                            <span className="text-sm">Intel Core i7-13700K</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Operating System</span>

                            <span className="text-sm">Windows 11 Pro 23H2</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Storage</span>

                            <span className="text-sm">512 GB SSD</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    
                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">GPU</span>

                            <span className="text-sm">NVIDIA GeForce RTX 4070 12GB</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    
                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">RAM</span>

                            <span className="text-sm">32GB</span>
                        </div>
                        <div className="border-t primary-border-color my-1.5"></div>
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <span className="secondary-text-color text-sm">Build Version</span>

                            <span className="text-sm">22631.4037</span>
                        </div>
                    </div>


                </div>
            </>
        );
}