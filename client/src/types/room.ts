export type Room = {
    id: number,
    computerCount: number,
    activeIssuesCount: number,
    assignedCustodian:{
        id: number,
        lastName: string,
        firstName: string
    },
    floorNumber:number
    buildingName: string,
    roomName: string,
    status: string,
    createdAt: string,
    updatedAt: string
}
