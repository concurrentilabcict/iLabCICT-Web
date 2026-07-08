import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Flashlight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type QrScannerProps = {
    onScan?: (value: string) => void;
};

export function FacultyQrScanner({ onScan }: QrScannerProps) {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const onScanRef = useRef(onScan);
    const scannedRef = useRef(false);
    const isFlashActiveRef = useRef(true);
    const [isLightOn, setIsLightOn] = useState(false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const [cameraError, setCameraError] = useState("");

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let isMounted = true;

        const startScanner = async () => {
            if (!videoRef.current) return;

            try {
                const controls = await codeReader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current,
                    (result) => {
                        if (!result) return;
                        if (!isFlashActiveRef.current) return;
                        if (scannedRef.current) return;

                        scannedRef.current = true;
                        onScanRef.current?.(result.getText());
                    }
                );

                if (!isMounted) {
                    controls.stop();
                    return;
                }

                controlsRef.current = controls;
                setIsTorchAvailable(Boolean(controls.switchTorch));
                setCameraError("");
            } catch (error) {
                console.error("Faculty QR scanner failed to start:", error);

                if (isMounted) {
                    setCameraError("Camera unavailable");
                }
            }
        };

        const scannerTimer = window.setTimeout(startScanner, 0);

        return () => {
            isMounted = false;
            window.clearTimeout(scannerTimer);
            controlsRef.current?.stop();
            controlsRef.current = null;
        };
    }, []);

    const handleLightToggle = async () => {
        if (!controlsRef.current?.switchTorch) return;

        const nextValue = !isLightOn;

        try {
            await controlsRef.current.switchTorch(nextValue);
            setIsLightOn(nextValue);
        } catch (error) {
            console.error("Flashlight toggle failed:", error);
        }
    };

    return (
        <section className="relative min-h-[100svh] overflow-hidden bg-black text-white">
            <video
                ref={videoRef}
                className="absolute inset-0 z-0 h-full w-full object-cover"
                autoPlay
                playsInline
                muted
            />

            <div className="relative z-10 flex min-h-[100svh] flex-col items-center px-3 pt-3">
                <div className="mb-10 mt-5 flex w-full items-center justify-between px-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="cursor-pointer flex flex-col items-center text-sm font-medium text-white/80 transition hover:text-white"
                        aria-label="Close QR scanner"
                    >
                        <span className="z-20 grid size-16 place-items-center rounded-full border border-white/10 bg-white/10 transition">
                            <X className="size-7" />
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLightToggle}
                        disabled={!isTorchAvailable}
                        className={`cursor-pointer flex flex-col items-center text-sm font-medium transition ${isLightOn ? "text-green-400" : "text-white/80"
                            } disabled:text-white/35`}
                        aria-pressed={isLightOn}
                        aria-label="Toggle flashlight"
                    >
                        <span
                            className={`z-20 grid size-16 place-items-center rounded-full border transition ${isLightOn
                                ? "border-green-400/40"
                                : "border-white/10 bg-white/10"
                                }`}
                        >
                            <Flashlight className="size-7" />
                        </span>
                    </button>
                </div>

                <div className="z-20 text-center">
                    <h1 className="text-3xl font-semibold tracking-normal">Scan PC QR Code</h1>
                    <p className="mt-3 text-white/70">Align the PC QR code within the frame</p>
                </div>

                <div className="mt-10 w-full max-w-sm">
                    <div className="relative mx-auto aspect-square w-80 max-w-full">
                        <div className="pointer-events-none absolute inset-0 rounded-[30px] shadow-[0_0_0_9999px_rgba(0,0,0,0.70)]" />

                        {cameraError && (
                            <div className="absolute inset-0 grid place-items-center bg-black/60 px-6 text-center text-sm text-white/80">
                                {cameraError}
                            </div>
                        )}

                        <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-[20px] border-l-4 border-t-4 border-white" />
                        <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-[20px] border-r-4 border-t-4 border-white" />
                        <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-[20px] border-b-4 border-l-4 border-white" />
                        <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-[20px] border-b-4 border-r-4 border-white" />
                    </div>
                </div>
            </div>
        </section>
    );
}
