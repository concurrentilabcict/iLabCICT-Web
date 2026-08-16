export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? API_BASE_URL;

export const buildApiUrl = (endpoint: string) => {
    if (!API_BASE_URL) {
        throw new Error("VITE_API_BASE_URL is not configured.");
    }

    const baseUrl = API_BASE_URL.replace(/\/$/, "");
    const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

    return `${baseUrl}${normalizedEndpoint}`;
};

export const buildWebSocketUrl = (
    endpoint: string,
    queryParams: Record<string, string> = {}
) => {
    if (!WS_BASE_URL) {
        throw new Error("VITE_WS_BASE_URL is not configured.");
    }

    const baseUrl = WS_BASE_URL
        .replace(/^http:/, "ws:")
        .replace(/^https:/, "wss:")
        .replace(/\/$/, "");
    const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;
    const url = new URL(`${baseUrl}${normalizedEndpoint}`);

    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
};

export const privateFetch = async (
    url: string,
    options: RequestInit = {}
) => {
    let accessToken = localStorage.getItem("accessToken") || "";

    const makeRequest = () => {
        const isFormData = options.body instanceof FormData;

        return fetch(url, {
            ...options,
            headers: {
                ...(isFormData
                    ? {}
                    : { "Content-Type": "application/json" }),

                ...(options.headers || {}),

                Authorization: `Bearer ${accessToken}`,
            },
        });
    };

    let res = await makeRequest();

    if (res.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");

        const refreshRes = await fetch(
            "https://ilabcict-backend.onrender.com/api/auth/refresh/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            }
        );

        if (!refreshRes.ok) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            window.location.href = "/login";

            throw new Error("Session expired");
        }

        const data = await refreshRes.json();

        accessToken = data.access;

        localStorage.setItem("accessToken", accessToken);

        res = await makeRequest();
    }

    return res;
};

export const publicFetch = (
    url: string,
    options: RequestInit = {}
) => {
    const isFormData = options.body instanceof FormData;

    return fetch(url, {
        ...options,
        headers: {
            ...(isFormData
                ? {}
                : { "Content-Type": "application/json" }),

            ...(options.headers || {}),
        },
    });
};

export type ApiError = Error & {
    status?: number;
};

export function createApiError(
    status: number,
    message: string
): ApiError {
    const error = new Error(message) as ApiError;

    error.status = status;

    return error;
} 
