import {
    Wrench,
    PackagePlus,
    ClipboardClock,
    Icon
} from "lucide-react"

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