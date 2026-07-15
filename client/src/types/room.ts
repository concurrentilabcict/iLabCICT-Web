export type Room = {
    id: number,
    computerCount: number,
    activeIssuesCount: number,
    assignedCustodian:{
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
export type BuildingNames = "pimentel" | "law" | "acad";

export type RoomStatus = "operational" | "maintenance" | "degraded" | "out of service";

export type FloorNumber = 1 | 2 | 3;

export type RoomForm = {
    roomName: string,
    floorNumber: FloorNumber,
    buildingName: BuildingNames,
    roomStatus: RoomStatus,
    assignedCustodianId: number | null,
}

export type EditRoomFormType = {
    id: number | null 
    roomName: string,
    floorNumber: FloorNumber,
    buildingName: BuildingNames,
    roomStatus: RoomStatus,
    assignedCustodianId: number | null,
}
