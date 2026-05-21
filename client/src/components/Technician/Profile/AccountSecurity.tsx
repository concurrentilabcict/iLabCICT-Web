import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function AccountSecurity() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>Account Security</h1>
                <div className="h-px w-full bg-[#e5e5e5]" />

                <div className={`flex flex-col mb-5 ${isMobile ? "px-3" : ""}`}>
                    <div className="flex flex-col gap-y-1">
                        <span className="font-medium">Email</span>
                        <input type="text" className="disable-input mb-1.5" placeholder="patricksoriaga14@gmail.com" />
                        <button className="secondary-button text-sm self-end font-medium">Change Email</button>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <span className="font-medium">Password</span>
                        <input type="text" className="disable-input mb-1.5" placeholder="************" />
                        <button className="secondary-button text-sm self-end font-medium">Change Pasword</button>
                    </div>
                </div>
            </div>
        </>
    );
}