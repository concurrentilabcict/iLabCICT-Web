import {
    ScrollText,
    Monitor,
    ClipboardList,
    ScanQrCode,
    Bell,
    CircleHelp,
} from 'lucide-react';

import MoreMenu from "./MoreMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

export default function NavBar() {

    const { pathname } = useLocation();

    const navigate = useNavigate();
    const { role } = useAuth();
    const isFaculty = role === "faculty";

    if (isFaculty) {
        return (
            <div className="fixed bottom-0 z-10 flex gap-x-3 bg-white p-4 w-full border-t border-t-[#e5e5e5] items-center justify-around">
                <button
                    onClick={() => navigate("/manage-ticket")}
                    type="button"
                    className={`flex flex-col items-center gap-y-1 cursor-pointer
                    ${pathname === "/manage-ticket"
                        ? "primary-text-color"
                        : "secondary-text-color"
                    }`}
                >
                    <ScrollText size={23} />
                    <span className='text-sm'>Tickets</span>
                </button>

                <button
                    onClick={() => navigate("/manage-laboratory")}
                    type="button"
                    className={`flex flex-col items-center gap-y-1 cursor-pointer
                    ${pathname.startsWith("/manage-laboratory")
                        ? "primary-text-color"
                        : "secondary-text-color"
                    }`}
                >
                    <Monitor size={23} />
                    <span className='text-sm'>Laboratory</span>
                </button>

                <button
                    onClick={() => navigate("/qr-scanner")}
                    type="button"
                    className='primary-bg-color flex flex-col items-center gap-y-1 rounded-full px-3 py-3 text-white'
                    aria-label="QR Code"
                >
                    <ScanQrCode size={25} />
                </button>

                <button
                    onClick={() => navigate("/faq")}
                    type="button"
                    className={`flex flex-col items-center gap-y-1 cursor-pointer
                    ${pathname === "/faq"
                        ? "primary-text-color"
                        : "secondary-text-color"
                    }`}
                >
                    <CircleHelp size={23} />
                    <span className='text-sm'>FAQ</span>
                </button>

                <button
                    onClick={() => navigate("/notifications")}
                    type="button"
                    className={`flex flex-col items-center gap-y-1 cursor-pointer
                    ${pathname === "/notifications"
                        ? "primary-text-color"
                        : "secondary-text-color"
                    }`}
                >
                    <Bell size={23} />
                    <span className='text-sm'>Alerts</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 z-10 flex gap-x-3 bg-white p-4 w-full border-t
        border-t-[#e5e5e5] items-center justify-around">

            <button
                onClick={() => navigate("/manage-ticket")}
                type="button"
                className={`flex flex-col items-center gap-y-1 cursor-pointer
                ${pathname === "/manage-ticket"
                    ? "primary-text-color"
                    : "secondary-text-color"
                }`}
            >
                <ScrollText size={23} />
                <span className='text-sm'>Tickets</span>
            </button>

            <button
                onClick={()=> navigate("/manage-laboratory")}
                type="button"
                className={`flex flex-col items-center gap-y-1 cursor-pointer
                ${pathname.startsWith("/manage-laboratory") 
                    ? "primary-text-color"
                    : "secondary-text-color"
                }`}
            >
                <Monitor size={23} />
                <span className='text-sm'>Laboratory</span>
            </button>

            <button
                onClick={() => navigate("/qr-scanner")}
                type="button"
                className='primary-bg-color flex flex-col items-center gap-y-1
                rounded-full px-3 py-3 text-white'
            >
                <ScanQrCode size={25} />
            </button>

            <button
                onClick={() => navigate("/repair-logs")}
                type="button"
                className={`flex flex-col items-center gap-y-1 cursor-pointer
                ${pathname === "/repair-logs"
                    ? "primary-text-color"
                    : "secondary-text-color"
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
    );
}
