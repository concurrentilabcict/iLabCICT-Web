import { Archive } from "lucide-react";

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
};

export default function ArchiveTicketDialog({
    open,
    onOpenChange,
    onArchive,
    isPending,
    description = "This ticket will move out of the active queue and remain available in Archived Tickets.",
}: ArchiveTicketDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Archive Ticket?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onArchive} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner className="size-4" />
                                Archiving...
                            </>
                        ) : (
                            <>
                                <Archive />
                                Archive
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
