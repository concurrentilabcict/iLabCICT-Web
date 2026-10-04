import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { appToast } from "@/utils/appToast";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { fetchComputerByCode } from "@/lib/computers";
import { fetchDuplicateTicketCandidates, getComputerRelatedTickets, scopeDuplicateTickets } from "@/lib/ticketDuplicates";
import { findPotentialDuplicates, type TicketSimilarityResult } from "@/utils/ticketSimilarity";
import DuplicateTicketDialog from "./DuplicateTicketDialog/DuplicateTicketDialog";
import { getComputerCodeFromQrValue } from "@/utils/qrComputer";
import { Spinner } from "@/components/ui/spinner";
import type { ApiComputer, ApiRoom, ScannerState, TicketType } from "@/types/createTicket";
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

import {
  ComputerDropdown,
  Field,
  ImageUploadField,
  LaboratoryDropdown,
  QrScanButton,
  TicketTypeToggle,
} from "./TicketFormFields";
import {
  ComputerInfoCard,
  getPeripheralStatuses,
  LaboratoryLocationCard,
  PeripheralStatusCard,
  RelatedTicketsCard,
} from "./TicketInfoCards";

function normalizeApiList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.computers)) return record.computers as T[];
  }
  return [];
}

interface TicketPayload {
  type: TicketType;
  title: string;
  complaint_description: string;
  status: "open";
  room: number;
  computer: number | null;
}

