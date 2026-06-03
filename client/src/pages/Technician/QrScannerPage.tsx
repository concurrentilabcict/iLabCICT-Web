import NavBar from "@/components/Technician/NavBar/NavBar";
import { QrScanner } from "@/components/Technician/QrScanner/QrScanner";
import { useState } from "react";


export default function QrScannerPage() {
    const [scannedValue, setScannedValue] = useState("");

    return (
        <div className="space-y-4">
            <QrScanner onScan={setScannedValue} />
        </div>
    );
}