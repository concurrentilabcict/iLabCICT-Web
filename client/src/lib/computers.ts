import type { ApiComputer } from "@/types/createTicket";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";

type ApiErrorPayload = {
    detail?: string;
    message?: string;
};

const REQUEST_TIMEOUT_MS = 15_000;

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

const isComputerResponse = (body: unknown): body is ApiComputer => {
    if (typeof body !== "object" || body === null) {
        return false;
    }

    const candidate = body as Partial<ApiComputer>;

    return (
        typeof candidate.id === "number" &&
        typeof candidate.computer_code === "string" &&
        typeof candidate.room === "object" &&
        candidate.room !== null &&
        typeof candidate.room.id === "number"
    );
};

export const fetchComputerByCode = async (computerCode: string) => {
    const endpoint = buildApiUrl(
        `/api/computers/${encodeURIComponent(computerCode)}/`
    );
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await privateFetch(endpoint, { signal: controller.signal });
        const body = await readResponseBody(response);

        if (!response.ok) {
            const payload = typeof body === "object" && body !== null
                ? body as ApiErrorPayload
                : null;
            const message = payload?.detail ?? payload?.message ?? "Failed to load computer details.";

            console.error("Computer lookup REST request failed", {
                endpoint,
                status: response.status,
                statusText: response.statusText,
                response: body,
            });

            throw createApiError(response.status, message);
        }

        if (!isComputerResponse(body)) {
            console.error("Computer lookup REST response is invalid", {
                endpoint,
                status: response.status,
                response: body,
            });

            throw createApiError(response.status, "The server returned invalid computer data.");
        }

        return body;
    } catch (error) {
        if (!(error instanceof Error && "status" in error)) {
            console.error("Computer lookup REST request failed", { endpoint, error });
        }

        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error(
                "The computer lookup timed out. Check your connection and try again.",
                { cause: error }
            );
        }

        throw error;
    } finally {
        window.clearTimeout(timeout);
    }
};
