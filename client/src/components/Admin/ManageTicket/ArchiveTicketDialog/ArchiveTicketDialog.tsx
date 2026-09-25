import { Archive, type LucideIcon } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ArchiveTicketDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArchive: () => void;
    isPending: boolean;
    description?: string;
    title?: string;
    actionLabel?: string;
    actionIcon?: LucideIcon;
    pendingLabel?: string;
};

export default function ArchiveTicketDialog({
    open,
    onOpenChange,
    onArchive,
    isPending,
    description = "This ticket will move out of the active queue and remain available in Archived Tickets.",
    title = "Archive Ticket?",
    actionLabel = "Archive",
    actionIcon: ActionIcon = Archive,
    pendingLabel = "Archiving...",
}: ArchiveTicketDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(nextOpen) => {
            if (!isPending) onOpenChange(nextOpen);
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={(event) => {
                        event.preventDefault();
                        onArchive();
                    }} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner className="size-4" />
                                {pendingLabel}
                            </>
                        ) : (
                            <>
                                <ActionIcon />
                                {actionLabel}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
