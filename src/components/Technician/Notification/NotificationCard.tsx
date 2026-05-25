import { User } from "lucide-react";


export default function NotificationCard() {
    return (
        <>
            <div className="flex gap-x-3.5 items-start px-3">
                <img src="https://i.pinimg.com/736x/b2/ca/2f/b2ca2f89be542c67a00b2f92b1d972a7.jpg"
                    alt="User Profile" className="w-12 h-auto rounded-full" />

                <div className="flex flex-col">
                    <h1 className="font-medium">Unresponsive Computer</h1>
                    <p className=" text-sm mb-3">The computer is not responding to any input. and its ass wtf is this computer bro?</p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-x-1 items-center secondary-text-color">
                            <User size={12} />
                            <span className='text-xs'>John Patrick Soriaga</span>
                        </div>

                        <span className="text-xs secondary-text-color">10:30 AM</span>
                    </div>
                </div>
            </div>
             <div className="h-px w-full bg-[#e5e5e5]" />
        </>
    );
}