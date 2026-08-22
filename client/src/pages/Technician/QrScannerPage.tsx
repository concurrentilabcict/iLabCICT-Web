import NavBar from "@/components/Technician/NavBar/NavBar";
import MobileHeader from "@/components/Header/MobileHeader";
import { QrScanner } from "@/components/Technician/QrScanner/QrScanner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { privateFetch } from "@/lib/api";

const API_URL = "https://ilabcict-backend.onrender.com/api";

type ScannedComputer = {
    computer_code?: string;
    room?: {
        room_name?: string;
    } | null;
};

const getScannedRoute = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return null;

    try {
        const url = new URL(trimmedValue);
        const parts = url.pathname.split("/").filter(Boolean);
        const labIndex = parts.indexOf("manage-laboratory");

        if (labIndex >= 0 && parts[labIndex + 1] && parts[labIndex + 2]) {
            return `/manage-laboratory/${parts[labIndex + 1]}/${parts[labIndex + 2]}`;
        }

        const codeParam =
            url.searchParams.get("computer") ??
            url.searchParams.get("computerCode") ??
            url.searchParams.get("code");

        return codeParam?.trim() || null;
    } catch {
        return trimmedValue;
    }
};


export default function QrScannerPage() {
    const navigate = useNavigate();
    const [isResolvingScan, setIsResolvingScan] = useState(false);

    useEffect(() => {
        document.title = "Inspect a Computer | ILabCICT";
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <MobileHeader title="Inspect a Computer" />
            <QrScanner
                onScan={async (value) => {
                    if (isResolvingScan) return false;

                    const routeOrCode = getScannedRoute(value);

                    if (!routeOrCode) {
                        toast.error("Invalid computer QR code.");
                        return false;
                    }

                    if (routeOrCode.startsWith("/manage-laboratory/")) {
                        navigate(routeOrCode);
                        return true;
                    }

                    setIsResolvingScan(true);

                    try {
                        const response = await privateFetch(
                            `${API_URL}/computers/${encodeURIComponent(routeOrCode)}/`
                        );
                        const data = (await response.json()) as ScannedComputer;

                        if (!response.ok || !data.room?.room_name) {
                            toast.error("Computer QR code not found.");
                            return false;
                        }

                        navigate(
                            `/manage-laboratory/${encodeURIComponent(data.room.room_name)}/${encodeURIComponent(data.computer_code ?? routeOrCode)}`
                        );
                        return true;
                    } catch {
                        toast.error("Unable to open scanned computer.");
                        return false;
                    } finally {
                        setIsResolvingScan(false);
                    }
                }}
            />
            <NavBar />
        </div>
    );
}
