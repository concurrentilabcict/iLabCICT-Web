export type RequestHistoryRoom = {
  id: number;
  roomName: string;
  buildingName: string;
  floorNumber: number;
};

export type RequestHistoryTicket = {
  id: number;
  status: string;
  issueImage: string | null;
  title: string;
  type: string;
  complaintDescription: string;
};

export type RequestHistoryTechnician = {
  id: number;
  firstName: string;
  lastName: string;
};

export type RequestHistory = {
  id: number;
  room: RequestHistoryRoom;
  ticket: RequestHistoryTicket;
  technician: RequestHistoryTechnician | null;
  datePerformed: string;
  requestHistoryCode: string;
};

export type ApiRequestHistory = {
  id: number;
  room: {
    id: number;
    room_name: string;
    building_name: string;
    floor_number: number;
  };
  ticket: {
    id: number;
    status: string;
    issue_image: string | null;
    title: string;
    type: string;
    complaint_description: string;
  };
  technician: {
    id: number;
    last_name: string;
    first_name: string;
  } | null;
  date_performed: string;
  request_history_code: string;
};

