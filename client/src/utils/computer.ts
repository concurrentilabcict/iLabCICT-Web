
import { 
    CheckCircle2,
    Wrench,
    CircleX,
    CircleHelp
 } from "lucide-react"


export const statusConfig = {
    Active: {
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700",
    },
    Pending: {
        icon: Wrench,
        className: "bg-yellow-100 text-yellow-700",
    },
    Unserviceable: {
        icon: CircleX,
        className: "bg-red-100 text-red-700",
    }
}

export const peripheralStatusConfig = {
    Active: {
        className: "bg-green-100 text-green-700",
    },
    Pending: {
        className: "bg-yellow-100 text-yellow-700",
    },
    Unserviceable: {
        className: "bg-red-100 text-red-700",
    },
    None: {
        className: "bg-gray-100 text-gray-600",
    }
}


export type Status = 
    keyof typeof statusConfig

const unknownStatusData = {
    icon: CircleHelp,
    className: "bg-gray-100 text-gray-600",
}

const isStatus = (status: string): status is Status =>
    Object.hasOwn(statusConfig, status)

export const getStatusData = (status: string) =>
    isStatus(status) ? statusConfig[status] : unknownStatusData

export type PeripheralStatus = 
    keyof typeof peripheralStatusConfig

export type StatusFilter = "All" | Status | "Archived"

export const SIZE_UNIT_OPTIONS = ["MB", "GB", "TB"] as const

export const DEFAULT_SIZE_UNIT = "GB"

export const formatSize = (size: number, unit?: string | null) =>
    `${size} ${unit || DEFAULT_SIZE_UNIT}`
