export type Computer = {
    id: number,
    room: {
        id: number,
        roomName: string,
        buildingName: string
        floorNumber: number
    },
    computerCode: string,
    operatingSystem: string,
    gpu: string,
    cpu: string,
    motherboard: string,
    ramSizeInstalled: number,
    diskSizeInstalled: number,
    buildVersion: string,
    computerStatus: string,
    monitorStatus: string,
    mouseStatus: string,
    keyboardStatus: string,
    upsStatus: string,
    updatedAt: string,
    createdAt: string
}


export type ComputerList = {
    id: number,
    assignedCustodian: {
        id: number,
        firstName: string,
        lastName: string
    },
    roomName: string,
    computers: [
        ComputerCardType
    ]
    totalComputers: number
}

export type ComputerCardType = {
    id: number,
    computerCode: string,
    operatingSystem: string,
    computerStatus: string
    createdAt: string,
    updatedAt: string,
}