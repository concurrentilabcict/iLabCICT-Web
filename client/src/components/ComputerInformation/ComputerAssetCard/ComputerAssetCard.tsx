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
        <section className="w-full rounded-2xl border border-white bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:rounded-3xl md:p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl primary-bg-color p-4 text-white md:flex md:items-center md:justify-between md:gap-5 md:p-5">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2 md:gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 md:size-10">
                            <Monitor className="size-4 md:size-5" />
                        </span>
                        <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 md:text-xs md:tracking-[0.2em]">
                            Laboratory Asset
                        </p>
                    </div>

                    <h1 className="mt-4 break-words text-2xl font-bold leading-tight md:mt-5 md:text-3xl">
                        {computerCode}
                    </h1>

                    <div className="mt-4 grid gap-2 text-sm font-semibold text-white/90 sm:grid-cols-3 md:mt-5 md:grid-cols-1 md:gap-3">
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
                        className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold md:mt-5 ${statusData?.className}`}
                    >
                        <StatusIcon className="size-4" />
                        {status}
                    </div>
                </div>

                <div className="flex shrink-0 items-end justify-end self-end md:items-center md:self-center">
                    <div className="grid size-24 place-items-center rounded-2xl bg-white p-2 shadow-lg shadow-black/15 sm:size-32 md:size-40">
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
