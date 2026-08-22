import QRCode from "qrcode";
import {
    Building2,
    CheckCircle2,
    Layers3,
    MapPin,
    Monitor,
    QrCode,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Status } from "@/utils/computer";
import { statusConfig } from "@/utils/computer";

type ComputerAssetCardProps = {
    computerCode: string;
    buildingName: string;
    roomName: string;
    floorNumber: number;
    status: Status;
};

const formatFloor = (floorNumber: number) => `Floor ${floorNumber}`;

export default function ComputerAssetCard({
    computerCode,
    buildingName,
    roomName,
    floorNumber,
    status,
}: ComputerAssetCardProps) {
    const [qrDataUrl, setQrDataUrl] = useState("");
    const statusData = statusConfig[status];
    const StatusIcon = statusData?.icon ?? CheckCircle2;

    const qrValue = useMemo(() => {
        if (typeof window === "undefined") return computerCode;

        const room = encodeURIComponent(roomName);
        const code = encodeURIComponent(computerCode);

        return `${window.location.origin}/manage-laboratory/${room}/${code}`;
    }, [computerCode, roomName]);

    useEffect(() => {
        let isMounted = true;

        QRCode.toDataURL(qrValue, {
            margin: 1,
            width: 180,
            color: {
                dark: "#c94f2b",
                light: "#ffffff",
            },
        })
            .then((dataUrl) => {
                if (isMounted) setQrDataUrl(dataUrl);
            })
            .catch(() => {
                if (isMounted) setQrDataUrl("");
            });

        return () => {
            isMounted = false;
        };
    }, [qrValue]);

    return (
        <section className="col-span-full w-full rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.10)]">
            <div className="flex flex-col gap-5 rounded-xl primary-bg-color p-5 text-white md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                            <Monitor className="size-5" />
                        </span>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                            Laboratory Asset
                        </p>
                    </div>

                    <h1 className="mt-5 break-words text-3xl font-bold leading-tight">
                        {computerCode}
                    </h1>

                    <div className="mt-5 grid gap-3 text-sm font-semibold text-white/90 sm:grid-cols-3 md:grid-cols-1">
                        <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-white/70" />
                            <span>{buildingName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 className="size-4 text-white/70" />
                            <span>{roomName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Layers3 className="size-4 text-white/70" />
                            <span>{formatFloor(floorNumber)}</span>
                        </div>
                    </div>

                    <div
                        className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${statusData?.className}`}
                    >
                        <StatusIcon className="size-4" />
                        {status}
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-center md:justify-end">
                    <div className="grid size-36 place-items-center rounded-2xl bg-white p-2 shadow-lg shadow-black/15 sm:size-40">
                        {qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt={`${computerCode} QR code`}
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <QrCode className="size-16 text-[#c94f2b]" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
