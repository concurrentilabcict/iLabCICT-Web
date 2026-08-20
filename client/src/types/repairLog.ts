export type Ticket = {
    id: number;
    ticketCode?: string;
    type: string;
    title?: string;
    complaintDescription?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    reportedBy: {
        id: number;
        firstName: string;
        lastName: string;
    };
    assignedTo: {
        id: number;
        firstName: string;
        lastName: string;
    };
    room?: {
        id: number;
        roomName: string;
        buildingName: string;
        floorNumber: number;
    };
    computer?: {
        id: number;
        computerCode: string;
    } | null;
}

export type RepairLog = {
    id: number;
    ticket: Ticket;
    repairLogCode: string;
    title: string;
    repairNotes: string;
    createdAt: string;
}
