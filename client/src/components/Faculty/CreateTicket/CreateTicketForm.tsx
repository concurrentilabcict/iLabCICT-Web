import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { appToast } from "@/utils/appToast";

import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { fetchComputerByCode } from "@/lib/computers";
import { getComputerRelatedTickets } from "@/lib/ticketDuplicates";
import { getComputerCodeFromQrValue } from "@/utils/qrComputer";
import type { ApiComputer, ScannerState, TicketType } from "@/types/createTicket";

import { normalizeApiList, useSubmitTicket, useTicketRooms } from "./hooks";
import SubmitTicketDialogs from "./SubmitTicketDialogs/SubmitTicketDialogs";
import {
  ComputerDropdown,
  ImageUploadField,
  LaboratoryDropdown,
  QrScanButton,
  SubmitTicketButton,
  TicketDetailsFields,
  TicketTypeToggle,
} from "./TicketFormFields";
import {
  ComputerInfoCard,
  getPeripheralStatuses,
  LaboratoryLocationCard,
  PeripheralStatusCard,
  RelatedTicketsCard,
} from "./TicketInfoCards";
import TicketReceipt from "./TicketReceipt/TicketReceipt";

export default function CreateTicketForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
  const submission = useSubmitTicket();
  const { isSubmitting, isCheckingDuplicates } = submission;
  const [isRelatedTicketsOpen, setIsRelatedTicketsOpen] = useState(false);

  const { data: rooms = [], isLoading: isLoadingRooms } = useTicketRooms();

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

  const handleSubmitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submission.isLocked()) return;
    if (isScannedReport && !selectedComputerId) {
      appToast.warning("The scanned computer must finish loading before you submit the report.");
      return;
    }

    if (!effectiveRoomId || !title.trim() || !description.trim()) {
      appToast.warning("Please complete all required fields.");
      return;
    }

    void submission.reviewTicket(
      {
        type, title: title.trim(), complaint_description: description.trim(),
        status: "open", room: Number(effectiveRoomId), computer: isReport ? selectedComputerId : null,
      },
      {
        laboratory: displayRoom ? `${displayRoom.building_name} - ${displayRoom.room_name}` : "",
        computerCode: isReport ? activeComputerCode : undefined,
      }
    );
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

  if (submission.receipt) return <TicketReceipt receipt={submission.receipt} />;

  return (
    <form onSubmit={handleSubmitRequest} className="mx-auto w-full max-w-[760px] space-y-5 px-5 py-6 md:px-6 md:py-7">
      <fieldset disabled={isSubmitting || isCheckingDuplicates} className="min-w-0 space-y-5 disabled:opacity-70">
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

      <TicketDetailsFields
        type={type}
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />

      <ImageUploadField image={image} onImageChange={setImage} />

      <SubmitTicketButton type={type} isCheckingDuplicates={isCheckingDuplicates} isSubmitting={isSubmitting} />
      </fieldset>

      <SubmitTicketDialogs submission={submission} />
    </form>
  );
}
