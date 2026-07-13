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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ResolveRequestDialogProps = {
    ticketCode: string;
    isSubmitting: boolean;
    onResolve: () => void;
    disabled?: boolean;
};

export default function ResolveRequestDialog({
    ticketCode,
    isSubmitting,
    onResolve,
    disabled = false,
}: ResolveRequestDialogProps) {
    if (disabled) {
        return (
            <button
                type="button"
                className="cursor-not-allowed opacity-50"
                disabled
            >
                Resolve Ticket
            </button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    className="primary-bg-color inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-white disabled:pointer-events-none disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner className="size-4" />
                            Resolving...
                        </>
                    ) : (
                        "Resolve Ticket"
                    )}
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Resolve request?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will mark {ticketCode} as resolved. No repair log will be created for request tickets.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onResolve} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner className="size-4" />
                                <span>Resolving...</span>
                            </>
                        ) : (
                            "Resolve"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
