import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive } from "lucide-react";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { appToast } from "@/utils/appToast";
import type { ComputerCardType } from "@/types/computer";
import { recentComputerArchiveKey, removeComputerTicketsFromCache } from "@/lib/roomComputers";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  computer: ComputerCardType;
  queryKey: readonly string[];
};

export default function ComputerArchiveAction({ computer, queryKey }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const archive = useMutation({
    mutationFn: async () => {
      const response = await privateFetch(buildApiUrl(`/api/computers/${computer.id}/archive/`), {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message = typeof body === "object" && body !== null && "detail" in body && typeof body.detail === "string"
          ? body.detail : "We couldn't archive the computer. Please try again.";
        throw createApiError(response.status, message);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<ComputerCardType[]>(queryKey, (items = []) =>
        items.filter((item) => item.id !== computer.id)
      );
      queryClient.setQueryData(recentComputerArchiveKey(String(queryKey[1])), computer);
      removeComputerTicketsFromCache(queryClient, computer.id);
      setOpen(false);
      appToast.success("Computer archived successfully.");
    },
    onError: (error: Error) => appToast.error(error.message),
  });

  return (
    <>
      <button type="button" title="Archive computer" aria-label={`Archive ${computer.computerCode}`}
        onClick={() => setOpen(true)} className="grid h-9 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-zinc-500 hover:bg-gray-50">
        <Archive size={17} />
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {computer.computerCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              This computer and its linked tickets and maintenance history will be archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archive.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={archive.isPending} onClick={() => archive.mutate()}>
              <Archive className="size-4" /> Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
