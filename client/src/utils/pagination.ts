const DEFAULT_PAGE_WINDOW_SIZE = 5;

export const getPaginationWindow = (
    currentPage: number,
    totalPages: number,
    windowSize = DEFAULT_PAGE_WINDOW_SIZE
) => {
    const safeTotalPages = Math.max(totalPages, 1);
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
    const windowStart =
        Math.floor((safeCurrentPage - 1) / windowSize) * windowSize + 1;
    const windowEnd = Math.min(windowStart + windowSize - 1, safeTotalPages);

    return Array.from(
        { length: windowEnd - windowStart + 1 },
        (_, index) => windowStart + index
    );
};
