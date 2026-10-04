import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { TicketSimilarityResult } from "@/utils/ticketSimilarity";

interface DuplicateTicketDialogProps {
  open: boolean;
  matches: TicketSimilarityResult[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitAnyway: () => void;
}

export default function DuplicateTicketDialog({ open, matches, isSubmitting, onOpenChange, onSubmitAnyway }: DuplicateTicketDialogProps) {
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  return <AlertDialog open={open} onOpenChange={(nextOpen) => {
    if (isSubmitting) return;
    if (!nextOpen) setReviewingId(null);
    onOpenChange(nextOpen);
  }}>
    <AlertDialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)]! overflow-y-auto sm:max-w-lg!">
      <AlertDialogHeader>
        <AlertDialogTitle>Possible duplicate ticket</AlertDialogTitle>
        <AlertDialogDescription>An active ticket may already cover this concern. Review it before creating another ticket.</AlertDialogDescription>
      </AlertDialogHeader>
      <ul className="divide-y rounded-lg border">
        {matches.map(({ ticket }) => <li key={ticket.id} className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">{ticket.ticket_code || `Ticket #${ticket.id}`}</p>
              <h3 className="break-words text-sm font-semibold">{ticket.title}</h3>
            </div>
            <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${ticket.status?.toLowerCase() === "ongoing" ? "bg-amber-50 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{ticket.status?.toLowerCase() === "ongoing" ? "Ongoing" : "Open"}</span>
          </div>
          {reviewingId === ticket.id && <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">{ticket.complaint_description}</p>}
          <Button type="button" variant="ghost" size="sm" disabled={isSubmitting} onClick={() => setReviewingId(reviewingId === ticket.id ? null : ticket.id)} aria-expanded={reviewingId === ticket.id}>
            <Eye size={14} />{reviewingId === ticket.id ? "Hide details" : "Review existing ticket"}
          </Button>
        </li>)}
      </ul>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSubmitting}>Back to draft</AlertDialogCancel>
        <AlertDialogAction disabled={isSubmitting} onClick={(event) => { event.preventDefault(); onSubmitAnyway(); }}>
          {isSubmitting ? <><Spinner className="size-4" />Submitting...</> : "Submit anyway"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
