import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type ResponsivePaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
};

type MobilePageItem = number | "start-ellipsis" | "end-ellipsis";

const getMobilePageItems = (
    currentPage: number,
    totalPages: number
): MobilePageItem[] => {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, "end-ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, "start-ellipsis", totalPages - 2, totalPages - 1, totalPages];
    }

    return [
        1,
        "start-ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "end-ellipsis",
        totalPages,
    ];
};

export default function ResponsivePagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: ResponsivePaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const previousDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= totalPages;
    const mobilePageItems = getMobilePageItems(currentPage, totalPages);
    const allPages = Array.from({ length: totalPages }, (_, index) => index + 1);

    const pageLink = (page: number) => (
        <PaginationItem key={page}>
            <PaginationLink
                href="#"
                isActive={currentPage === page}
                aria-label={`Go to page ${page}`}
                className="size-7 min-[360px]:size-8"
                onClick={(event) => {
                    event.preventDefault();
                    onPageChange(page);
                }}
            >
                {page}
            </PaginationLink>
        </PaginationItem>
    );

    const previous = (
        <PaginationItem>
            <PaginationPrevious
                href="#"
                aria-disabled={previousDisabled}
                tabIndex={previousDisabled ? -1 : undefined}
                className={`size-7 p-0! min-[360px]:size-8 md:h-8 md:w-auto md:pr-2.5! md:pl-1.5! ${
                    previousDisabled ? "pointer-events-none opacity-40" : ""
                }`}
                onClick={(event) => {
                    event.preventDefault();
                    if (!previousDisabled) onPageChange(currentPage - 1);
                }}
            />
        </PaginationItem>
    );

    const next = (
        <PaginationItem>
            <PaginationNext
                href="#"
                aria-disabled={nextDisabled}
                tabIndex={nextDisabled ? -1 : undefined}
                className={`size-7 p-0! min-[360px]:size-8 md:h-8 md:w-auto md:pr-1.5! md:pl-2.5! ${
                    nextDisabled ? "pointer-events-none opacity-40" : ""
                }`}
                onClick={(event) => {
                    event.preventDefault();
                    if (!nextDisabled) onPageChange(currentPage + 1);
                }}
            />
        </PaginationItem>
    );

    return (
        <Pagination className={className}>
            <PaginationContent className="max-w-full md:hidden">
                {previous}
                {mobilePageItems.map((item) =>
                    typeof item === "number" ? (
                        pageLink(item)
                    ) : (
                        <PaginationItem key={item}>
                            <PaginationEllipsis className="size-6 min-[360px]:size-7" />
                        </PaginationItem>
                    )
                )}
                {next}
            </PaginationContent>

            <PaginationContent className="hidden md:flex">
                {previous}
                {allPages.map(pageLink)}
                {next}
            </PaginationContent>
        </Pagination>
    );
}