export default function CreateTicketForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const scannerState = location.state as ScannerState;
  const computerReference = searchParams.get("computer") ?? scannerState?.computerCode ?? "";
  const computerCode = getComputerCodeFromQrValue(computerReference) ?? "";
  const isScannedReport = computerCode.length > 0;
  const [type, setType] = useState<TicketType>("report");
  const [roomId, setRoomId] = useState("");
  const [selectedComputerCode, setSelectedComputerCode] = useState("");
  const [computerDropdownOpen, setComputerDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<TicketSimilarityResult[]>([]);
  const [pendingTicket, setPendingTicket] = useState<TicketPayload | null>(null);
  const checkLock = useRef(false);
  const submitLock = useRef(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRelatedTicketsOpen, setIsRelatedTicketsOpen] = useState(false);

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery<ApiRoom[]>({
    queryKey: ["rooms", "ticket-form"],
    queryFn: async () => {
      const response = await privateFetch(buildApiUrl("/api/rooms/"));
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load laboratories.");
      return normalizeApiList<ApiRoom>(data);
    },
  });

  const selectedRoom = rooms.find((room) => String(room.id) === roomId);

  const { data: roomComputers = [], isLoading: isLoadingComputers } = useQuery<ApiComputer[]>({
    queryKey: ["computers", "ticket-form", selectedRoom?.id],
    enabled: Boolean(selectedRoom) && type === "report" && !computerCode,
    queryFn: async () => {
      const response = await privateFetch(buildApiUrl(`/api/rooms/${selectedRoom!.id}/computers/`));
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.message || "Failed to load computers.");
      return normalizeApiList<ApiComputer>(data);
    },
  });

  const activeComputerCode = computerCode || selectedComputerCode;

  const {
    data: selectedComputerDetails,
    isLoading: isLoadingComputerDetails,
    isError: isComputerDetailsError,
    error: computerDetailsError,
    refetch: retryComputerDetails,
  } = useQuery<ApiComputer>({
    queryKey: ["computer", activeComputerCode],
    enabled: type === "report" && activeComputerCode.length > 0,
    queryFn: () => fetchComputerByCode(activeComputerCode),
    networkMode: "always",
    retry: 1,
    retryDelay: 750,
  });

  const selectedPeripheralStatus = selectedComputerDetails ? getPeripheralStatuses(selectedComputerDetails) : [];
  const relatedTickets = getComputerRelatedTickets(selectedComputerDetails);
  const relatedTicketsCount =
    (selectedComputerDetails?.assigned_tickets ? relatedTickets.length : undefined) ??
    selectedComputerDetails?.pending_tickets_count ??
    selectedComputerDetails?.related_tickets_count ??
    relatedTickets.length;
  const selectedComputerFromList = roomComputers.find((computer) => computer.computer_code === activeComputerCode);
  const selectedComputerId = selectedComputerDetails?.id ?? selectedComputerFromList?.id ?? null;
  const displayRoom = selectedComputerDetails?.room ?? selectedRoom;
  const effectiveRoomId = isScannedReport && selectedComputerDetails?.room?.id
    ? String(selectedComputerDetails.room.id)
    : roomId;
  const isReport = type === "report";
  const descriptionPlaceholder =
    type === "report" ? "Describe the issue you are experiencing..." : "Describe what you are requesting...";

  const handleSelectRoom = (nextRoomId: string) => {
    setRoomId(nextRoomId);
    setSelectedComputerCode("");
    setComputerDropdownOpen(false);
    setIsRelatedTicketsOpen(false);
  };

  const handleSelectComputer = (nextComputerCode: string) => {
    setSelectedComputerCode(nextComputerCode);
    setIsRelatedTicketsOpen(false);
  };

  const submitTicket = useMutation({
    mutationFn: async (payload: TicketPayload) => {
      const response = await privateFetch(buildApiUrl("/api/tickets/"), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw createApiError(response.status, data.detail || data.message || "Failed to submit ticket.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["computer", activeComputerCode] });
      setIsConfirmOpen(false);
      setDuplicateMatches([]);
      setPendingTicket(null);
      appToast.success("Ticket submitted successfully.");
      navigate("/manage-ticket", { replace: true });
    },
    onError: () => appToast.error("We couldn't submit the ticket. Please try again."),
    onSettled: () => { submitLock.current = false; },
  });
  const isSubmitting = submitTicket.isPending;

  const handleSubmitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkLock.current || submitLock.current || isConfirmOpen || duplicateMatches.length > 0) return;
    if (isScannedReport && !selectedComputerId) {
      appToast.warning("The scanned computer must finish loading before you submit the report.");
      return;
    }

    if (!effectiveRoomId || !title.trim() || !description.trim()) {
      appToast.warning("Please complete all required fields.");
      return;
    }

    const payload: TicketPayload = {
      type, title: title.trim(), complaint_description: description.trim(),
      status: "open", room: Number(effectiveRoomId), computer: isReport ? selectedComputerId : null,
    };
    checkLock.current = true;
    setIsCheckingDuplicates(true);
    try {
      let candidates;
      if (isReport && payload.computer !== null && activeComputerCode) {
        const computer = await queryClient.fetchQuery({
          queryKey: ["computer", activeComputerCode],
          queryFn: () => fetchComputerByCode(activeComputerCode),
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
      setPendingTicket(payload);
      setDuplicateMatches(matches);
      setIsConfirmOpen(matches.length === 0);
    } catch {
      appToast.error("We couldn't check existing tickets. Please try submitting again.");
    } finally {
      checkLock.current = false;
      setIsCheckingDuplicates(false);
    }
  };

  const handleSubmitTicket = () => {
    if (!pendingTicket || submitLock.current || checkLock.current) return;
    submitLock.current = true;
    submitTicket.mutate(pendingTicket);
  };

  const ticketTitle = type === "report" ? "Create a Report Ticket" : "Create a Request Ticket";
  const ticketSubtitle =
    type === "report"
      ? "Tell us what's wrong and provide a few details. Our technicians will review your report and help resolve the issue quickly."
      : "Need assistance? Submit a request and our technicians will review it and provide the support you need.";

  const computerInformation = isReport && (selectedComputerDetails || isLoadingComputerDetails) && (
    <>
      {selectedComputerDetails && (
        <RelatedTicketsCard
          tickets={relatedTickets}
          count={relatedTicketsCount}
          isOpen={isRelatedTicketsOpen}
          onToggle={() => setIsRelatedTicketsOpen((currentValue) => !currentValue)}
        />
      )}
      <ComputerInfoCard computer={selectedComputerDetails} isLoading={isLoadingComputerDetails} />
      {selectedPeripheralStatus.length > 0 && <PeripheralStatusCard items={selectedPeripheralStatus} />}
      {displayRoom && <LaboratoryLocationCard room={displayRoom} />}
    </>
  );

  const scannedComputerError = isScannedReport && isComputerDetailsError && (
    <section className="rounded-xl bg-white p-5 text-center shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
      <h2 className="font-bold text-zinc-950">Unable to load the scanned computer</h2>
      <p className="mt-1 text-sm font-medium text-zinc-500">
        {computerDetailsError instanceof Error
          ? computerDetailsError.message
          : "Please check the QR code and try again."}
      </p>
      <button
        type="button"
        onClick={() => void retryComputerDetails()}
        className="mt-4 rounded-lg primary-bg-color px-4 py-2 text-sm font-semibold text-white"
      >
        Try Again
      </button>
    </section>
  );

  return (
    <form onSubmit={handleSubmitRequest} className="mx-auto w-full max-w-[760px] space-y-5 px-5 py-6 md:px-6 md:py-7">
      <fieldset disabled={isSubmitting || isCheckingDuplicates} className="min-w-0 space-y-5">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{ticketTitle}</h1>
        <p className="text-sm font-medium leading-relaxed text-zinc-500">{ticketSubtitle}</p>
      </section>

      {!isScannedReport && <TicketTypeToggle type={type} onTypeChange={setType} />}

      {isReport && !isScannedReport && (
        <QrScanButton onClick={() => navigate("/qr-scanner")} />
      )}

      {isScannedReport && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#fff8f6] px-4 py-3 text-sm font-semibold primary-text-color">
            This report will be associated with {selectedComputerDetails?.computer_code ?? computerCode}.
          </div>
          {computerInformation}
          {scannedComputerError}
        </div>
      )}

      {!isScannedReport && isReport && selectedComputerDetails && computerInformation}

      {!isScannedReport && (
        <LaboratoryDropdown
          rooms={rooms}
          selectedRoom={selectedRoom}
          roomId={roomId}
          isLoadingRooms={isLoadingRooms}
          onSelectRoom={handleSelectRoom}
        />
      )}

      {isReport && !isScannedReport && (
        <ComputerDropdown
          selectedRoom={selectedRoom}
          selectedComputerCode={selectedComputerCode}
          computers={roomComputers}
          isLoadingComputers={isLoadingComputers}
          isOpen={computerDropdownOpen}
          onOpenChange={setComputerDropdownOpen}
          onSelectComputer={handleSelectComputer}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" className="md:col-span-2">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={type === "report" ? "e.g., PC automatically restarts" : "e.g., Aircon not working"}
            className="h-12 w-full rounded-xl bg-white px-4 text-sm font-medium text-zinc-950 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none placeholder:text-zinc-300 focus:ring-2 focus:ring-primary/30"
          />
        </Field>

        <Field label="Description" className="md:col-span-2">
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            placeholder={descriptionPlaceholder}
            className="min-h-36 w-full resize-y rounded-xl bg-white p-4 text-sm font-medium text-zinc-950 shadow-[0_4px_14px_rgba(15,23,42,0.08)] outline-none placeholder:text-zinc-300 focus:ring-2 focus:ring-primary/30"
          />
          <span className="mt-1 block text-right text-xs font-medium text-zinc-400">{description.length}/500</span>
        </Field>
      </div>

      <ImageUploadField image={image} onImageChange={setImage} />

      <button type="submit" disabled={isSubmitting || isCheckingDuplicates} className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl primary-bg-color text-sm font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition disabled:cursor-not-allowed disabled:bg-primary/35">
        {isCheckingDuplicates ? <><Spinner className="size-5" /> Checking existing tickets...</> : isSubmitting ? <><Spinner className="size-5" /> Submitting...</> : type === "report" ? "Submit report" : "Submit request"}
      </button>
      </fieldset>

      <DuplicateTicketDialog open={duplicateMatches.length > 0} matches={duplicateMatches} isSubmitting={isSubmitting}
        onOpenChange={(open) => { if (!open) { setDuplicateMatches([]); setPendingTicket(null); } }}
        onSubmitAnyway={handleSubmitTicket} />

      <AlertDialog open={isConfirmOpen} onOpenChange={(open) => {
        if (isSubmitting) return;
        setIsConfirmOpen(open);
        if (!open) setPendingTicket(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new {type} ticket for {displayRoom ? `${displayRoom.building_name} - ${displayRoom.room_name}` : "the selected laboratory"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); handleSubmitTicket(); }} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
