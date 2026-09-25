import { UserRoundCog } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  ticketCode?: string;
  currentTechnician?: string;
  nextTechnician?: string;
};

export default function ConfirmTicketReassignment({
  open, onOpenChange, onConfirm, isPending, ticketCode,
  currentTechnician, nextTechnician,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => {
      if (!isPending) onOpenChange(nextOpen);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reassign Ticket?</AlertDialogTitle>
          <AlertDialogDescription>
            {ticketCode ?? "This ticket"} is assigned to {currentTechnician || "another technician"}.{" "}
            Reassign it to {nextTechnician || "the selected technician"}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(event) => { event.preventDefault(); onConfirm(); }} disabled={isPending}>
            {isPending ? <><Spinner className="size-4" /> Reassigning...</>
              : <><UserRoundCog className="size-4" /> Reassign</>}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
