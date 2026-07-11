import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { createApiError, privateFetch } from "@/lib/api";
import type { RoomDashboard } from "@/types/room";

type ApiRoom = {
    id: number;
    computer_count: number;
    building_name: string;
    room_name: string;
    floor_number: number;
    status: string;
    created_at: string;
    updated_at: string;
};

type ApiTicketRoom = {
    id: number;
};

type ApiTicket = {
    id: number;
    status: string;
    room: ApiTicketRoom;
};

type LaboratoryAvailability = RoomDashboard & {
    workingCount: number;
    unavailableCount: number;
    availability: number;
};

const ROOMS_URL = "https://ilabcict-backend.onrender.com/api/rooms/";
const TICKETS_URL = "https://ilabcict-backend.onrender.com/api/tickets/";

function mapRoom(room: ApiRoom): RoomDashboard {
    return {
        id: room.id,
        computerCount: room.computer_count,
        buildingName: room.building_name,
        roomName: room.room_name,
        floorNumber: room.floor_number,
        status: room.status,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
    };
}

async function fetchRooms() {
    const response = await privateFetch(ROOMS_URL);
    const data = await response.json();

    if (!response.ok) {
        throw createApiError(
            response.status,
            data.message || "Failed to fetch laboratories."
        );
    }

    return (data as ApiRoom[]).map(mapRoom);
}

async function fetchTickets() {
    const response = await privateFetch(TICKETS_URL);
    const data = await response.json();

    if (!response.ok) {
        throw createApiError(
            response.status,
            data.message || "Failed to fetch laboratory tickets."
        );
    }

    return data as ApiTicket[];
}

function getAvailability(rooms: RoomDashboard[], tickets: ApiTicket[]) {
    const unresolvedTicketsByRoom = tickets.reduce<Record<number, number>>(
        (roomCounts, ticket) => {
            if (ticket.status.trim().toLowerCase() === "resolved") {
                return roomCounts;
            }

            const roomId = ticket.room.id;
            roomCounts[roomId] = (roomCounts[roomId] ?? 0) + 1;

            return roomCounts;
        },
        {}
    );

    return rooms.map<LaboratoryAvailability>((room) => {
        const unavailableCount = Math.min(
            unresolvedTicketsByRoom[room.id] ?? 0,
            room.computerCount
        );
        const workingCount = Math.max(room.computerCount - unavailableCount, 0);
        const availability = room.computerCount === 0
            ? 0
            : Math.round((workingCount / room.computerCount) * 100);

        return {
            ...room,
            workingCount,
            unavailableCount,
            availability,
        };
    });
}

export default function LaboratoryStatus() {
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["admin-laboratory-status"],
        queryFn: async () => {
            const [rooms, tickets] = await Promise.all([
                fetchRooms(),
                fetchTickets(),
            ]);

            return { rooms, tickets };
        },
        staleTime: 60_000,
    });

    const laboratories = useMemo(
        () => getAvailability(data?.rooms ?? [], data?.tickets ?? []),
        [data]
    );

    return (
        <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-800">
                    Laboratory Status
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                    {isLoading
                        ? "Loading laboratories..."
                        : isError
                            ? "Unable to load laboratory status"
                            : `${laboratories.length.toLocaleString()} laboratories tracked`}
                </p>
            </div>

            <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-1">
                {!isLoading && !isError && laboratories.map((room) => (
                    <article key={room.id} className="min-w-0">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-zinc-800">
                                    {room.roomName}
                                </h3>
                                <p className="mt-0.5 text-xs text-zinc-500">
                                    {room.workingCount}/{room.computerCount} working
                                </p>
                            </div>

                            <span className="shrink-0 text-sm font-semibold text-zinc-800">
                                {room.availability}%
                            </span>
                        </div>

                        <div
                            className="mt-2 h-2 overflow-hidden rounded-full bg-[#bf3419]/15"
                            aria-label={`${room.roomName} availability`}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={room.availability}
                        >
                            <div
                                className="h-full rounded-full bg-[#bf3419] transition-all duration-500"
                                style={{ width: `${room.availability}%` }}
                            />
                        </div>
                    </article>
                ))}

                {isLoading && (
                    <p className="text-sm text-zinc-500">
                        Loading laboratory availability...
                    </p>
                )}

                {!isLoading && !isError && laboratories.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-zinc-500">
                        No laboratories found.
                    </div>
                )}
            </div>
        </section>
    );
}
