import { FacultyQrScanner } from "@/components/Faculty/QrScanner/QrScanner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FacultyQrScannerPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "QR Code | ILabCICT";
    }, []);

    return (
        <div className="relative">
            <FacultyQrScanner onScan={(computerCode) => navigate("/create-ticket", { state: { computerCode } })} />
        </div>
    );
}
