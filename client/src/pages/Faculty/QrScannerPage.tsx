import { FacultyQrScanner } from "@/components/Faculty/QrScanner/QrScanner";
import MobileHeader from "@/components/Header/MobileHeader";
import NavBar from "@/components/Technician/NavBar/NavBar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appToast } from "@/utils/appToast";
import { getComputerCodeFromQrValue } from "@/utils/qrComputer";

export default function FacultyQrScannerPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "QR Code | ILabCICT";
    }, []);

    return (
        <div className="relative min-h-screen bg-[#f8fafc]">
            <MobileHeader title="Scan Computer" />
            <FacultyQrScanner
                onScan={(value) => {
                    const computerCode = getComputerCodeFromQrValue(value);

                    if (!computerCode) {
                        appToast.warning("That QR code isn't a valid computer code.");
                        return false;
                    }

                    navigate(`/create-ticket?computer=${encodeURIComponent(computerCode)}`);
                    return true;
                }}
            />
            <NavBar />
        </div>
    );
}
