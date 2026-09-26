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
import { readRoomWorkbook, type RoomExcelRecord } from "@/utils/roomExcel";

type RoomExcelImportProps = {
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
  "out_of_service",
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

const parseOptionalId = (value: string, rowNumber: number) => {
  if (!value.trim()) {
    return null;
  }

  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      `Row ${rowNumber}: assigned user IDs must be positive whole numbers.`
    );
  }

  return id;
};

const createPayload = (
  record: RoomExcelRecord,
  rowNumber: number
): RoomImportPayload => {
  const roomName = record["Room Name"].trim();
  const floorNumber = Number(record["Floor Number"]);
  const buildingName = record["Building Name"].trim().toLowerCase();
  const normalizedStatus = record.Status.trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  const roomStatus =
    normalizedStatus.replace(/\s/g, "") === "outofservice"
      ? "out_of_service"
      : normalizedStatus;

  if (!roomName) {
    throw new Error(`Row ${rowNumber}: Room Name is required.`);
  }

  if (!isFloorNumber(floorNumber)) {
    throw new Error(`Row ${rowNumber}: Floor Number must be 1, 2, or 3.`);
  }

  if (!isBuildingName(buildingName)) {
    throw new Error(
      `Row ${rowNumber}: Building Name must be ${buildingNames.join(", ")}.`
    );
  }

  if (!isRoomStatus(roomStatus)) {
    throw new Error(
      `Row ${rowNumber}: Status must be ${roomStatuses.join(", ")}.`
    );
  }

  return {
    room_name: roomName,
    floor_number: floorNumber,
    building_name: buildingName,
    room_status: roomStatus,
    assigned_custodian: parseOptionalId(
      record["Assigned Custodian ID"],
      rowNumber
    ),
    assigned_technician: parseOptionalId(
      record["Assigned Technician ID"],
      rowNumber
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

export default function RoomExcelImport({
  showLabel,
  className,
}: RoomExcelImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const records = await readRoomWorkbook(file);
      const payloads = records.map((record, index) =>
        createPayload(record, index + 1)
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
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
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
        aria-label="Import laboratories from Excel"
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
