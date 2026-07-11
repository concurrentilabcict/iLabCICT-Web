
import { 
    CheckCircle2, 
    CircleAlert,
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
    }
};

export const floorConfig: Record<Floor, string> = {
    1:"1st Floor",
    2:"2nd Floor",
    3: "3rd Floor"
}

export type Status = 
    keyof typeof statusConfig;

export type Floor = 1 | 2 | 3 
   
export type StatusFilter = "All" | Status 

export type FloorFilter = "All" | Floor
 


