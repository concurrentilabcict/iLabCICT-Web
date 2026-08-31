import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

type TableSkeletonProps = { columns: number; rows?: number };

export default function TableSkeleton({ columns, rows = 8 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {Array.from({ length: columns }, (_, columnIndex) => (
                        <TableCell key={columnIndex}>
                            <Skeleton className={columnIndex === 0 ? "h-4 w-20" : columnIndex === columns - 1 ? "h-4 w-16" : "h-4 w-full max-w-40"} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}
