import type { ApiComputerCard, ApiRoomComputers } from "@/types/computer";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type { QueryClient } from "@tanstack/react-query";
import type { Ticket } from "@/types/ticket";

export const recentComputerArchiveKey = (roomId: string) => ["recent-computer-archive", roomId] as const;

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
