import { createApiError, privateFetch } from "@/lib/api";
import type { User } from "@/types/manageUser";
import type { Room } from "@/types/room";
import type { ApiTicket, Ticket } from "@/types/ticket";

type ApiRoom = {
  id: number;
  computer_count: number;
  active_issues_count?: number;
  assigned_custodian?: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  building_name: string;
  room_name: string;
  floor_number: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type ApiUser = {
  id: number;
  userCode?: string;
  user_code?: string;
  username: string;
  email: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  role: string;
  profileImage?: string;
  profile_image?: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at: string;
};

export type DashboardData = {
  tickets: Ticket[];
  rooms: Room[];
  users: User[];
};

const TICKETS_URL = "https://ilabcict-backend.onrender.com/api/tickets/";
const ROOMS_URL = "https://ilabcict-backend.onrender.com/api/rooms/";
const USERS_URL = "https://ilabcict-backend.onrender.com/api/users/";

const getArrayResponse = <T>(data: T[] | { results?: T[] }) =>
  Array.isArray(data) ? data : data.results ?? [];

const mapTicket = (ticket: ApiTicket): Ticket => ({
  id: ticket.id,
  ticketCode: ticket.ticket_code,
  reportedBy: {
    id: ticket.reported_by.id,
    firstName: ticket.reported_by.first_name,
    lastName: ticket.reported_by.last_name,
    profileImage:
      ticket.reported_by.profileImage ?? ticket.reported_by.profile_image ?? "",
  },
  assignedTo: {
    id: ticket.assigned_to?.id ?? 0,
    firstName: ticket.assigned_to?.first_name ?? "Unassigned",
    lastName: ticket.assigned_to?.last_name ?? "",
    profileImage:
      ticket.assigned_to?.profileImage ?? ticket.assigned_to?.profile_image ?? "",
  },
  room: {
    id: ticket.room.id,
    roomName: ticket.room.room_name,
    buildingName: ticket.room.building_name,
    floorNumber: ticket.room.floor_number,
  },
  computer: {
    id: ticket.computer?.id ?? 0,
    computerCode: ticket.computer?.computer_code ?? "N/A",
  },
  type: ticket.type,
  title: ticket.title,
  complaintDescription: ticket.complaint_description,
  issueImage: ticket.issue_image,
  status: ticket.status,
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
});

const mapRoom = (room: ApiRoom): Room => ({
  id: room.id,
  computerCount: room.computer_count,
  activeIssuesCount: room.active_issues_count ?? 0,
  assignedCustodian: room.assigned_custodian
    ? {
        id: room.assigned_custodian.id,
        firstName: room.assigned_custodian.first_name,
        lastName: room.assigned_custodian.last_name,
      }
    : null,
  buildingName: room.building_name,
  roomName: room.room_name,
  floorNumber: room.floor_number,
  status: room.status,
  createdAt: room.created_at,
  updatedAt: room.updated_at,
});

const mapUser = (user: ApiUser): User => ({
  id: user.id,
  userCode: user.userCode ?? user.user_code ?? String(user.id),
  username: user.username,
  email: user.email,
  firstName: user.firstName ?? user.first_name ?? "",
  lastName: user.lastName ?? user.last_name ?? "",
  role: user.role,
  profileImage: user.profileImage ?? user.profile_image ?? "",
  isActive: user.isActive ?? user.is_active ?? false,
  createdAt: user.createdAt ?? user.created_at,
});

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await privateFetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw createApiError(response.status, data.message || errorMessage);
  }

  return data as T;
}

async function fetchTickets() {
  const data = await fetchJson<ApiTicket[] | { results?: ApiTicket[] }>(
    TICKETS_URL,
    "Failed to fetch dashboard tickets."
  );

  return getArrayResponse(data).map(mapTicket);
}

async function fetchRooms() {
  const data = await fetchJson<ApiRoom[] | { results?: ApiRoom[] }>(
    ROOMS_URL,
    "Failed to fetch dashboard laboratories."
  );

  return getArrayResponse(data).map(mapRoom);
}

async function fetchUsers() {
  const data = await fetchJson<ApiUser[] | { results?: ApiUser[] }>(
    USERS_URL,
    "Failed to fetch dashboard users."
  );

  return getArrayResponse(data).map(mapUser);
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [tickets, rooms, users] = await Promise.all([
    fetchTickets(),
    fetchRooms(),
    fetchUsers(),
  ]);

  return { tickets, rooms, users };
}
