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

import DuplicateTicketDialog from "../DuplicateTicketDialog/DuplicateTicketDialog";
import type { TicketSubmission } from "../hooks";

type SubmitTicketDialogsProps = {
  submission: TicketSubmission;
};

export default function SubmitTicketDialogs({ submission }: SubmitTicketDialogsProps) {
  const { duplicateMatches, isSubmitting, isConfirmOpen, pendingTicket } = submission;

  return (
    <>
      <DuplicateTicketDialog open={duplicateMatches.length > 0} matches={duplicateMatches} isSubmitting={isSubmitting}
        onOpenChange={(open) => { if (!open) submission.dismissDuplicates(); }}
        onSubmitAnyway={submission.confirmSubmit} />

      <AlertDialog open={isConfirmOpen} onOpenChange={submission.changeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new {pendingTicket?.payload.type ?? "ticket"} ticket for {pendingTicket?.context.laboratory || "the selected laboratory"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); submission.confirmSubmit(); }} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
