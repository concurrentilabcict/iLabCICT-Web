import { Trash2 } from "lucide-react";

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

type DeleteTicketDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
    isPending: boolean;
};

export default function DeleteTicketDialog({
    open,
    onOpenChange,
    onDelete,
    isPending,
}: DeleteTicketDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Ticket?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This ticket will be permanently deleted and cannot be recovered.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner className="size-4" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 />
                                Delete
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
