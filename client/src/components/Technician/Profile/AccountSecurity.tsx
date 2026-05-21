import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function AccountSecurity() {

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>Account Security</h1>
                <div className="h-px w-full bg-[#e5e5e5]" />

                <div className={`flex flex-col mb-5 ${isMobile ? "px-3" : ""}`}>
                    <div className="flex flex-col gap-y-1 sm:mb-5">
                        <span className="font-medium">Email</span>
                        <div className="flex sm:justify-between sm:items-center flex-col gap-y-1 sm:flex-row sm:gap-x-3">
                            <input type="text" className="disable-input mb-1.5 flex-1 min-w-0 sm:max-w-lg" placeholder="patricksoriaga14@gmail.com" />
                        <button className="secondary-button text-sm self-end sm:self-auto font-medium shrink-0 mb-1">Change Email</button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <span className="font-medium">Password</span>
                        <div className="flex sm:justify-between sm:items-center flex-col gap-y-1 sm:flex-row sm:gap-x-3">
                            <input type="text" className="disable-input mb-1.5 flex-1 min-w-0 sm:max-w-lg" placeholder="************" />
                        <button className="secondary-button text-sm self-end sm:self-auto font-medium shrink-0 mb-1">Change Pasword</button>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block h-px w-full bg-[#e5e5e5]" />
            </div>
        </>
    );
}