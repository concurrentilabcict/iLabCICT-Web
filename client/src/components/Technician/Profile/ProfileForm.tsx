import { useMediaQuery } from "@/hooks/useMediaQuery";

import { Image } from 'lucide-react';

export default function ProfileForm() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    return(
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-medium ${isMobile ? "px-3" : ""}`}>My Profile</h1>
                 <div className="h-px w-full bg-[#e5e5e5]" />

                 <div className={`flex gap-x-4 ${isMobile ? "px-3" : ""}`}>
                    <img src="https://github.com/shadcn.png" alt="" className="w-15 h-auto rounded-full" />

                    <div className="flex flex-col gap-y-2">
                        <div className="flex text-sm gap-x-2">
                            <button className="flex gap-x-1 items-center primary-button">
                                <Image size={14} />
                                Change Image
                            </button>
                    
                           <button className="secondary-button">
                                Remove Image
                            </button>
                        </div>

                        <p className="secondary-text-color text-xs">We support PNGs, JPEGs, and WEBP</p>
                    </div>
                 </div>

                 <div className={`flex justify-between gap-x-2 ${isMobile ? "px-3" : ""}`}>
                    <div className="flex flex-col gap-y-1">
                        <span>First Name</span>
                        <input type="text" className="primary-input" placeholder="John Patrick" />
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <span>First Name</span>
                        <input type="text" className="primary-input" placeholder="John Patrick" />
                    </div>
                 </div>
            </div>
        </>
    );
}