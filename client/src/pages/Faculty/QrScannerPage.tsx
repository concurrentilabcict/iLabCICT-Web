import { FacultyQrScanner } from "@/components/Faculty/QrScanner/QrScanner";
import { useEffect, useState } from "react";

export default function FacultyQrScannerPage() {
    const [scannedValue, setScannedValue] = useState("");

    useEffect(() => {
        document.title = "QR Code | ILabCICT";
    }, []);

    return (
        <div className="relative">
            <FacultyQrScanner onScan={setScannedValue} />

            {scannedValue && (
                <div className="fixed bottom-5 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-md bg-white p-4 text-center text-sm font-medium text-foreground shadow-lg">
                    PC QR: {scannedValue}
                </div>
            )}
        </div>
    );
}
