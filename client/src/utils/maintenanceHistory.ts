import {
    Wrench,
    PackagePlus,
    ClipboardClock
} from "lucide-react"
import type {
    ApiMaintenanceHistory,
    MaintenanceHistory,
    MaintenanceHistoryTechnician,
} from "@/types/maintenanceHistory"

export const maintenanceTypeConfig = {
    Repair: {
        icon:Wrench,
        className: "bg-red-100 text-red-700",
    },

    Maintenance: {
        icon:ClipboardClock,
        className: "bg-blue-100 text-blue-700",
    },

    Installation: {
        icon:PackagePlus,
        className: "bg-amber-100 text-amber-700",
    }

}

export type MaintenanceTypes = 
    keyof typeof maintenanceTypeConfig

const formatTechnicianName = (technician: MaintenanceHistoryTechnician) => {
    return [technician.first_name, technician.last_name]
        .map((name) => name.trim())
        .filter(Boolean)
        .join(" ")
}

const getPerformedBy = (history: ApiMaintenanceHistory) => {
    if (typeof history.performed_by === "string") {
        return history.performed_by.trim() || "Not recorded"
    }

    if (history.performed_by) {
        return formatTechnicianName(history.performed_by) || "Not recorded"
    }

    if (typeof history.technician === "object") {
        return formatTechnicianName(history.technician) || "Not recorded"
    }

    return "Not recorded"
}

export const mapMaintenanceHistory = (
    history: ApiMaintenanceHistory
): MaintenanceHistory => ({
    id: history.id,
    maintenanceHistoryCode: history.maintenance_history_code,
    maintenanceType: history.maintenance_type,
    maintenanceNotes: history.maintenance_notes,
    performedBy: getPerformedBy(history),
    computerId: history.computer,
    technicianId:
        typeof history.technician === "number"
            ? history.technician
            : history.technician.id,
    datePerformed: history.date_performed,
    repairLog: history.repair_log,
})
