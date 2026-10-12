import { useState, type FormEvent } from "react";

import { appToast } from "@/utils/appToast";

import { useSubmitTicket, useTicketRooms } from "../hooks";
import SubmitTicketDialogs from "../SubmitTicketDialogs/SubmitTicketDialogs";
import {
  ImageUploadField,
  LaboratoryDropdown,
  SubmitTicketButton,
  TicketDetailsFields,
} from "../TicketFormFields";
import TicketReceipt from "../TicketReceipt/TicketReceipt";

type CreateRequestFormProps = {
  roomId: number;
};

export default function CreateRequestForm({ roomId: initialRoomId }: CreateRequestFormProps) {
  const [roomId, setRoomId] = useState(String(initialRoomId));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { data: rooms = [], isLoading: isLoadingRooms } = useTicketRooms();
  const submission = useSubmitTicket();
  const { isSubmitting, isCheckingDuplicates } = submission;
  const selectedRoom = rooms.find((room) => String(room.id) === roomId);

  const handleSubmitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submission.isLocked()) return;

    if (!roomId || !title.trim() || !description.trim()) {
      appToast.warning("Please complete all required fields.");
      return;
    }

    void submission.reviewTicket(
      {
        type: "request", title: title.trim(), complaint_description: description.trim(),
        status: "open", room: Number(roomId), computer: null,
      },
      { laboratory: selectedRoom ? `${selectedRoom.building_name} - ${selectedRoom.room_name}` : "" }
    );
  };

  if (submission.receipt) return <TicketReceipt receipt={submission.receipt} />;

  return (
    <form onSubmit={handleSubmitRequest} className="mx-auto w-full max-w-[760px] space-y-5 px-5 py-6 md:px-6 md:py-7">
      <fieldset disabled={isSubmitting || isCheckingDuplicates} className="min-w-0 space-y-5 disabled:opacity-70">
        <section className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Create a Request Ticket</h1>
          <p className="text-sm font-medium leading-relaxed text-zinc-500">
            Need assistance? Submit a request and our technicians will review it and provide the support you need.
          </p>
        </section>

        <LaboratoryDropdown
          rooms={rooms}
          selectedRoom={selectedRoom}
          roomId={roomId}
          isLoadingRooms={isLoadingRooms}
          onSelectRoom={setRoomId}
        />

        <TicketDetailsFields
          type="request"
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />

        <ImageUploadField image={image} onImageChange={setImage} />

        <SubmitTicketButton type="request" isCheckingDuplicates={isCheckingDuplicates} isSubmitting={isSubmitting} />
      </fieldset>

      <SubmitTicketDialogs submission={submission} />
    </form>
  );
}
