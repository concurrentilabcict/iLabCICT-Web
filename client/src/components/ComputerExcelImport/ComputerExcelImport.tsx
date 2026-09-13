import { useRef, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { readComputerInventoryWorkbook } from "@/utils/computerExcel";
import { appToast } from "@/utils/appToast";

type ComputerExcelImportProps = {
  roomId: number | null;
  showLabel: boolean;
  className: string;
};

type ComputerImportPayload = {
  room: number;
  cpu: string;
  gpu: string;
  motherboard: string;
  ram_size_installed: number;
  disk_size_installed: number;
  operating_system: string;
  build_version: string;
  monitor_status: string;
  mouse_status: string;
  keyboard_status: string;
  ups_status: string;
  computer_status: string;
  quantity: number;
};

const hasApiStatus = (error: unknown): error is Error & { status: number } =>
  error instanceof Error &&
  "status" in error &&
  typeof error.status === "number";

const getResponseMessage = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  if ("detail" in value && typeof value.detail === "string") {
    return value.detail;
  }

  if ("message" in value && typeof value.message === "string") {
    return value.message;
  }

  return null;
};

export default function ComputerExcelImport({
  roomId,
  showLabel,
  className,
}: ComputerExcelImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      if (roomId === null) {
        throw new Error("The laboratory could not be resolved.");
      }

      const records = await readComputerInventoryWorkbook(file);
      const payloads: ComputerImportPayload[] = records.map((record) => ({
        room: roomId,
        cpu: record.cpu,
        gpu: record.gpu,
        motherboard: record.motherboard,
        ram_size_installed: record.ramSizeInstalled,
        disk_size_installed: record.diskSizeInstalled,
        operating_system: record.operatingSystem,
        build_version: record.buildVersion,
        computer_status: record.computerStatus,
        monitor_status: record.monitorStatus,
        mouse_status: record.mouseStatus,
        keyboard_status: record.keyboardStatus,
        ups_status: record.upsStatus,
        quantity: 1,
      }));

      for (const payload of payloads) {
        const response = await privateFetch(buildApiUrl("/api/computers/"), {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const responseData: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw createApiError(
            response.status,
            getResponseMessage(responseData) ?? "Failed to import computers."
          );
        }
      }

      return payloads.length;
    },
    onSuccess: (importedCount) => {
      appToast.success(
        `${importedCount} ${importedCount === 1 ? "computer" : "computers"} imported successfully.`
      );
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't import the computers. Please try again.";

      if (hasApiStatus(error) && error.status === 400) {
        appToast.warning(message);
      } else {
        appToast.error(message);
      }
    },
    onSettled: async () => {
      if (roomId === null) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["technician-room-computers", String(roomId)],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-room-computers", String(roomId)],
        }),
        queryClient.invalidateQueries({ queryKey: ["computers", String(roomId)] }),
        queryClient.invalidateQueries({ queryKey: ["rooms"] }),
      ]);
    },
  });

  const importFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      importMutation.mutate(file);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={roomId === null || importMutation.isPending}
        className={className}
        aria-label="Import computers from Excel"
      >
        <Upload size={16} />
        {showLabel && (
          <span>{importMutation.isPending ? "Importing..." : "Import"}</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={importFile}
        className="sr-only"
      />
    </>
  );
}
