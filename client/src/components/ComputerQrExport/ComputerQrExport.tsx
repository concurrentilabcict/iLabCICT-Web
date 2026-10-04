import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import type { ComputerCardType } from "@/types/computer";
import { createComputerQrPng } from "@/utils/computerQr";
import { createZip, type ZipFile } from "@/utils/zip";
import { appToast } from "@/utils/appToast";

export default function ComputerQrExport({ computers, roomName }: {
  computers: ComputerCardType[];
  roomName: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const availableComputers = computers.filter((computer) => !computer.isArchived && computer.computerStatus.toLowerCase() !== "archived");
  const exportCodes = async () => {
    if (progress !== null || availableComputers.length === 0) return;
    setProgress(0);
    try {
      const files: ZipFile[] = [];
      for (const computer of availableComputers) {
        const { blob, filename } = await createComputerQrPng({
          computerCode: computer.computerCode,
          computerNumber: computer.computerNumber,
          roomName,
        });
        files.push({ name: filename, data: new Uint8Array(await blob.arrayBuffer()) });
        setProgress(files.length);
      }
      const url = URL.createObjectURL(createZip(files));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${roomName.replace(/[^a-z0-9_-]+/gi, "-")}-QR-Codes.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      appToast.success(`${files.length} computer QR codes exported.`);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to export QR codes.");
    } finally {
      setProgress(null);
    }
  };
  return (
    <button type="button" onClick={exportCodes} disabled={progress !== null || availableComputers.length === 0}
      className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
      {progress !== null ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
      {progress !== null ? `Exporting ${progress}/${availableComputers.length}` : "Export QR Codes"}
    </button>
  );
}
