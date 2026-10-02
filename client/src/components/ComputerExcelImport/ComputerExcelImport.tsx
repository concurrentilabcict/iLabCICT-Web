import { useRef, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { appToast } from "@/utils/appToast";
import { refreshRoomComputerCaches } from "@/lib/roomComputers";

type ComputerExcelImportProps = {
  roomId: number | null;
  showLabel: boolean;
  className: string;
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

      const body = new FormData();
      body.append("file", file);
      const response = await privateFetch(buildApiUrl(`/api/rooms/${roomId}/computers/import/`), {
        method: "POST",
        body,
      });
      const responseData: unknown = await response.json().catch(() => null);

      if (!response.ok || (typeof responseData === "object" && responseData !== null &&
        "success" in responseData && responseData.success === false)) {
        throw createApiError(
          response.status,
          getResponseMessage(responseData) ?? "Failed to import computers."
        );
      }
      return typeof responseData === "object" && responseData !== null &&
        "created" in responseData && typeof responseData.created === "number"
        ? responseData.created : null;
    },
    onSuccess: (importedCount) => {
      appToast.success(
        importedCount === null ? "Computers imported successfully." :
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
        refreshRoomComputerCaches(queryClient, String(roomId)).catch((error: unknown) => {
          console.error("Failed to refresh imported computers", error);
        }),
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
        {importMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Upload size={16} />}
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
