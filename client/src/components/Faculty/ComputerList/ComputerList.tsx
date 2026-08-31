import { useMediaQuery } from "@/hooks/useMediaQuery";
import ComputerCard from "./ComputerCard";
import type { Status, StatusFilter } from "@/utils/computer";
import type { ApiComputerCard, ApiRoomComputers, ComputerCardType } from "@/types/computer";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { useMemo, useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
type ComputerListProps = {
    roomId: string,
    searchQuery: string,
    statusFilter: StatusFilter,
    setCustodian: (custodian: string) => void,
    setRoomDatabaseId: (roomId: number | null) => void,
    setRoomName: (roomName: string) => void,
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
    roomId,
    searchQuery,
    statusFilter,
    setCustodian,
    setRoomDatabaseId,
    setRoomName,
}: ComputerListProps){

    const isMobile = useMediaQuery("(max-width: 767px)");

    const ITEMS_PER_PAGE = 10;
    const filterKey  = JSON.stringify([statusFilter, searchQuery]);
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey
    });

    const mapComputerCard = (computerCard: ApiComputerCard): ComputerCardType => ({
        id:computerCard.id,
        computerCode: computerCard.computer_code,
        room: computerCard.room,
        operatingSystem: computerCard.operating_system,
        gpu: computerCard.gpu,
        cpu: computerCard.cpu,
        ramSizeInstalled: computerCard.ram_size_installed,
        diskSizeInstalled: computerCard.disk_size_installed,
        buildVersion: computerCard.build_version,
        computerStatus: computerCard.computer_status,
        motherboard: computerCard.motherboard,
        monitorStatus: computerCard.monitor_status,
        mouseStatus: computerCard.mouse_status,
        keyboardStatus: computerCard.keyboard_status,
        upsStatus: computerCard.ups_status,
        createdAt: computerCard.created_at,
        updatedAt: computerCard.updated_at
    })


    const { data: computers = [], isLoading } = useQuery<ComputerCardType[]>({
        queryKey: ["computers", roomId],
        queryFn: async ()=> {
            const res = await privateFetch(buildApiUrl(`/api/rooms/${encodeURIComponent(roomId)}/computers/`));

            const data = await res.json() as ApiRoomComputers & { message?: string };

            if(!res.ok){
                throw createApiError(res.status, data.message || 'Failed to fetch computers.');
            }

            const custodian = data.assigned_custodian
                ? `${data.assigned_custodian.first_name} ${data.assigned_custodian.last_name}`
                : "No assigned custodian";
            setCustodian(custodian);
            setRoomDatabaseId(data.id);
            setRoomName(data.room_name);

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

                        return(
                            <ComputerCard 
                                key={computer.id}
                                computer={computer}
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
        </>
        );
}
