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

type RemoveImageDialogProps = {
    onRemove: () => void;
    isPending: boolean;
    disabled?: boolean;
};

export default function RemoveImageDialog({ onRemove, isPending, disabled = false }: RemoveImageDialogProps) {
    if (disabled) {
        return (
            <button
                type="button"
                className="cursor-not-allowed flex gap-x-1 secondary-button opacity-50"
                disabled
            >
                <span>Remove Image</span>
            </button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    type="button"
                    className="cursor-pointer flex gap-x-1 secondary-button"
                    disabled={isPending}>
                    {!isPending ? (
                        <span>Remove Image</span>
                    ) : (
                        <>
                            <Spinner className="size-5" />
                            <span>Removing...</span>
                        </>
                    )}
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Remove Image?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        This image will be permanently removed and cannot be recovered.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onRemove}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Spinner className="size-4" />
                                <span>Removing...</span>
                            </>
                        ) : (
                            "Remove"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
