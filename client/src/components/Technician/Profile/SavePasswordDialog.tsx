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

type SavePasswordDialogProps = {
    onSave: () => void;
    onBeforeOpen: () => boolean;
    isPending: boolean;
};

export default function SavePasswordDialog({ onSave, onBeforeOpen, isPending }: SavePasswordDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    type="button"
                    onClick={(e) => {
                        if (!onBeforeOpen()) {
                            e.preventDefault();
                        }
                    }}
                    className="primary-button text-sm cursor-pointer flex gap-x-1 font-medium"
                    disabled={isPending}
                >
                    {!isPending ? (
                        <>Save Password</>
                    ) : (
                        <>
                            <Spinner className="size-5" />
                            <span>Saving...</span>
                        </>
                    )}
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Save Password?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Your account password will be updated after you confirm.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onSave}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Spinner className="size-4" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            "Continue"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
