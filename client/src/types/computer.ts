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
    room: number
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

export type ApiComputerCard = {
    id: number,
    computer_code: string,
    room: number,
    operating_system: string,
    gpu: string,
    cpu: string,
    ram_size_installed: number,
    disk_size_installed: number,
    build_version: string,
    computer_status: string,
    motherboard: string,
    monitor_status: string,
    mouse_status: string,
    keyboard_status: string,
    ups_status: string,
    created_at: string,
    updated_at: string
}

export type ApiRoomComputers = {
    id: number,
    room_name: string,
    assigned_custodian?: {
        id: number,
        first_name: string,
        last_name: string
    } | null,
    computers: ApiComputerCard[],
    building_name: string,
    floor_number: number,
    assigned_technician?: {
        id: number,
        first_name: string,
        last_name: string
    } | null
}
