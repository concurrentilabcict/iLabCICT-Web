
import { 
    CheckCircle2, 
    CircleAlert,
    CircleHelp,
    CircleMinus,
    CircleX
} from "lucide-react";


export const statusConfig = {
    Operational: {
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700",
        value: "Operational"
    },

    Maintenance: {
        icon: CircleAlert,
        className: "bg-yellow-100 text-yellow-700",
        value: "Maintenance"
    },

    Degraded: {
        icon: CircleMinus,
        className: "bg-orange-100 text-orange-700",
        value: "Degraded"
    },

    OutOfService: {
        icon: CircleX,
        className: "bg-red-100 text-red-700",
        value: "Out of Service"
    },

    Unknown: {
        icon: CircleHelp,
        className: "bg-zinc-100 text-zinc-600",
        value: "Unknown"
    }
};

export const floorConfig: Record<Floor, string> = {
    1:"1st Floor",
    2:"2nd Floor",
    3: "3rd Floor"
}

export type Status = 
    keyof typeof statusConfig;

export const normalizeRoomStatus = (status: string): Status => {
    const normalizedStatus = status.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const statusLookup: Record<string, Status> = {
        operational: "Operational",
        maintenance: "Maintenance",
        degraded: "Degraded",
        outofservice: "OutOfService",
    };

    return statusLookup[normalizedStatus] ?? "Unknown";
};

export type Floor = 1 | 2 | 3 
   
export type StatusFilter = "All" | Status 

export type FloorFilter = "All" | Floor
 

