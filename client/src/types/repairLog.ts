export type Ticket = {
    id: number;
    type: string;
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
}

export type RepairLog = {
    id: number;
    ticket: Ticket;
    repairLogCode: string;
    title: string;
    repairNotes: string;
    createdAt: string;
}
