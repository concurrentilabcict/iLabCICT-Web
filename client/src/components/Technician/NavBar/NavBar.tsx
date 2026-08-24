import {
    ScrollText,
    Monitor,
    ClipboardList,
    ScanQrCode,
} from 'lucide-react';

import MoreMenu from "./MoreMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { useEffect, useState } from "react";

export default function NavBar() {

    const { pathname } = useLocation();

    const navigate = useNavigate();
    const { role } = useAuth();
    const isFaculty = role === "faculty";
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const isTypingTarget = (target: EventTarget | null) => {
            if (!(target instanceof HTMLElement)) return false;
            const tagName = target.tagName.toLowerCase();
            return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
        };

        const handleFocusIn = (event: FocusEvent) => {
            setIsTyping(isTypingTarget(event.target));
        };

        const handleFocusOut = () => {
            setIsTyping(false);
        };

        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);

        return () => {
            document.removeEventListener("focusin", handleFocusIn);
            document.removeEventListener("focusout", handleFocusOut);
        };
    }, []);

    if (isTyping) return null;

    const navBarClass =
        "fixed inset-x-0 bottom-0 z-10 bg-white border-t border-t-[#e5e5e5] pb-[env(safe-area-inset-bottom)]";
    const navContentClass =
        "relative mx-auto grid h-20 max-w-[430px] grid-cols-5 items-end overflow-visible bg-white px-2 pb-3";
    const facultyNavContentClass =
        "relative mx-auto grid h-20 max-w-[430px] grid-cols-4 items-end overflow-visible bg-white px-2 pb-3";
    const navButtonClass =
        "relative z-10 flex h-16 min-w-0 cursor-pointer flex-col items-center justify-end gap-y-1 rounded-2xl px-1 text-center transition";
    const inactiveNavClass = "secondary-text-color hover:text-gray-700";
    const activeNavClass = "primary-text-color";
    const qrButtonClass =
        "primary-bg-color relative z-10 mx-auto flex h-14 w-14 -translate-y-1 cursor-pointer items-center justify-center self-end rounded-full text-white transition hover:bg-[#d0472c]";

    if (isFaculty) {
        return (
            <nav className={navBarClass}>
                <div className={facultyNavContentClass}>
                <button
                    onClick={() => navigate("/manage-ticket")}
                    type="button"
                    className={`${navButtonClass}
                    ${pathname === "/manage-ticket"
                        ? activeNavClass
                        : inactiveNavClass
                    }`}
                >
                    <ScrollText size={23} />
                    <span className='text-sm'>Tickets</span>
                </button>

                <button
                    onClick={() => navigate("/manage-laboratory")}
                    type="button"
                    className={`${navButtonClass}
                    ${pathname.startsWith("/manage-laboratory")
                        ? activeNavClass
                        : inactiveNavClass
                    }`}
                >
                    <Monitor size={23} />
                    <span className='text-sm'>Laboratory</span>
                </button>

                <button
                    onClick={() => navigate("/qr-scanner")}
                    type="button"
                    className={qrButtonClass}
                    aria-label="QR Code"
                >
                    <ScanQrCode size={30} />
                </button>

                <MoreMenu
                    isActive={pathname === "/notifications"}
                    showWeeklyReport={false}
                />
                </div>
            </nav>
        );
    }

    return (
        <nav className={navBarClass}>
            <div className={navContentClass}>

            <button
                onClick={() => navigate("/manage-ticket")}
                type="button"
                className={`${navButtonClass}
                ${pathname === "/manage-ticket" || pathname.startsWith("/manage-ticket/")
                    ? activeNavClass
                    : inactiveNavClass
                }`}
            >
                <ScrollText size={23} />
                <span className='text-sm'>Tickets</span>
            </button>

            <button
                onClick={()=> navigate("/manage-laboratory")}
                type="button"
                className={`${navButtonClass}
                ${pathname.startsWith("/manage-laboratory") 
                    ? activeNavClass
                    : inactiveNavClass
                }`}
            >
                <Monitor size={23} />
                <span className='text-sm'>Laboratory</span>
            </button>

            <button
                onClick={() => navigate("/qr-scanner")}
                type="button"
                className={qrButtonClass}
                aria-label="QR Code"
            >
                <ScanQrCode size={30} />
            </button>

            <button
                onClick={() => navigate("/repair-logs")}
                type="button"
                className={`${navButtonClass}
                ${pathname === "/repair-logs"
                    ? activeNavClass
                    : inactiveNavClass
                }`}
            >
                <ClipboardList size={23} />
                <span className='text-sm'>Repairs</span>
            </button>

            <MoreMenu
                isActive={
                    pathname === "/weekly-reports" ||
                    pathname === "/notifications"
                }
            />
            </div>
        </nav>
    );
}
