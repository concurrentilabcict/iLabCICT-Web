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

    {/*if (res.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        throw new Error("Session expired");
    }*/}

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