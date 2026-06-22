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