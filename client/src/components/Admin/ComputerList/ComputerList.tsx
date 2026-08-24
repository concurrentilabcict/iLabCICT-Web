import { useMediaQuery } from "@/hooks/useMediaQuery";
import ComputerCard from "./ComputerCard";
import type { Status, StatusFilter } from "@/utils/computer";
import type {
    ApiComputerCard,
    ApiRoomComputers,
    ComputerCardType
} from "@/types/computer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { buildWebSocketUrl, getFreshAccessToken } from "@/lib/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPaginationWindow } from "@/utils/pagination";

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
import AddComputerForm from "./AddComputerForm";
import EditComputerForm from "./EditComputerForm";
type ComputerListProps = {
    setComputers: (computers: ComputerCardType[]) => void,
    roomId: string,
    searchQuery: string,
    statusFilter: StatusFilter,
    setCustodian: (custodian: string) => void,
    setRoomMeta: (meta: { buildingName: string; floorNumber: number; technicianName: string }) => void,
    setRoomName: (roomName: string) => void,
    setRequestHistoryRoomId: (roomId: number | null) => void,
    sheetOpen: boolean,
    isEditing: boolean,
    selectedComputer: ComputerCardType, 
    setSheetOpen: (open: boolean) => void,
    setIsEditing: (open: boolean) => void,
    setSelectedComputer: (computer: ComputerCardType) => void
}

type RoomComputersWebSocketEvent =
    | {
        event: "initial_room_computers";
        initial_computers: ApiRoomComputers;
        next?: string | null;
        next_after_id?: string | null;
    }
    | {
        event: "computer_created" | "computer_updated";
        computer: ApiComputerCard | ApiComputerCard[];
    };

const ROOM_COMPUTERS_QUERY_KEY = "admin-room-computers";
const ROOM_COMPUTERS_READY_QUERY_KEY = "admin-room-computers-ready";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isRoomComputersWebSocketEvent = (
    value: unknown
): value is RoomComputersWebSocketEvent => {
    if (!isRecord(value) || typeof value.event !== "string") {
        return false;
    }

    if (value.event === "initial_room_computers") {
        return isRecord(value.initial_computers);
    }

    return (
        ["computer_created", "computer_updated"].includes(value.event) &&
        (isRecord(value.computer) || Array.isArray(value.computer))
    );
};

