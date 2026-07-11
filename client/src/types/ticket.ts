export type User = {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
}

export type Room = {
    id: number;
    roomName: string;
    buildingName: string;
    floorNumber: number;
}

export type Computer = {
    id: number;
    computerCode: string;
}

export type Ticket = {
    id: number;
    ticketCode: string;

    reportedBy: User;
    assignedTo: User | null;

    room: Room;
    computer: Computer | null;

    type: string;
    title: string;
    complaintDescription: string;

    issueImage: string | null;

    status: string;

    createdAt: string;
    updatedAt: string;
}

export type ApiTicketUser = {
    id: number;
    first_name: string;
    last_name: string;
}

export type ApiTicketRoom = {
    id: number;
    room_name: string;
    building_name: string;
    floor_number: number;
}

export type ApiTicketComputer = {
    id: number;
    computer_code: string;
}

/** Raw ticket shape returned by GET /api/tickets/. */
export type ApiTicket = {
    id: number;
    ticket_code: string;
    reported_by: ApiTicketUser;
    assigned_to: ApiTicketUser | null;
    room: ApiTicketRoom;
    computer: ApiTicketComputer | null;
    type: "report" | "request";
    title: string;
    complaint_description: string;
    issue_image: string | null;
    status: "open" | "ongoing" | "resolved";
    created_at: string;
    updated_at: string;
}
