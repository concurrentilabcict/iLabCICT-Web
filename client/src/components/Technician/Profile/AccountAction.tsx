import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function AccountAction() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>Account Actions</h1>
                <div className="h-px w-full bg-[#e5e5e5]" />

                <div className={`flex flex-col mb-5 ${isMobile ? "px-3" : ""}`}>
                    <div className="flex flex-col gap-y-1">
                        <span className="font-medium">Log out</span>
                        <p className="secondary-text-color text-sm">Log out You’ll be signed out of your account on this device.</p>
                        <button className="secondary-button rounded-full! mt-3 text-sm bg-[#FEE2E2]! text-[#B91C1C] font-medium">Log out</button>
                    </div>
                </div>
            </div>
        </>
    );
}