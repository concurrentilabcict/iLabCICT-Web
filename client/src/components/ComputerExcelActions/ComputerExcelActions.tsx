import { useState } from "react";
import { Download } from "lucide-react";

import ComputerExcelImport from "@/components/ComputerExcelImport/ComputerExcelImport";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ComputerCardType } from "@/types/computer";
import { appToast } from "@/utils/appToast";
import { exportComputerInventoryPdf } from "@/utils/computerExcel";

type ComputerExcelActionsProps = {
  roomId: number | null;
  roomName: string;
  buildingName: string;
  floorNumber: number;
  computers: ComputerCardType[];
  buttonClassName: string;
};

export default function ComputerExcelActions({
  roomId,
  roomName,
  buildingName,
  floorNumber,
  computers,
  buttonClassName,
}: ComputerExcelActionsProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isExporting, setIsExporting] = useState(false);

  const exportComputers = async () => {
    setIsExporting(true);

    try {
      exportComputerInventoryPdf({
        roomName,
        buildingName,
        floorNumber,
        computers,
      });
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "We couldn't export the computers. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => void exportComputers()}
        disabled={isExporting || computers.length === 0}
        className={buttonClassName}
        aria-label="Export computers to PDF"
      >
        <Download size={16} />
        {!isMobile && <span>{isExporting ? "Exporting..." : "Export"}</span>}
      </button>
      <ComputerExcelImport
        roomId={roomId}
        showLabel={!isMobile}
        className={buttonClassName}
      />
    </div>
  );
}
