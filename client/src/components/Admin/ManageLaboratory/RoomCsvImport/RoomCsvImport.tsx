import { useRef, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type {
  ApiRoom,
  BuildingNames,
  FloorNumber,
  Room,
  RoomStatus,
} from "@/types/room";
import { appToast } from "@/utils/appToast";
import { getCsvCell, normalizeCsvHeader, parseCsv } from "@/utils/csv";

type RoomCsvImportProps = {
  showLabel: boolean;
  className: string;
};

type RoomImportPayload = {
  room_name: string;
  floor_number: FloorNumber;
  building_name: BuildingNames;
  room_status: RoomStatus;
  assigned_custodian: number | null;
  assigned_technician: number | null;
};

const buildingNames: BuildingNames[] = ["pimentel", "law", "acad"];
const roomStatuses: RoomStatus[] = [
  "operational",
  "maintenance",
  "degraded",
  "out of service",
];

const isBuildingName = (value: string): value is BuildingNames =>
  buildingNames.some((buildingName) => buildingName === value);

const isFloorNumber = (value: number): value is FloorNumber =>
  value === 1 || value === 2 || value === 3;

const isRoomStatus = (value: string): value is RoomStatus =>
  roomStatuses.some((roomStatus) => roomStatus === value);

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

const parseOptionalId = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Assigned user IDs must be positive whole numbers.");
  }

  return id;
};

const createPayload = (
  row: string[],
  headerIndexes: Map<string, number>
): RoomImportPayload => {
  const roomName = getCsvCell(row, headerIndexes, "Room Name").trim();
  const floorNumber = Number(getCsvCell(row, headerIndexes, "Floor Number"));
  const buildingName = getCsvCell(row, headerIndexes, "Building Name")
    .trim()
    .toLowerCase();
  const rawStatus =
    getCsvCell(row, headerIndexes, "Status") ||
    getCsvCell(row, headerIndexes, "Room Status");
  const normalizedStatus = rawStatus
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  const roomStatus =
    normalizedStatus.replace(/\s/g, "") === "outofservice"
      ? "out of service"
      : normalizedStatus;

  if (!roomName) {
    throw new Error("Every CSV row requires a Room Name.");
  }

  if (!isFloorNumber(floorNumber)) {
    throw new Error("Floor Number must be 1, 2, or 3.");
  }

  if (!isBuildingName(buildingName)) {
    throw new Error(`Building Name must be: ${buildingNames.join(", ")}.`);
  }

  if (!isRoomStatus(roomStatus)) {
    throw new Error(`Status must be: ${roomStatuses.join(", ")}.`);
  }

  return {
    room_name: roomName,
    floor_number: floorNumber,
    building_name: buildingName,
    room_status: roomStatus,
    assigned_custodian: parseOptionalId(
      getCsvCell(row, headerIndexes, "Assigned Custodian ID")
    ),
    assigned_technician: parseOptionalId(
      getCsvCell(row, headerIndexes, "Assigned Technician ID")
    ),
  };
};

const mapRoom = (room: ApiRoom): Room => ({
  id: room.id,
  computerCount: room.computer_count ?? 0,
  activeIssuesCount:
    room.active_issues_count ?? room.computer_count_with_active_issues ?? 0,
  assignedCustodian: room.assigned_custodian
    ? {
        id: room.assigned_custodian.id,
        firstName: room.assigned_custodian.first_name,
        lastName: room.assigned_custodian.last_name,
      }
    : null,
  assignedTechnician: room.assigned_technician
    ? {
        id: room.assigned_technician.id,
        firstName: room.assigned_technician.first_name,
        lastName: room.assigned_technician.last_name,
      }
    : null,
  floorNumber: room.floor_number,
  roomName: room.room_name,
  buildingName: room.building_name,
  status: room.status,
  createdAt: room.created_at,
  updatedAt: room.updated_at,
});

const upsertRooms = (currentRooms: Room[], importedRooms: Room[]) => {
  const importedById = new Map(importedRooms.map((room) => [room.id, room]));
  const retainedRooms = currentRooms.filter(
    (room) => !importedById.has(room.id)
  );

  return [...importedRooms, ...retainedRooms];
};

export default function RoomCsvImport({
  showLabel,
  className,
}: RoomCsvImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const rows = parseCsv(await file.text());
      const [headers, ...dataRows] = rows;

      if (!headers || dataRows.length === 0) {
        throw new Error("The CSV file does not contain room records.");
      }

      const headerIndexes = new Map(
        headers.map((header, index) => [normalizeCsvHeader(header), index])
      );
      const requiredHeaders = ["Room Name", "Floor Number", "Building Name"];
      const hasStatusHeader =
        headerIndexes.has(normalizeCsvHeader("Status")) ||
        headerIndexes.has(normalizeCsvHeader("Room Status"));

      if (
        requiredHeaders.some(
          (header) => !headerIndexes.has(normalizeCsvHeader(header))
        ) ||
        !hasStatusHeader
      ) {
        throw new Error(
          `The CSV file must include: ${requiredHeaders.join(", ")}, and Status.`
        );
      }

      const payloads = dataRows.map((row) =>
        createPayload(row, headerIndexes)
      );
      const importedRooms: Room[] = [];

      for (const payload of payloads) {
        const response = await privateFetch(buildApiUrl("/api/rooms/"), {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const responseData: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw createApiError(
            response.status,
            getResponseMessage(responseData) ?? "Failed to import rooms."
          );
        }

        importedRooms.push(mapRoom(responseData as ApiRoom));
      }

      return importedRooms;
    },
    onSuccess: (importedRooms) => {
      queryClient.setQueryData<Room[]>(["rooms"], (currentRooms = []) =>
        upsertRooms(currentRooms, importedRooms)
      );
      appToast.success(
        `${importedRooms.length} ${importedRooms.length === 1 ? "room" : "rooms"} imported successfully.`
      );
    },
    onError: (error) => {
      appToast.error(
        error instanceof Error
          ? error.message
          : "We couldn't import the rooms. Please try again."
      );
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
        disabled={importMutation.isPending}
        className={className}
      >
        <Upload size={16} />
        {showLabel && (
          <span>{importMutation.isPending ? "Importing..." : "Import"}</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={importFile}
        className="sr-only"
      />
    </>
  );
}
