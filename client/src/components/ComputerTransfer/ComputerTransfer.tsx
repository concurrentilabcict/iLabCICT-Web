import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArchiveTicketDialog from "@/components/Admin/ManageTicket/ArchiveTicketDialog/ArchiveTicketDialog";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { recentComputerArchiveKey, refreshRoomComputerCaches } from "@/lib/roomComputers";
import type { ApiRoom } from "@/types/room";
import { appToast } from "@/utils/appToast";

type ComputerTransferProps = {
    roomId: number | null;
    roomName: string;
};

type RoomResponse = { results?: ApiRoom[]; next?: string | null; detail?: string };

export default function ComputerTransfer({ roomId, roomName }: ComputerTransferProps) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [destinationId, setDestinationId] = useState("");
    const [confirming, setConfirming] = useState(false);
    const { data: rooms = [], isPending, isError, refetch } = useQuery({
        queryKey: ["computer-transfer-destinations"],
        enabled: open,
        queryFn: async () => {
            const rooms: ApiRoom[] = [];
            let url: string | null = buildApiUrl("/api/rooms/");
            while (url) {
                const response = await privateFetch(url);
                const data = await response.json() as ApiRoom[] | RoomResponse;
                if (!response.ok) {
                    throw createApiError(response.status, !Array.isArray(data) && data.detail || "Failed to load laboratories.");
                }
                rooms.push(...(Array.isArray(data) ? data : data.results ?? []));
                url = Array.isArray(data) ? null : data.next ?? null;
            }
            return rooms;
        },
    });
    const destinations = rooms.filter((room) => room.id !== roomId);
    const destination = destinations.find((room) => String(room.id) === destinationId);

    const transfer = useMutation({
        mutationFn: async () => {
            if (roomId === null || !destination) throw new Error("Select a destination laboratory.");
            const response = await privateFetch(buildApiUrl(`/api/rooms/${roomId}/transfer-computers/`), {
                method: "POST",
                body: JSON.stringify({ destination_room_id: destination.id }),
            });
            const data: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                const message = typeof data === "object" && data !== null && "detail" in data && typeof data.detail === "string"
                    ? data.detail : "We couldn't transfer the computers. Please try again.";
                throw createApiError(response.status, message);
            }
            return { sourceId: roomId, destinationId: destination.id };
        },
        onSuccess: async ({ sourceId, destinationId }) => {
            queryClient.setQueryData(recentComputerArchiveKey(String(sourceId)), null);
            const results = await Promise.allSettled([
                refreshRoomComputerCaches(queryClient, String(sourceId)),
                refreshRoomComputerCaches(queryClient, String(destinationId)),
                queryClient.invalidateQueries({ queryKey: ["rooms"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-dashboard-rooms"] }),
                queryClient.invalidateQueries({ queryKey: ["computer"] }),
                queryClient.invalidateQueries({ queryKey: ["request-history"] }),
            ]);
            results.forEach((result) => {
                if (result.status === "rejected") console.error("Failed to refresh transferred computers", result.reason);
            });
            setConfirming(false);
            setOpen(false);
            setDestinationId("");
            appToast.success("Computers transferred successfully.");
        },
        onError: (error) => appToast.error(error.message),
    });

    return <>
        <button
            type="button"
            onClick={() => { setDestinationId(""); setOpen(true); }}
            disabled={roomId === null || transfer.isPending}
            className="flex h-9 items-center gap-1.5 rounded-xl border primary-border-color bg-white px-3.5 text-sm font-medium secondary-text-color disabled:opacity-60"
        >
            <ArrowRightLeft className="size-4" /> Transfer Computers
        </button>
        <Dialog open={open && !confirming} onOpenChange={(value) => { if (!transfer.isPending) setOpen(value); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transfer Computers</DialogTitle>
                    <DialogDescription>Move all computers from {roomName} to another laboratory.</DialogDescription>
                </DialogHeader>
                {isPending ? <div className="flex items-center gap-2 text-sm"><LoaderCircle className="size-4 animate-spin" /> Loading laboratories...</div>
                    : isError ? <div className="space-y-2 text-sm"><p>Failed to load laboratories.</p><Button variant="outline" onClick={() => void refetch()}>Retry</Button></div>
                    : <div className="space-y-2">
                        <label htmlFor="computer-transfer-destination" className="text-sm font-medium">Destination Laboratory</label>
                        <select id="computer-transfer-destination" value={destinationId} onChange={(event) => setDestinationId(event.target.value)} className="h-10 w-full rounded-lg border bg-white px-3 text-sm">
                            <option value="">Select laboratory</option>
                            {destinations.map((room) => <option key={room.id} value={room.id}>{room.room_name} - {room.building_name}, Floor {room.floor_number}</option>)}
                        </select>
                        {destinations.length === 0 && <p className="text-sm text-zinc-500">No destination laboratories available.</p>}
                    </div>}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button disabled={!destination || isPending || isError} onClick={() => setConfirming(true)}><ArrowRightLeft className="size-4" /> Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <ArchiveTicketDialog
            open={confirming}
            onOpenChange={setConfirming}
            onArchive={() => transfer.mutate()}
            isPending={transfer.isPending}
            title="Transfer all computers?"
            description={`All computers in ${roomName} will move to ${destination?.room_name ?? "the selected laboratory"}.`}
            actionLabel="Transfer"
            pendingLabel="Transferring..."
            actionIcon={ArrowRightLeft}
        />
    </>;
}
