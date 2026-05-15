import { useEffect, useState } from "react";
import Logo from "@/assets/logo.png";

export default function NavBar() {
    const [showNav, setShowNav] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                setShowNav(false);
            } else {
                setShowNav(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <div
                className={`
                    fixed top-0 left-0 w-full z-50
                    transition-transform duration-500 ease-in-out bg-white
                    ${showNav ? "translate-y-0" : "-translate-y-full"}
                `}
            >
                <div className="flex items-center justify-between py-5 px-5 lg:px-15">
                    <button className="button-navbar !text-black group">
                        <div className="flex flex-col items-center transition-transform
                        duration-400 group-hover:-translate-y-1/2">
                            <span className="flex items-center h-[40px]">CONTACT</span>
                            <span className="font-secondary flex items-center h-[40px]">CONTACT</span>
                        </div>
                    </button>

                    <img src={Logo} alt="ILabCICT Logo" className="w-13 pr-3 h-auto" />

                    <button className="button-navbar !text-black group">
                        <div className="flex flex-col items-center transition-transform
                        duration-400 group-hover:-translate-y-1/2">
                            <span className="flex items-center h-[40px]">LOGIN</span>
                            <span className="font-secondary flex items-center h-[40px]">LOGIN</span>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}