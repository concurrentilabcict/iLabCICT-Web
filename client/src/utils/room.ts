
import { 
    CheckCircle2, 
    CircleAlert,
    CircleMinus,
    CircleX
} from "lucide-react";


export const statusConfig = {
    Operational: {
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700"
    },

    Maintenance: {
        icon: CircleAlert,
        className: "bg-yellow-100 text-yellow-700"
    },

    Degraded: {
        icon: CircleMinus,
        className: "bg-orange-100 text-orange-700"
    },

    OutOfService: {
        icon: CircleX,
        className: "bg-red-100 text-red-700"
    }
};

export const floorConfig = {
    1:{
        value: "1st Floor"
    },

    2:{
        value: "2nd Floor"
    },

    3:{
        value: "3rd Floor"
    }
}

export type Status = 
    keyof typeof statusConfig;

export type Floor = 
    keyof typeof floorConfig;

export type StatusFilter = "All" | Status 

export type floorFilter = "All" | Floor
 


