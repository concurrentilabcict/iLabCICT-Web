import {
    ScrollText,
    Monitor,
    ClipboardList,
    ScanQrCode
} from 'lucide-react';

import MoreMenu from "./MoreMenu";
import { useLocation, useNavigate } from "react-router-dom";

export default function NavBar() {

    const { pathname } = useLocation();

    const navigate = useNavigate();

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
                type="button"
                className={`flex flex-col items-center gap-y-1 cursor-pointer
                ${pathname === "/manage-laboratory"
                    ? "primary-text-color"
                    : "secondary-text-color"
                }`}
            >
                <Monitor size={23} />
                <span className='text-sm'>Laboratory</span>
            </button>

            <button
                type="button"
                className='primary-bg-color flex flex-col items-center gap-y-1
                rounded-full px-3 py-3 text-white'
            >
                <ScanQrCode size={25} />
            </button>

            <button
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
                    pathname === "/weekly-report" ||
                    pathname === "/notifications"
                }
            />
        </div>
    );
}