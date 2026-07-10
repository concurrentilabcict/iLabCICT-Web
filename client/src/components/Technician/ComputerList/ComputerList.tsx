import { useMediaQuery } from "@/hooks/useMediaQuery";
import ComputerCard from "./ComputerCard";
import type { Status, StatusFilter } from "@/utils/computer";
import type { ComputerList, ComputerCardType } from "@/types/computer";
import { useQuery } from "@tanstack/react-query";
import { createApiError, privateFetch } from "@/lib/api";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type { Computer } from "@/types/ticket";
import AddComputerForm from "./AddComputerForm";

type ComputerListProps = {
    roomName: string,
    searchQuery: string,
    statusFilter: StatusFilter,
    setCustodian: Function,
    sheetOpen: boolean,
    setSheetOpen: (open: boolean) => void
}

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export default function ComputerList({
    roomName,
    searchQuery,
    statusFilter,
    setCustodian,
    sheetOpen,
    setSheetOpen
}: ComputerListProps){

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [selectedPcId, setSelectedPcId] = useState<number | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [roomId, setRoomId] = useState<number | null>(null);

    const ITEMS_PER_PAGE = 10;
    const filterKey  = JSON.stringify([statusFilter, searchQuery]);
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey
    });

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);

        if (!open) {
            setSearchParams({}, { replace: true });
        }
    }

    const mapComputerCard = (computerCard: any): ComputerCardType => ({
        id: computerCard.id,
        computerCode: computerCard.computer_code,
        operatingSystem: computerCard.operating_system,
        computerStatus: computerCard.computer_status,
        createdAt: computerCard.created_at,
        updatedAt: computerCard.updated_at,
    })


    const { data: computers = [], isLoading } = useQuery<ComputerCardType[]>({
        queryKey: ["computers", roomName],
        queryFn: async ()=> {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/rooms/${roomName}/computers/`);

            const data = await res.json();

            console.log(data)
            const custodian = data.assigned_custodian.first_name + " " + data.assigned_custodian.last_name
            setCustodian(custodian)
            setRoomId(data.id)

            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch computers.');
            }

            return data.computers.map(mapComputerCard)
         }
    });

    const filteredComputers = useMemo(() => {
        const normalizedQuery = searchQuery?.trim()

        return [...computers]
            .sort(
                (a, b) => 
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .filter((computer)=> {
                    const status = formatLabel(computer.computerStatus) as Status

                    const matchesStatus =
                        statusFilter === "All" || status === statusFilter;

                    const searchableText = [
                        computer.computerCode,
                        computer.computerStatus
                    ]
                        .join(" ")
                        .toLowerCase();
                    
                    const matchesSearch = 
                        normalizedQuery === "" || 
                        searchableText.includes(normalizedQuery)

                    return matchesStatus && matchesSearch
                });
    }, [computers, statusFilter, searchQuery]);


    const totalPages = Math.ceil(
        filteredComputers.length / ITEMS_PER_PAGE
    )

    const maxPage = Math.max(totalPages, 1);
    const currentPage = pagination.filterKey === filterKey
        ?Math.min(pagination.page, maxPage)
        : 1;

    const goToPage = (page: number) => {
        setPagination({
            page: Math.min(Math.max(page, 1), maxPage),
            filterKey
        });
    };

    const paginatedComputers = filteredComputers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    return(
        <>
            <div className={`flex items-center w-full flex-col gap-3 px-3 py-3
            sm:grid sm:grid-cols-2 mb-3`}>

                {isLoading && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        Loading computers...
                    </p>
                )}

                {!isLoading && paginatedComputers.length === 0 && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No Computers found.
                    </p>
                )}

                {!isLoading && paginatedComputers.map((computer)=> {

                        const status = formatLabel(computer.computerStatus) as Status

                        return(
                            <ComputerCard key={computer.id} computerCode={computer.computerCode} computerStatus={status}
                                updatedAt={computer.updatedAt} operatingSystem={computer.operatingSystem}
                            />
                        );

                    }
                
                )}
            </div>

            <div className={`px-3 ${isMobile ? "mb-23" : "mb-10"}`}>
                {totalPages > 1 && (
                    <Pagination className={`flex ${isMobile ? "justify-center" : "justify-end"}`}>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => goToPage(currentPage - 1)}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem key={i + 1}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => goToPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => goToPage(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            <Sheet
            open={sheetOpen}
            onOpenChange={handleSheetOpenChange}
            >
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={
                    isMobile
                        ? "h-[90vh]"
                        : "w-[1000px]!"
                }
            >
                    <AddComputerForm
                        room={roomId}
                        closeSheet={() => setSheetOpen(false)}
                    />
            </SheetContent>
        </Sheet>
        </>
        );
}