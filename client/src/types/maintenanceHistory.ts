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

export type MaintenanceHistoryTechnician = {
    id: number,
    first_name: string,
    last_name: string,
}

export type ApiMaintenanceHistory = {
    id: number,
    maintenance_history_code: string,
    maintenance_type: string,
    maintenance_notes: string,
    performed_by?: string | MaintenanceHistoryTechnician | null,
    computer: number,
    technician: number | MaintenanceHistoryTechnician,
    date_performed: string,
    repair_log: MaintenanceHistoryRepairLog,
}
