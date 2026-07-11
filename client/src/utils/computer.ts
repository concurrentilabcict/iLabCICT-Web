
import { 
    CheckCircle2,
    Wrench,
    CircleX
 } from "lucide-react"


export const statusConfig = {
    Active: {
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700",
    },
    Fixing: {
        icon: Wrench,
        className: "bg-yellow-100 text-yellow-700",
    },
    Broken: {
        icon: CircleX,
        className: "bg-red-100 text-red-700",
    }
}

export const peripheralStatusConfig = {
    Active: {
        className: "bg-green-100 text-green-700",
    },
    Fixing: {
        className: "bg-yellow-100 text-yellow-700",
    },
    Broken: {
        className: "bg-red-100 text-red-700",
    },
    None: {
        className: "bg-gray-100 text-gray-600",
    }
}


export type Status = 
    keyof typeof statusConfig

export type PeripheralStatus = 
    keyof typeof peripheralStatusConfig

export type StatusFilter = "All" | Status

