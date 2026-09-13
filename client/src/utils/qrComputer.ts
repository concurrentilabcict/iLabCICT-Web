const COMPUTER_QUERY_PARAMS = ["computer", "computerCode", "code"] as const;

export const getComputerCodeFromQrValue = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return null;
    }

    try {
        const url = new URL(trimmedValue, window.location.origin);
        const parts = url.pathname.split("/").filter(Boolean);
        const laboratoryIndex = parts.indexOf("manage-laboratory");

        if (laboratoryIndex >= 0 && parts[laboratoryIndex + 2]) {
            return decodeURIComponent(parts[laboratoryIndex + 2]).trim() || null;
        }

        for (const parameter of COMPUTER_QUERY_PARAMS) {
            const computerCode = url.searchParams.get(parameter)?.trim();

            if (computerCode) {
                return computerCode;
            }
        }

        if (!trimmedValue.includes("/") && !trimmedValue.includes("?")) {
            return trimmedValue;
        }

        return null;
    } catch {
        return trimmedValue;
    }
};
