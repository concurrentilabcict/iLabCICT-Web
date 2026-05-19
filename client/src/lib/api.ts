export const privateFetch = async (url: string, options: RequestInit = {}) => {
    let accessToken = localStorage.getItem("accessToken") || "";
    console.log("TOKEN:", accessToken);

    const makeRequest = () =>
        fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
                Authorization: `Bearer ${accessToken}`,
            },
        });

    let res = await makeRequest();

    if (res.status === 401) {
        const refreshRes = await fetch("http://localhost:3000/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (!refreshRes.ok) {
            localStorage.removeItem("accessToken");
            window.location.href = "/";
            throw new Error("Session expired");
        }

        const data = await refreshRes.json();
        accessToken = data.accessToken;
        localStorage.setItem("accessToken", accessToken);

        res = await makeRequest();
    }

    return res;
};

export const publicFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
};