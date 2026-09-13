import {
    ScrollText,
    Monitor,
    ClipboardList,
    ScanQrCode,
    CircleHelp,
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
        "fixed inset-x-0 bottom-0 z-40 box-border w-dvw max-w-[100dvw] min-w-0 border-t border-t-[#e5e5e5] bg-white pb-[env(safe-area-inset-bottom)]";
    const navContentClass =
        "relative mx-auto grid h-20 w-full min-w-0 max-w-[430px] grid-cols-[repeat(5,minmax(0,1fr))] items-end bg-white px-1 pb-3 min-[360px]:px-2";
    const navButtonClass =
        "relative z-10 flex h-16 w-full min-w-0 max-w-full cursor-pointer flex-col items-center justify-end gap-y-1 rounded-2xl px-0.5 text-center text-[11px] transition min-[360px]:px-1 min-[360px]:text-xs";
    const inactiveNavClass = "secondary-text-color hover:text-gray-700";
    const activeNavClass = "primary-text-color";
    const qrButtonClass =
        "primary-bg-color relative z-10 mx-auto flex size-12 -translate-y-1 cursor-pointer items-center justify-center self-end rounded-full text-white transition hover:bg-[#d0472c] min-[360px]:size-14";

    if (isFaculty) {
        return (
            <nav className={navBarClass}>
                <div className={navContentClass}>
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
                    <span>Tickets</span>
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
                    <span className="max-w-full whitespace-nowrap">Laboratory</span>
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
                    onClick={() => navigate("/faq")}
                    type="button"
                    className={`${navButtonClass}
                    ${pathname === "/faq"
                        ? activeNavClass
                        : inactiveNavClass
                    }`}
                >
                    <CircleHelp size={23} />
                    <span>FAQ</span>
                </button>

                <MoreMenu
                    isActive={pathname === "/notifications"}
                    showWeeklyReport={false}
                    compactLabel
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
