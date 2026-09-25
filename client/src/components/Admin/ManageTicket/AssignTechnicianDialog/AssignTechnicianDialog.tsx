import { UserRoundCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export type AssignableTechnician = {
    id: number;
    firstName: string;
    lastName: string;
};

type AssignTechnicianDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticketCode?: string;
    technicians: AssignableTechnician[];
    selectedTechnicianId: number | null;
    onSelectTechnician: (technicianId: number) => void;
    onAssign: () => void;
    isLoading: boolean;
    isError: boolean;
    isPending: boolean;
};

export default function AssignTechnicianDialog({
    open,
    onOpenChange,
    ticketCode,
    technicians,
    selectedTechnicianId,
    onSelectTechnician,
    onAssign,
    isLoading,
    isError,
    isPending,
}: AssignTechnicianDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#bf3419]/8 text-[#bf3419]">
                        <UserRoundCog size={20} aria-hidden="true" />
                    </div>
                    <DialogTitle>Assign Technician</DialogTitle>
                    <DialogDescription>
                        Select a technician for {ticketCode ?? "this ticket"}.
                    </DialogDescription>
                </DialogHeader>

                <Command className="rounded-lg border">
                    <CommandInput placeholder="Search technicians..." />
                    <CommandList className="max-h-56">
                        {isLoading && (
                            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                <Spinner className="size-4" />
                                Loading technicians...
                            </div>
                        )}

                        {!isLoading && isError && (
                            <p className="px-4 py-8 text-center text-sm text-red-600">
                                Failed to load technicians.
                            </p>
                        )}

                        {!isLoading && !isError && (
                            <>
                                <CommandEmpty>No technicians found.</CommandEmpty>
                                <CommandGroup>
                                    {technicians.map((technician) => {
                                        const name = `${technician.firstName} ${technician.lastName}`.trim();

                                        return (
                                            <CommandItem
                                                key={technician.id}
                                                value={`${name} ${technician.id}`}
                                                onSelect={() => onSelectTechnician(technician.id)}
                                                data-checked={selectedTechnicianId === technician.id}
                                                className="cursor-pointer data-[checked=true]:[&_svg:last-child]:text-[#bf3419]"
                                            >
                                                <UserRoundCog />
                                                <span className="min-w-0 flex-1 truncate">{name}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isPending}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={onAssign}
                        disabled={
                            selectedTechnicianId === null ||
                            isLoading ||
                            isError ||
                            isPending
                        }
                    >
                        {isPending ? (
                            <>
                                <Spinner className="size-4" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserRoundCog />
                                Assign Technician
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
