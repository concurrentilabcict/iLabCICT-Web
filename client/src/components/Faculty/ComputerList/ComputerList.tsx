import { useMediaQuery } from "@/hooks/useMediaQuery";
import ComputerCard from "./ComputerCard";
import ComputerListSkeleton from "@/components/ComputerListSkeleton/ComputerListSkeleton";
import type { Status, StatusFilter } from "@/utils/computer";
import type { ApiComputerCard, ApiRoomComputers, ComputerCardType } from "@/types/computer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    buildWebSocketUrl,
    getFreshAccessToken,
} from "@/lib/api";
import { fetchRoomComputers, getComputerArchiveEvent, removeComputerTicketsFromCache } from "@/lib/roomComputers";
import { useEffect, useMemo, useRef, useState } from "react";
import ResponsivePagination from "@/components/ResponsivePagination/ResponsivePagination";
type ComputerListProps = {
    roomId: string,
    searchQuery: string,
    statusFilter: StatusFilter,
    setCustodian: (custodian: string) => void,
    setComputers: (computers: ComputerCardType[]) => void,
    setRoomMeta: (meta: { buildingName: string; floorNumber: number; technicianName: string }) => void,
    setRoomDatabaseId: (roomId: number | null) => void,
    setRoomName: (roomName: string) => void,
    onLoadStateChange: (state: "loading" | "success" | "error") => void,
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

const mapComputerCard = (computerCard: ApiComputerCard): ComputerCardType => ({
    id: computerCard.id,
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
    updatedAt: computerCard.updated_at,
});

const upsertComputer = (
    computers: ComputerCardType[],
    apiComputer: ApiComputerCard
) => {
    const computer = mapComputerCard(apiComputer);
    const computerExists = computers.some(
        (currentComputer) => currentComputer.id === computer.id
    );

    if (!computerExists) {
        return [computer, ...computers];
    }

    return computers.map((currentComputer) =>
        currentComputer.id === computer.id ? computer : currentComputer
    );
};

export default function ComputerList({
    roomId,
    searchQuery,
    statusFilter,
    setCustodian,
    setComputers,
    setRoomMeta,
    setRoomDatabaseId,
    setRoomName,
    onLoadStateChange,
}: ComputerListProps){
    const queryClient = useQueryClient();
    const computerSocketRef = useRef<WebSocket | null>(null);
    const isMobile = useMediaQuery("(max-width: 767px)");

    const ITEMS_PER_PAGE = 10;
    const filterKey  = JSON.stringify([statusFilter, searchQuery]);
    const [pagination, setPagination] = useState({
        page: 1,
        filterKey
    });

    const { data: computers = [], isLoading, isError, error, refetch } = useQuery<ComputerCardType[]>({
        queryKey: ["computers", roomId],
        queryFn: async ()=> {
            const data = await fetchRoomComputers(roomId);

            const custodian = data.assigned_custodian
                ? `${data.assigned_custodian.first_name} ${data.assigned_custodian.last_name}`
                : "No assigned custodian";
            setCustodian(custodian);
            setRoomMeta({
                buildingName: data.building_name,
                floorNumber: data.floor_number,
                technicianName: data.assigned_technician
                    ? `${data.assigned_technician.first_name} ${data.assigned_technician.last_name}`
                    : "No Assigned",
            });
            setRoomDatabaseId(data.id);
            setRoomName(data.room_name);

            return data.computers.map(mapComputerCard)
         },
        enabled: Boolean(roomId),
        networkMode: "always",
        retry: 1,
        retryDelay: 750,
    });

    useEffect(() => {
        onLoadStateChange(isLoading ? "loading" : isError ? "error" : "success");
    }, [isError, isLoading, onLoadStateChange]);

    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectTimer: number | undefined;
        let shouldReconnect = true;

        const connectSocket = async () => {
            const accessToken = await getFreshAccessToken();

            if (!accessToken || !roomId || !shouldReconnect) {
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

                const archiveEvent = getComputerArchiveEvent(parsedMessage);
                if (archiveEvent) {
                    if (archiveEvent.event === "computer_archived" && archiveEvent.id !== null) {
                        queryClient.setQueryData<ComputerCardType[]>(["computers", roomId],
                            (items = []) => items.filter((item) => item.id !== archiveEvent.id));
                        removeComputerTicketsFromCache(queryClient, archiveEvent.id);
                    } else {
                        void queryClient.invalidateQueries({ queryKey: ["computers", roomId] });
                    }
                    return;
                }

                if (!isRoomComputersWebSocketEvent(parsedMessage)) {
                    return;
                }

                if (parsedMessage.event === "initial_room_computers") {
                    const roomComputers = parsedMessage.initial_computers;
                    const custodian = roomComputers.assigned_custodian
                        ? `${roomComputers.assigned_custodian.first_name} ${roomComputers.assigned_custodian.last_name}`
                        : "No assigned custodian";

                    setCustodian(custodian);
                    setRoomMeta({
                        buildingName: roomComputers.building_name,
                        floorNumber: roomComputers.floor_number,
                        technicianName: roomComputers.assigned_technician
                            ? `${roomComputers.assigned_technician.first_name} ${roomComputers.assigned_technician.last_name}`
                            : "No Assigned",
                    });
                    setRoomDatabaseId(roomComputers.id);
                    setRoomName(roomComputers.room_name);
                    queryClient.setQueryData<ComputerCardType[]>(
                        ["computers", roomId],
                        roomComputers.computers.map(mapComputerCard)
                    );
                    return;
                }

                const updatedComputers = Array.isArray(parsedMessage.computer)
                    ? parsedMessage.computer
                    : [parsedMessage.computer];

                queryClient.setQueryData<ComputerCardType[]>(
                    ["computers", roomId],
                    (currentComputers = []) =>
                        updatedComputers.reduce(
                            (nextComputers, computer) =>
                                upsertComputer(nextComputers, computer),
                            currentComputers
                        )
                );
            });

            socket.addEventListener("close", () => {
                if (shouldReconnect) {
                    reconnectTimer = window.setTimeout(connectSocket, 1_500);
                }
            });
        };

        const connectTimer = window.setTimeout(connectSocket, 0);

        return () => {
            shouldReconnect = false;
            window.clearTimeout(connectTimer);

            if (reconnectTimer !== undefined) {
                window.clearTimeout(reconnectTimer);
            }

            socket?.close();

            if (computerSocketRef.current === socket) {
                computerSocketRef.current = null;
            }
        };
    }, [queryClient, roomId, setCustodian, setRoomDatabaseId, setRoomMeta, setRoomName]);

    useEffect(() => {
        setComputers(computers);
    }, [computers, setComputers]);

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
                    <ComputerListSkeleton />
                )}

                {!isLoading && !isError && paginatedComputers.length === 0 && (
                    <p className="col-span-full py-8 text-center secondary-text-color">
                        No Computers found.
                    </p>
                )}

                {isError && (
                    <div className="col-span-full flex flex-col items-center gap-3 py-8 text-center">
                        <p className="text-red-600">
                            {error instanceof Error ? error.message : "Failed to load computers."}
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="rounded-lg primary-bg-color px-4 py-2 text-sm font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!isLoading && !isError && paginatedComputers.map((computer)=> {

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
                    <ResponsivePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        className={isMobile ? "justify-center" : "justify-end"}
                    />
                )}
            </div>
        </>
        );
}
