import { useMemo } from "react";

import type { Room } from "@/types/room";
import type { Ticket } from "@/types/ticket";
import { Skeleton } from "@/components/ui/skeleton";

type LaboratoryAvailability = Room & {
    operationalCount: number;
    totalCount: number;
    availability: number | null;
    inventoryIsLoading: boolean;
    inventoryIsError: boolean;
};

type ComputerInventoryStatus = {
    computers: Array<{
        id: number;
        status: string;
    }>;
    isLoading: boolean;
    isError: boolean;
};

function getAvailability(
    rooms: Room[],
    tickets: Ticket[],
    computerInventoryByRoom: Record<number, ComputerInventoryStatus>
) {
    const computersWithActiveTicketsByRoom = tickets.reduce<
        Record<number, Set<number>>
    >((roomComputers, ticket) => {
        const ticketStatus = ticket.status.trim().toLowerCase();
        const computerId = ticket.computer?.id;

        if (
            ticketStatus === "resolved" ||
            computerId === undefined ||
            computerId <= 0
        ) {
            return roomComputers;
        }

        const roomId = ticket.room.id;
        const computerIds = roomComputers[roomId] ?? new Set<number>();
        computerIds.add(computerId);
        roomComputers[roomId] = computerIds;

        return roomComputers;
    }, {});

    return rooms.map<LaboratoryAvailability>((room) => {
        const inventory = computerInventoryByRoom[room.id];
        const computers = inventory?.computers ?? [];
        const computersWithActiveTickets =
            computersWithActiveTicketsByRoom[room.id] ?? new Set<number>();
        const totalCount = computers.length;
        const operationalCount = computers.filter((computer) => (
            computer.status.trim().toLowerCase() === "active" &&
            !computersWithActiveTickets.has(computer.id)
        )).length;
        const availability = totalCount === 0
            ? null
            : Math.round((operationalCount / totalCount) * 100);

        return {
            ...room,
            operationalCount,
            totalCount,
            availability,
            inventoryIsLoading: inventory?.isLoading ?? true,
            inventoryIsError: inventory?.isError ?? false,
        };
    });
}

type LaboratoryStatusProps = {
    rooms: Room[];
    tickets: Ticket[];
    computerInventoryByRoom: Record<number, ComputerInventoryStatus>;
    isLoading: boolean;
    isError: boolean;
};

export default function LaboratoryStatus({
    rooms,
    tickets,
    computerInventoryByRoom,
    isLoading,
    isError,
}: LaboratoryStatusProps) {
    const laboratories = useMemo(
        () => getAvailability(rooms, tickets, computerInventoryByRoom),
        [rooms, tickets, computerInventoryByRoom]
    );

    return (
        <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-800">
                    Laboratory Status
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                    {isError
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
                                {room.inventoryIsLoading ? (
                                    <Skeleton className="mt-1 h-3 w-24" />
                                ) : (
                                    <p className="mt-0.5 text-xs text-zinc-500">
                                        {room.inventoryIsError
                                            ? "Inventory unavailable"
                                            : room.totalCount === 0
                                                ? "No computers"
                                                : `${room.operationalCount}/${room.totalCount} operational`}
                                    </p>
                                )}
                            </div>

                            {room.inventoryIsLoading ? (
                                <Skeleton className="h-4 w-10" />
                            ) : (
                                <span className="shrink-0 text-sm font-semibold text-zinc-800">
                                    {room.inventoryIsError || room.availability === null
                                        ? "—"
                                        : `${room.availability}%`}
                                </span>
                            )}
                        </div>

                        {room.inventoryIsLoading ? (
                            <Skeleton className="mt-2 h-2 w-full rounded-full" />
                        ) : room.availability === null || room.inventoryIsError ? (
                            <div className="mt-2 h-2 rounded-full bg-zinc-100" />
                        ) : (
                            <div
                                className="mt-2 h-2 overflow-hidden rounded-full bg-[#bf3419]/15"
                                aria-label={`${room.roomName} operational availability`}
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
                        )}
                    </article>
                ))}

                {isLoading && (
                    <div className="space-y-5">
                        {Array.from({ length: 5 }, (_, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <Skeleton className="h-4 w-10" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
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
