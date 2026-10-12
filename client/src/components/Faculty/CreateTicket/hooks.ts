import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { fetchComputerByCode } from "@/lib/computers";
import { fetchDuplicateTicketCandidates, getComputerRelatedTickets, scopeDuplicateTickets } from "@/lib/ticketDuplicates";
import type { ApiRoom, TicketType } from "@/types/createTicket";
import { appToast } from "@/utils/appToast";
import { findPotentialDuplicates, type TicketSimilarityResult } from "@/utils/ticketSimilarity";

export interface TicketPayload {
  type: TicketType;
  title: string;
  complaint_description: string;
  status: "open";
  room: number;
  computer: number | null;
}

export interface TicketReceiptData {
  ticketCode: string | null;
  type: TicketType;
  title: string;
  description: string;
  laboratory: string;
  computerCode: string | null;
  submittedAt: string;
}

interface TicketContext {
  laboratory: string;
  computerCode?: string;
}

interface PendingTicket {
  payload: TicketPayload;
  context: TicketContext;
}

export function normalizeApiList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.computers)) return record.computers as T[];
  }
  return [];
}

const readString = (data: unknown, key: string) => {
  if (typeof data !== "object" || data === null || !(key in data)) return null;
  const value = (data as Record<string, unknown>)[key];
  return typeof value === "string" && value !== "" ? value : null;
};

export const useTicketRooms = () =>
  useQuery<ApiRoom[]>({
    queryKey: ["rooms", "ticket-form"],
    queryFn: async () => {
      const response = await privateFetch(buildApiUrl("/api/rooms/"));
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load laboratories.");
      return normalizeApiList<ApiRoom>(data);
    },
  });

// Duplicate check -> confirmation -> submission -> receipt, shared by every ticket form.
export function useSubmitTicket() {
  const queryClient = useQueryClient();
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<TicketSimilarityResult[]>([]);
  const [pendingTicket, setPendingTicket] = useState<PendingTicket | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [receipt, setReceipt] = useState<TicketReceiptData | null>(null);
  const checkLock = useRef(false);
  const submitLock = useRef(false);

  const submitTicket = useMutation({
    mutationFn: async ({ payload }: PendingTicket) => {
      const response = await privateFetch(buildApiUrl("/api/tickets/"), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw createApiError(response.status, readString(data, "detail") ?? readString(data, "message") ?? "Failed to submit ticket.");
      }
      return data;
    },
    onSuccess: async (data, { payload, context }) => {
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      if (context.computerCode) {
        await queryClient.invalidateQueries({ queryKey: ["computer", context.computerCode] });
      }
      setIsConfirmOpen(false);
      setDuplicateMatches([]);
      setPendingTicket(null);
      setReceipt({
        ticketCode: readString(data, "ticket_code"),
        type: payload.type,
        title: payload.title,
        description: payload.complaint_description,
        laboratory: context.laboratory,
        computerCode: context.computerCode || null,
        submittedAt: readString(data, "created_at") ?? new Date().toISOString(),
      });
    },
    onError: () => appToast.error("We couldn't submit the ticket. Please try again."),
    onSettled: () => { submitLock.current = false; },
  });
  const isSubmitting = submitTicket.isPending;

  const isLocked = () =>
    checkLock.current || submitLock.current || isConfirmOpen || duplicateMatches.length > 0;

  const reviewTicket = async (payload: TicketPayload, context: TicketContext) => {
    if (isLocked()) return;
    checkLock.current = true;
    setIsCheckingDuplicates(true);
    try {
      let candidates;
      if (payload.type === "report" && payload.computer !== null && context.computerCode) {
        const computerCode = context.computerCode;
        const computer = await queryClient.fetchQuery({
          queryKey: ["computer", computerCode],
          queryFn: () => fetchComputerByCode(computerCode),
          staleTime: 0,
        });
        const hasRelatedData = [computer.assigned_tickets, computer.pending_tickets, computer.related_tickets, computer.tickets].some(Array.isArray);
        candidates = hasRelatedData ? getComputerRelatedTickets(computer).map((ticket) => ({
          ...ticket, type: ticket.type ?? "report", computerId: computer.id, roomId: computer.room.id,
        })) : await fetchDuplicateTicketCandidates();
      } else {
        candidates = await queryClient.fetchQuery({
          queryKey: ["ticket-duplicate-candidates"],
          queryFn: fetchDuplicateTicketCandidates,
          staleTime: 0,
        });
      }
      const matches = findPotentialDuplicates({
        title: payload.title,
        description: payload.complaint_description,
        tickets: scopeDuplicateTickets(candidates, {
          type: payload.type, roomId: payload.room, computerId: payload.computer,
        }),
      });
      setPendingTicket({ payload, context });
      setDuplicateMatches(matches);
      setIsConfirmOpen(matches.length === 0);
    } catch {
      appToast.error("We couldn't check existing tickets. Please try submitting again.");
    } finally {
      checkLock.current = false;
      setIsCheckingDuplicates(false);
    }
  };

  const confirmSubmit = () => {
    if (!pendingTicket || submitLock.current || checkLock.current) return;
    submitLock.current = true;
    submitTicket.mutate(pendingTicket);
  };

  const dismissDuplicates = () => {
    setDuplicateMatches([]);
    setPendingTicket(null);
  };

  const changeConfirmOpen = (open: boolean) => {
    if (isSubmitting) return;
    setIsConfirmOpen(open);
    if (!open) setPendingTicket(null);
  };

  return {
    isCheckingDuplicates,
    isSubmitting,
    duplicateMatches,
    pendingTicket,
    isConfirmOpen,
    receipt,
    isLocked,
    reviewTicket,
    confirmSubmit,
    dismissDuplicates,
    changeConfirmOpen,
  };
}

export type TicketSubmission = ReturnType<typeof useSubmitTicket>;
