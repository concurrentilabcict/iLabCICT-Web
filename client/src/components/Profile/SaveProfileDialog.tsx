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

type SaveProfileDialogProps = {
    onSave: () => void;
    onBeforeOpen: () => boolean;
    isPending: boolean;
};

export default function SaveProfileDialog({ onSave, onBeforeOpen, isPending }: SaveProfileDialogProps) {
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
                    className="primary-button cursor-pointer text-sm font-medium"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Spinner className="size-5" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Save Profile?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Your profile details will be updated after you confirm.
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
