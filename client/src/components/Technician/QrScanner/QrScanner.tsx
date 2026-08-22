import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Flashlight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type QrScannerProps = {
    onScan?: (value: string) => boolean | void | Promise<boolean | void>;
};

export function QrScanner({ onScan }: QrScannerProps) {
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

                        const value = result.getText();

                        console.log("Scanned:", value);

                        Promise.resolve(onScanRef.current?.(value))
                            .then((shouldKeepLocked) => {
                                if (shouldKeepLocked === false) {
                                    scannedRef.current = false;
                                }
                            })
                            .catch(() => {
                                scannedRef.current = false;
                            });
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
        <section className="mx-auto flex w-full max-w-[620px] flex-col px-5 pb-32 pt-8">
            <style>
                {`
                    @keyframes qr-scan-line {
                        0% { top: 24%; }
                        50% { top: 76%; }
                        100% { top: 24%; }
                    }
                `}
            </style>

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
                    Scan Computer QR Code
                </h1>
                <p className="mt-3 text-base font-medium secondary-text-color">
                    Scan the computer QR code to automatically view details.
                </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[2rem] bg-black shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                <div className="relative aspect-[4/5] w-full">
                    <video
                        ref={videoRef}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />

                    <div className="absolute inset-0 bg-black/10" />

                    <p className="absolute left-0 right-0 top-9 text-center text-sm font-semibold text-white/75">
                        Align QR code inside frame
                    </p>

                    {cameraError && (
                        <div className="absolute inset-0 grid place-items-center bg-black/60 px-6 text-center text-sm text-white/80">
                            {cameraError}
                        </div>
                    )}

                    <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 border border-white/10">
                        <div className="absolute left-0 top-0 h-20 w-20 border-l-8 border-t-8 border-[#d3522f]" />
                        <div className="absolute right-0 top-0 h-20 w-20 border-r-8 border-t-8 border-[#d3522f]" />
                        <div className="absolute bottom-0 left-0 h-20 w-20 border-b-8 border-l-8 border-[#d3522f]" />
                        <div className="absolute bottom-0 right-0 h-20 w-20 border-b-8 border-r-8 border-[#d3522f]" />
                        <div className="absolute left-8 right-8 h-0.5 bg-[#d3522f]" style={{ animation: "qr-scan-line 2.2s ease-in-out infinite" }} />
                    </div>

                    <button
                        type="button"
                        onClick={handleLightToggle}
                        disabled={!isTorchAvailable}
                        className={`absolute bottom-5 left-1/2 grid size-16 -translate-x-1/2 place-items-center rounded-2xl primary-bg-color text-white shadow-lg shadow-black/25 transition ${
                            isLightOn ? "ring-4 ring-emerald-400/40" : ""
                        } disabled:opacity-60`}
                        aria-pressed={isLightOn}
                        aria-label="Toggle flashlight"
                    >
                        <Flashlight className="size-6" />
                    </button>
                </div>
            </div>

            <div className="my-4 h-px w-full bg-gray-300" />

            <div className="text-center">
                <p className="text-sm font-semibold text-zinc-400">
                    Could not scan computer QR code?
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/manage-laboratory")}
                    className="mt-3 rounded-2xl primary-bg-color px-10 py-4 text-base font-bold text-white shadow-[0_14px_34px_rgba(191,52,25,0.22)]"
                >
                    Search Manually
                </button>
            </div>
        </section>
    );
}
