import { FacultyQrScanner } from "@/components/Faculty/QrScanner/QrScanner";
import MobileHeader from "@/components/Header/MobileHeader";
import NavBar from "@/components/Technician/NavBar/NavBar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FacultyQrScannerPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "QR Code | ILabCICT";
    }, []);

    return (
        <div className="relative min-h-screen bg-[#f8fafc]">
            <MobileHeader title="Scan Computer" />
            <FacultyQrScanner onScan={(computerCode) => navigate("/create-ticket", { state: { computerCode } })} />
            <NavBar />
        </div>
    );
}
