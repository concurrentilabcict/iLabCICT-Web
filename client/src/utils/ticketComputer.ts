import type { ApiTicketComputer, Computer } from "@/types/ticket";

export const mapTicketComputer = (computer: ApiTicketComputer): Computer => ({
  id: computer.id,
  computerCode: computer.computer_code,
  computerNumber: computer.computer_number,
  room: computer.room ? {
    id: computer.room.id,
    roomName: computer.room.room_name,
    buildingName: computer.room.building_name,
    floorNumber: computer.room.floor_number,
  } : undefined,
});
