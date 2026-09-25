import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { recentComputerArchiveKey } from "@/lib/roomComputers";
import { appToast } from "@/utils/appToast";
import type { ComputerCardType } from "@/types/computer";

type Props = {
  roomId: string;
  queryKey: readonly string[];
};

export default function ComputerRestoreNotice({ roomId, queryKey }: Props) {
  const queryClient = useQueryClient();
  const archiveKey = recentComputerArchiveKey(roomId);
  const { data: computer } = useQuery<ComputerCardType | null>({
    queryKey: archiveKey,
    queryFn: () => Promise.resolve(queryClient.getQueryData<ComputerCardType>(archiveKey) ?? null),
    initialData: null,
    staleTime: Infinity,
  });
  const restore = useMutation({
    mutationFn: async (item: ComputerCardType) => {
      const response = await privateFetch(buildApiUrl(`/api/computers/${item.id}/unarchive/`), {
        method: "POST", body: JSON.stringify({}),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const detail = typeof body === "object" && body !== null && "detail" in body && typeof body.detail === "string"
          ? body.detail : "We couldn't unarchive the computer. Please try again.";
        throw createApiError(response.status, detail);
      }
      return item;
    },
    onSuccess: (item) => {
      queryClient.setQueryData<ComputerCardType[]>(queryKey, (items = []) =>
        items.some((computer) => computer.id === item.id)
          ? items.map((computer) => computer.id === item.id ? { ...computer, isArchived: false } : computer)
          : [{ ...item, isArchived: false }, ...items]
      );
      queryClient.setQueryData(archiveKey, null);
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ["request-history"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-archived-tickets"] });
      appToast.success("Computer unarchived successfully.");
    },
    onError: (error: Error) => appToast.error(error.message),
  });

  if (!computer) return null;

  return (
    <div className="mx-3 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
      <span>{computer.computerCode} was archived.</span>
      <button type="button" disabled={restore.isPending} onClick={() => restore.mutate(computer)}
        className="inline-flex items-center gap-2 font-semibold primary-text-color disabled:opacity-50">
        {restore.isPending ? <Spinner className="size-4" /> : <RotateCcw size={16} />}
        {restore.isPending ? "Unarchiving..." : "Unarchive"}
      </button>
    </div>
  );
}
