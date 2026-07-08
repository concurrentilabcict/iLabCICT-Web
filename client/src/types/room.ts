<<<<<<< HEAD
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
=======


export type Room = {
    id: number;
    computerCount: number;
    buildingName: string;
    roomName: string;
    floorNumber: number;
    status: string;
    createdAt: string;
    updatedAt: string;
>>>>>>> e44832bcd46116c42fbb29d2a4d67f1223f707ea
}
