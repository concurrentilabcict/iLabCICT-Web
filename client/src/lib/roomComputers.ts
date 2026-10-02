import type { ApiComputerCard, ApiRoomComputers, ComputerCardType } from "@/types/computer";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type { QueryClient } from "@tanstack/react-query";
import type { Ticket } from "@/types/ticket";

export const recentComputerArchiveKey = (roomId: string) => ["recent-computer-archive", roomId] as const;

export const mapComputerCard = (computer: ApiComputerCard): ComputerCardType => ({
    id: computer.id,
    computerCode: computer.computer_code,
    computerNumber: computer.computer_number,
    isArchived: computer.is_archived === true,
    room: computer.room,
    operatingSystem: computer.operating_system,
    gpu: computer.gpu,
    cpu: computer.cpu,
    ramSizeInstalled: computer.ram_size_installed,
    diskSizeInstalled: computer.disk_size_installed,
    buildVersion: computer.build_version,
    computerStatus: computer.computer_status,
    motherboard: computer.motherboard,
    monitorStatus: computer.monitor_status,
    mouseStatus: computer.mouse_status,
    keyboardStatus: computer.keyboard_status,
    upsStatus: computer.ups_status,
    createdAt: computer.created_at,
    updatedAt: computer.updated_at,
});

export const refreshRoomComputerCaches = async (queryClient: QueryClient, roomId: string) => {
    const room = await fetchRoomComputers(roomId);
    for (const prefix of ["admin-room-computers", "technician-room-computers", "computers"]) {
        queryClient.setQueryData([prefix, roomId], room.computers.map(mapComputerCard));
    }
};

export const handleComputerTransferEvent = (
    value: unknown,
    queryClient: QueryClient,
    roomId: string,
) => {
    if (typeof value !== "object" || value === null || !("event" in value)) return false;
    if (value.event !== "computer_transferred_in" && value.event !== "computer_transferred_out") return false;
    const payload = value as Record<string, unknown>;
    const transferredIds = Array.isArray(payload.computers_ids) ? payload.computers_ids : [];
    for (const prefix of ["admin-room-computers", "technician-room-computers", "computers"]) {
        queryClient.setQueryData<ComputerCardType[]>([prefix, roomId], (items) => {
            if (!items) return items;
            if (value.event === "computer_transferred_out") {
                return items.filter((item) => !transferredIds.includes(item.id));
            }
            // Destination membership comes from the room-scoped event, even if room is stale in its records.
            if (value.event === "computer_transferred_in" && Array.isArray(payload.transferred_computers)) {
                const incoming = payload.transferred_computers.filter((computer): computer is ApiComputerCard =>
                    typeof computer === "object" && computer !== null &&
                    typeof computer.id === "number" && typeof computer.computer_code === "string"
                ).map(mapComputerCard);
                const incomingIds = new Set(incoming.map((computer) => computer.id));
                return [...incoming, ...items.filter((item) => !incomingIds.has(item.id))];
            }
            return items;
        });
    }
    if (value.event === "computer_transferred_out") {
        const notice = queryClient.getQueryData<ComputerCardType | null>(recentComputerArchiveKey(roomId));
        if (notice && transferredIds.includes(notice.id)) {
            queryClient.setQueryData(recentComputerArchiveKey(roomId), null);
        }
    }
    void queryClient.invalidateQueries({ queryKey: ["rooms"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard-rooms"] });
    void queryClient.invalidateQueries({ queryKey: ["computer"] });
    void queryClient.invalidateQueries({ queryKey: ["request-history"] });
    void refreshRoomComputerCaches(queryClient, roomId).catch((error: unknown) => {
        console.error("Failed to reconcile transferred computers", error);
    });
    return true;
};

export const removeComputerTicketsFromCache = (queryClient: QueryClient, computerId: number) => {
    for (const key of ["tickets", "technician-tickets", "admin-tickets", "admin-dashboard-tickets"]) {
        queryClient.setQueryData<Ticket[]>([key], (items) =>
            items?.filter((ticket) => ticket.computer?.id !== computerId)
        );
    }
    void queryClient.invalidateQueries({ queryKey: ["admin-archived-tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["request-history"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-repair-logs"] });
    void queryClient.invalidateQueries({ queryKey: ["repairLogs"] });
};

export const getComputerArchiveEvent = (value: unknown) => {
    if (typeof value !== "object" || value === null || !("event" in value)) return null;
    if (value.event !== "computer_archived" && value.event !== "computer_unarchived") return null;
    const payload = value as Record<string, unknown>;
    const computer = payload.computer;
    const updatedComputer = typeof computer === "object" && computer !== null &&
        "id" in computer && typeof computer.id === "number" &&
        "computer_code" in computer && typeof computer.computer_code === "string" &&
        "room" in computer && typeof computer.room === "number"
        ? computer as ApiComputerCard : null;
    const id = typeof computer === "number" ? computer
        : typeof computer === "object" && computer !== null && "id" in computer ? computer.id
        : payload.computer_id ?? payload.id;
    return { event: value.event, id: typeof id === "number" ? id : null, computer: updatedComputer };
};

type ApiErrorPayload = {
    detail?: string;
    message?: string;
};

const REQUEST_TIMEOUT_MS = 15_000;

const isRoomComputersResponse = (body: unknown): body is ApiRoomComputers => {
    if (typeof body !== "object" || body === null) {
        return false;
    }

    const candidate = body as Partial<ApiRoomComputers>;

    return (
        typeof candidate.id === "number" &&
        typeof candidate.room_name === "string" &&
        typeof candidate.building_name === "string" &&
        typeof candidate.floor_number === "number" &&
        Array.isArray(candidate.computers)
    );
};

const readResponseBody = async (response: Response): Promise<unknown> => {
    const responseText = await response.text();

    if (!responseText) {
        return null;
    }

    try {
        return JSON.parse(responseText) as unknown;
    } catch {
        return responseText;
    }
};

const getErrorMessage = (body: unknown) => {
    if (typeof body === "object" && body !== null) {
        const payload = body as ApiErrorPayload;
        return payload.detail ?? payload.message;
    }

    return typeof body === "string" ? body : undefined;
};

export const fetchRoomComputers = async (roomId: string) => {
    const endpoint = buildApiUrl(
        `/api/rooms/${encodeURIComponent(roomId)}/computers/`
    );

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await privateFetch(endpoint, { signal: controller.signal });
        const body = await readResponseBody(response);

        if (!response.ok) {
            const message = getErrorMessage(body) ?? "Failed to fetch computers.";

            console.error("Room computers REST request failed", {
                endpoint,
                status: response.status,
                statusText: response.statusText,
                response: body,
            });

            throw createApiError(response.status, message);
        }

        if (!isRoomComputersResponse(body)) {
            console.error("Room computers REST response is invalid", {
                endpoint,
                status: response.status,
                response: body,
            });

            throw createApiError(
                response.status,
                "The server returned invalid laboratory data."
            );
        }

        return body;
    } catch (error) {
        if (!(error instanceof Error && "status" in error)) {
            console.error("Room computers REST request failed", {
                endpoint,
                error,
            });
        }

        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error(
                "The request timed out. Check your connection and try again.",
                { cause: error }
            );
        }

        throw error;
    } finally {
        window.clearTimeout(timeout);
    }
};
