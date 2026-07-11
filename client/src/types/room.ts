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
