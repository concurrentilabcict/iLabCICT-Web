import { useRef, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { appToast } from "@/utils/appToast";
import { getCsvCell, normalizeCsvHeader, parseCsv } from "@/utils/csv";

type ComputerCsvImportProps = {
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

const createPayload = (
    row: string[],
    headerIndexes: Map<string, number>,
    roomId: number
): ComputerImportPayload => {
    const ramSize = Number(getCsvCell(row, headerIndexes, "RAM Installed (GB)"));
    const diskSize = Number(getCsvCell(row, headerIndexes, "Disk Installed (GB)"));
    const cpu = getCsvCell(row, headerIndexes, "CPU");
    const operatingSystem = getCsvCell(row, headerIndexes, "Operating System");

    if (!cpu || !operatingSystem || !Number.isFinite(ramSize) || !Number.isFinite(diskSize)) {
        throw new Error("CSV rows require CPU, Operating System, RAM, and Disk values.");
    }

    return {
        room: roomId,
        cpu,
        gpu: getCsvCell(row, headerIndexes, "GPU"),
        motherboard: getCsvCell(row, headerIndexes, "Motherboard"),
        ram_size_installed: ramSize,
        disk_size_installed: diskSize,
        operating_system: operatingSystem,
        build_version: getCsvCell(row, headerIndexes, "Build Version"),
        computer_status: getCsvCell(row, headerIndexes, "Computer Status") || "active",
        monitor_status: getCsvCell(row, headerIndexes, "Monitor Status") || "active",
        mouse_status: getCsvCell(row, headerIndexes, "Mouse Status") || "active",
        keyboard_status: getCsvCell(row, headerIndexes, "Keyboard Status") || "active",
        ups_status: getCsvCell(row, headerIndexes, "UPS Status") || "active",
        quantity: 1,
    };
};

export default function ComputerCsvImport({
    roomId,
    showLabel,
    className,
}: ComputerCsvImportProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const importMutation = useMutation({
        mutationFn: async (file: File) => {
            if (roomId === null) {
                throw new Error("The laboratory could not be resolved.");
            }

            const rows = parseCsv(await file.text());
            const [headers, ...dataRows] = rows;

            if (!headers || dataRows.length === 0) {
                throw new Error("The CSV file does not contain computer records.");
            }

            const headerIndexes = new Map(
                headers.map((header, index) => [normalizeCsvHeader(header), index])
            );
            const requiredHeaders = [
                "CPU",
                "Operating System",
                "RAM Installed (GB)",
                "Disk Installed (GB)",
            ];

            if (requiredHeaders.some((header) => !headerIndexes.has(normalizeCsvHeader(header)))) {
                throw new Error(
                    `The CSV file must include: ${requiredHeaders.join(", ")}.`
                );
            }

            const payloads = dataRows.map((row) =>
                createPayload(row, headerIndexes, roomId)
            );

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
            const message = error instanceof Error
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
                queryClient.invalidateQueries({ queryKey: ["technician-room-computers", String(roomId)] }),
                queryClient.invalidateQueries({ queryKey: ["admin-room-computers", String(roomId)] }),
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
            >
                <Upload size={16} />
                {showLabel && <span>{importMutation.isPending ? "Importing..." : "Import"}</span>}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => void importFile(event)}
                className="sr-only"
            />
        </>
    );
}
