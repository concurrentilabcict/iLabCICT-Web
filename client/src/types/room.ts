export type Room = {
    id: number,
    computerCount: number,
    activeIssuesCount: number,
    assignedCustodian:{
        id: number,
        lastName: string,
        firstName: string
    } | null,
    assignedTechnician?:{
        id: number,
        lastName: string,
        firstName: string
    } | null,
    floorNumber:number
    buildingName: string,
    roomName: string,
    status: string,
    createdAt: string,
    updatedAt: string
}

export type RoomDashboard = {
    id: number,
    computerCount: number,
    floorNumber:number
    buildingName: string,
    roomName: string,
    status: string,
    createdAt: string,
    updatedAt: string
}

export type ApiRoomUser = {
    id: number,
    first_name: string,
    last_name: string
}

export type ApiRoom = {
    id: number,
    computer_count?: number,
    active_issues_count?: number,
    computer_count_with_active_issues?: number,
    assigned_custodian?: ApiRoomUser | null,
    assigned_technician?: ApiRoomUser | null,
    building_name: string,
    room_name: string,
    floor_number: number,
    status: string,
    created_at: string,
    updated_at: string
}

export type BuildingNames = "pimentel" | "law" | "acad";

export type RoomStatus = "operational" | "maintenance" | "degraded" | "out of service";

export type FloorNumber = 1 | 2 | 3;

export type RoomForm = {
    roomName: string,
    floorNumber: FloorNumber,
    buildingName: BuildingNames,
    roomStatus: RoomStatus,
    assignedCustodianId: number | null,
    assignedTechnicianId: number | null,
}

export type EditRoomFormType = {
    id: number | null 
    roomName: string,
    floorNumber: FloorNumber,
    buildingName: BuildingNames,
    roomStatus: RoomStatus,
    assignedCustodianId: number | null,
    assignedTechnicianId: number | null,
}
