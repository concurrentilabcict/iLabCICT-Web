import { useMediaQuery } from "@/hooks/useMediaQuery";

import { Image } from 'lucide-react';

export default function ProfileForm() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    const fName = "John Patrick"
    const lName = "Soriaga"

    return(
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>My Profile</h1>
                 <div className="h-px w-full bg-[#e5e5e5]" />

                 <div className={`flex gap-x-4 ${isMobile ? "px-3" : ""}`}>
                    <img src="https://i.pinimg.com/736x/b2/ca/2f/b2ca2f89be542c67a00b2f92b1d972a7.jpg" alt="" className="w-15 h-auto rounded-full" />

                    <div className="flex flex-col gap-y-2">
                        <div className="flex font-medium text-sm gap-x-2">
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

                 <div className={`flex mb-5 gap-x-2 ${isMobile ? "px-3" : ""}`}>
                    <div className="flex flex-col gap-y-1 w-full">
                        <span className="font-medium">First Name</span>
                        <input type="text" value={fName} className="primary-input" />
                    </div>

                    <div className="flex flex-col gap-y-1 w-full">
                        <span className="font-medium">Last Name</span>
                        <input type="text" value={lName} className="primary-input" />
                    </div>
                 </div>
            </div>
        </>
    );
}