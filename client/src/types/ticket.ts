export type User = {
    id: number;
    first_name: string;
    last_name: string;
}

export type Room = {
    id: number;
    room_name: string;
    building_name: string;
}

export type Computer = {
    id: number;
    computer_code: string;
}

export type Tickets = {
    id: number;
    status: string;
    type: string;
    title: string;
    complaint_description: string;
    ticket_code: string;
    reported_by: User;
    room: Room;
    computer: Computer;
}