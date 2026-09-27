import QRCode from "qrcode";

import logo from "@/assets/logo.png";

const QR_COLOR = "#BD4E2C";
const QR_BACKGROUND = "#FFFFFF";

type ComputerQrValueOptions = {
    computerCode: string;
    roomName: string;
    origin?: string;
};

type DownloadComputerQrOptions = {
    computerCode: string;
    computerNumber?: string | number | null;
    roomName: string;
};

const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load the QR logo."));
    image.src = source;
});

const drawCenteredLogo = async (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context) return;

    try {
        const image = await loadImage(logo);
        const maxLogoSize = Math.round(canvas.width * 0.2);
        const imageRatio = image.naturalWidth / image.naturalHeight;
        const logoWidth = imageRatio >= 1 ? maxLogoSize : Math.round(maxLogoSize * imageRatio);
        const logoHeight = imageRatio >= 1 ? Math.round(maxLogoSize / imageRatio) : maxLogoSize;
        const padding = Math.round(maxLogoSize * 0.14);
        const backgroundWidth = logoWidth + padding * 2;
        const backgroundHeight = logoHeight + padding * 2;
        const backgroundX = Math.round((canvas.width - backgroundWidth) / 2);
        const backgroundY = Math.round((canvas.height - backgroundHeight) / 2);
        const logoX = Math.round((canvas.width - logoWidth) / 2);
        const logoY = Math.round((canvas.height - logoHeight) / 2);

        context.fillStyle = QR_BACKGROUND;
        context.fillRect(
            backgroundX,
            backgroundY,
            backgroundWidth,
            backgroundHeight
        );
        context.drawImage(image, logoX, logoY, logoWidth, logoHeight);
    } catch {
        // The QR remains usable when the decorative logo cannot be loaded.
    }
};

const createQrCanvas = async (value: string, size: number) => {
    const canvas = document.createElement("canvas");

    await QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
            dark: QR_COLOR,
            light: QR_BACKGROUND,
        },
    });
    await drawCenteredLogo(canvas);

    return canvas;
};

export const getComputerQrValue = ({
    computerCode,
    roomName,
    origin,
}: ComputerQrValueOptions) => {
    const room = encodeURIComponent(roomName);
    const code = encodeURIComponent(computerCode);
    const baseUrl = origin ?? (typeof window === "undefined" ? "" : window.location.origin);

    return `${baseUrl}/manage-laboratory/${room}/${code}`;
};

export const createComputerQrDataUrl = async (value: string, size = 500) => {
    const canvas = await createQrCanvas(value, size);
    return canvas.toDataURL("image/png");
};

export const downloadComputerQrPng = async ({
    computerCode,
    computerNumber,
    roomName,
}: DownloadComputerQrOptions) => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1000;
    exportCanvas.height = 1000;

    const context = exportCanvas.getContext("2d");
    if (!context) {
        throw new Error("QR export is not supported by this browser.");
    }

    context.fillStyle = QR_BACKGROUND;
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const qrCanvas = await createQrCanvas(
        getComputerQrValue({ computerCode, roomName }),
        840
    );
    context.drawImage(qrCanvas, 80, 20, 840, 840);

    const number = computerNumber === null || computerNumber === undefined
        ? ""
        : String(computerNumber).trim();
    context.textAlign = "center";
    context.textBaseline = "middle";

    if (number) {
        context.fillStyle = "#18181B";
        context.font = "700 48px Geist, Arial, sans-serif";
        context.fillText(number, 500, 885);

        context.fillStyle = QR_COLOR;
        context.font = "600 80px Geist, Arial, sans-serif";
        context.fillText(computerCode, 500, 950);
    } else {
        context.fillStyle = "#18181B";
        context.font = "700 44px Geist, Arial, sans-serif";
        context.fillText(computerCode, 500, 925);
    }

    const downloadLink = document.createElement("a");
    const fileLabel = number ? `${number}-${computerCode}` : computerCode;
    downloadLink.download = `${fileLabel.replace(/[^a-z0-9_-]+/gi, "-")}-QR.png`;
    downloadLink.href = exportCanvas.toDataURL("image/png");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
};