const formatLabel = (text: string) => {
    return text
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export default function ComputerList({
    setComputers,
    roomId,
    searchQuery,
    statusFilter,
    setCustodian,
    setRoomMeta,
    setRoomName,
    setRequestHistoryRoomId,
    sheetOpen,
    isEditing,
    selectedComputer,
    setSheetOpen,
    setIsEditing,
    setSelectedComputer,
}: ComputerListProps){

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const computerSocketRef = useRef<WebSocket | null>(null);
    const queryKey = useMemo(
        () => [ROOM_COMPUTERS_QUERY_KEY, roomId] as const,
        [roomId]
    );
    const readyQueryKey = useMemo(
        () => [ROOM_COMPUTERS_READY_QUERY_KEY, roomId] as const,
        [roomId]
    );
    const cachedComputersAreReady =
        queryClient.getQueryData<boolean>(readyQueryKey) === true;
    const [computerReadiness, setComputerReadiness] = useState({
        roomId,
        isReady: cachedComputersAreReady
    });
    const hasInitialComputers =
        computerReadiness.roomId === roomId
            ? computerReadiness.isReady
            : cachedComputersAreReady;
    const [roomDatabaseId, setRoomDatabaseId] = useState<number | null>(null);

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

    const upsertComputer = useCallback((
        currentComputers: ComputerCardType[],
        apiComputer: ApiComputerCard
    ) => {
        const computer = mapComputerCard(apiComputer);
        const computerExists = currentComputers.some(
            (currentComputer) => currentComputer.id === computer.id
        );

        if (!computerExists) {
            return [computer, ...currentComputers];
        }

        return currentComputers.map((currentComputer) =>
            currentComputer.id === computer.id ? computer : currentComputer
        );
    }, []);

    const { data: computers = [], isPending } = useQuery<ComputerCardType[]>({
        queryKey,
        queryFn: () =>
            Promise.resolve(
                queryClient.getQueryData<ComputerCardType[]>(queryKey) ?? []
            ),
        initialData: () =>
            queryClient.getQueryData<ComputerCardType[]>(queryKey) ?? [],
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    });
    const isLoading = isPending || !hasInitialComputers;

    useEffect(() => {
        setComputers(computers);
    }, [computers, setComputers]);

    useEffect(() => {
        let socket: WebSocket | null = null;
        const connectSocket = window.setTimeout(async () => {
            const accessToken = await getFreshAccessToken();

            if (!accessToken || !roomId) {
                return;
            }

            socket = new WebSocket(
                buildWebSocketUrl(`/ws/rooms/${roomId}/computers/`, {
                    token: accessToken,
                })
            );

            computerSocketRef.current = socket;

            socket.addEventListener("message", (event: MessageEvent<string>) => {
                let parsedMessage: unknown;

                try {
                    parsedMessage = JSON.parse(event.data);
                } catch {
                    return;
                }

                if (!isRoomComputersWebSocketEvent(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_room_computers") {
                    const roomComputers = parsedMessage.initial_computers;
                    const custodian = roomComputers.assigned_custodian
                        ? `${roomComputers.assigned_custodian.first_name} ${roomComputers.assigned_custodian.last_name}`
                        : "No custodian";
                    const technician = roomComputers.assigned_technician
                        ? `${roomComputers.assigned_technician.first_name} ${roomComputers.assigned_technician.last_name}`
                        : "No Assigned";
                    const mappedComputers = roomComputers.computers.map(mapComputerCard);

                    setRoomName(roomComputers.room_name);
                    setCustodian(custodian);
                    setRoomMeta({
                        buildingName: roomComputers.building_name,
                        floorNumber: roomComputers.floor_number,
                        technicianName: technician
                    });
                    setRoomDatabaseId(roomComputers.id);
                    setRequestHistoryRoomId(roomComputers.id);
                    setComputerReadiness({ roomId, isReady: true });
                    queryClient.setQueryData(readyQueryKey, true);
                    queryClient.setQueryData<ComputerCardType[]>(
                        queryKey,
                        mappedComputers
                    );
                    return;
                }

                const updatedComputers = Array.isArray(parsedMessage.computer)
                    ? parsedMessage.computer
                    : [parsedMessage.computer];

                queryClient.setQueryData<ComputerCardType[]>(
                    queryKey,
                    (currentComputers = []) =>
                        updatedComputers.reduce(
                            (nextComputers, computer) =>
                                upsertComputer(nextComputers, computer),
                            currentComputers
                        )
                );
            });
        }, 0);

        return () => {
            window.clearTimeout(connectSocket);
            socket?.close();

            if (computerSocketRef.current === socket) {
                computerSocketRef.current = null;
            }
        };
    }, [queryClient, queryKey, readyQueryKey, roomId, setCustodian, setComputers, setRequestHistoryRoomId, setRoomMeta, setRoomName, upsertComputer]);

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
    const visiblePages = getPaginationWindow(currentPage, totalPages);

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
                                setIsEditing={setIsEditing}
                                setSheetOpen={setSheetOpen}
                                setSelectedComputer={setSelectedComputer} 
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

                            {visiblePages.map((pageNumber) => (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        isActive={currentPage === pageNumber}
                                        onClick={() => goToPage(pageNumber)}
                                    >
                                        {pageNumber}
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
                    {isEditing ? (
                        <EditComputerForm
                            computer={selectedComputer}
                            closeSheet={() => setSheetOpen(false)}
                        />
                        ) : (
                        <AddComputerForm
                            room={roomDatabaseId}
                            closeSheet={() => setSheetOpen(false)}
                        />
                        )}
            </SheetContent>
        </Sheet>
        </>
        );
}
