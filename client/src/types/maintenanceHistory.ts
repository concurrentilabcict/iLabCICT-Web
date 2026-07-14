export type MaintenanceHistory = {
    id: number,
    maintenanceHistoryCode: string,
    maintenanceType: string,
    maintenanceNotes: string,
    performedBy: string,
    computerId: number,
    technicianId: number,
    datePerformed: string,
    repairLog: MaintenanceHistoryRepairLog
}

export type MaintenanceHistoryRepairLog = {
    id: number,
    ticket: {
        id: number,
        status: string,
        issueImage: string
    },
    repairLogCode: string,
    title: string,
}