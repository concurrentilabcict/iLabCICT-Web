import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Flashlight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type QrScannerProps = {
    onScan?: (value: string) => void;
};

export function QrScanner({ onScan }: QrScannerProps) {
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

                        const value = result.getText();

                        console.log("Scanned:", value);

                        onScanRef.current?.(value);
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
                console.error("Camera scanner failed to start:", error);

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
            <style>
                {`
                    @keyframes qr-scan-line {
                        0% {
                            top: 12%;
                        }
                        50% {
                            top: 88%;
                        }
                        100% {
                            top: 12%;
                        }
                    }
                `}
            </style>

            <video
                ref={videoRef}
                className="absolute inset-0 z-0 h-full w-full object-cover"
                autoPlay
                playsInline
                muted
            />

            <div className="relative z-10 flex min-h-[100svh] flex-col items-center px-6 pb-10 pt-24">
                <div className="text-center z-20">
                    <h1 className="text-3xl font-semibold tracking-normal">Scan QR Code</h1>
                    <p className="mt-3 text-white/70">Align the QR code within the frame</p>
                </div>

                <div className="mt-10 w-full max-w-sm">
                    <div className="relative mx-auto aspect-square w-80 max-w-full">
                        <div className="pointer-events-none rounded-[30px] absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.70)]" />

                        {cameraError && (
                            <div className="absolute inset-0 grid place-items-center  bg-black/60 px-6 text-center text-sm text-white/80">
                                {cameraError}
                            </div>
                        )}

                        <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-[20px] border-l-4 border-t-4 border-white" />
                        <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-[20px] border-r-4 border-t-4 border-white" />
                        <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-[20px] border-b-4 border-l-4 border-white" />
                        <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-[20px] border-b-4 border-r-4 border-white" />
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-12">

                        <button
                            type="button"
                            onClick={handleLightToggle}
                            disabled={!isTorchAvailable}
                            className={`flex min-w-24 flex-col items-center gap-3 text-sm font-medium transition ${isLightOn ? "text-green-400" : "text-white/80"
                                } disabled:text-white/35`}
                            aria-pressed={isLightOn}
                        >
                            <span
                                className={`grid size-16 place-items-center z-20 rounded-full border transition ${isLightOn
                                    ? "border-green-400/40"
                                    : "border-white/10 bg-white/10"
                                    }`}
                            >
                                <Flashlight className="size-7" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
