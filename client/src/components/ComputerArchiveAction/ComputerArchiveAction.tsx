import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, RotateCcw } from "lucide-react";
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
  const isArchived = computer.isArchived === true;
  const ActionIcon = isArchived ? RotateCcw : Archive;
  const actionLabel = isArchived ? "Unarchive" : "Archive";
  const archive = useMutation({
    mutationFn: async () => {
      const response = await privateFetch(buildApiUrl(`/api/computers/${computer.id}/${isArchived ? "unarchive" : "archive"}/`), {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message = typeof body === "object" && body !== null && "detail" in body && typeof body.detail === "string"
          ? body.detail : `We couldn't ${actionLabel.toLowerCase()} the computer. Please try again.`;
        throw createApiError(response.status, message);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<ComputerCardType[]>(queryKey, (items = []) =>
        items.map((item) => item.id === computer.id ? { ...item, isArchived: !isArchived } : item)
      );
      queryClient.setQueryData(recentComputerArchiveKey(String(queryKey[1])), isArchived ? null : computer);
      if (!isArchived) removeComputerTicketsFromCache(queryClient, computer.id);
      setOpen(false);
      appToast.success(`Computer ${isArchived ? "unarchived" : "archived"} successfully.`);
    },
    onError: (error: Error) => appToast.error(error.message),
  });

  return (
    <>
      <button type="button" title={`${actionLabel} computer`} aria-label={`${actionLabel} ${computer.computerCode}`}
        onClick={() => setOpen(true)} className="grid h-9 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-zinc-500 hover:bg-gray-50">
        <ActionIcon size={17} />
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabel} {computer.computerCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              {isArchived
                ? "This computer and its linked history will return to the active inventory."
                : "This computer and its linked tickets and maintenance history will be archived."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archive.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={archive.isPending} onClick={() => archive.mutate()}>
              <ActionIcon className="size-4" /> {actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
