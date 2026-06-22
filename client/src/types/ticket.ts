export type User = {
    id: number;
    firstName: string;
    lastName: string;
}

export type Room = {
    id: number;
    roomName: string;
    buildingName: string;
}

export type Computer = {
    id: number;
    computerCode: string;
}

export type Ticket = {
    id: number;
    ticketCode: string;

    reportedBy: User;
    assignedTo: User;

    room: Room;
    computer: Computer;

    type: string;
    title: string;
    complaintDescription: string;

    issueImage: string | null;

    status: string;

    createdAt: string;
    updatedAt: string;
}