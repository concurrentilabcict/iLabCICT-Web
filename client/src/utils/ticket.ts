import {
    Clock3,
    CircleDot,
    CheckCircle2,
} from "lucide-react";

export const statusConfig = {
    Open: {
        icon: CircleDot,
        className: "bg-blue-100 text-blue-700",
    },

    Ongoing: {
        icon: Clock3,
        className: "bg-yellow-100 text-yellow-700",
    },

    Resolved: {
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700",
    },
};

export const typeConfig = {
  Request: {
    className: "bg-purple-100 text-purple-700",
  },

  Report: {
    className: "bg-red-100 text-red-700",
  },
};

export type Status =
    keyof typeof statusConfig;

export type TicketType =
    keyof typeof typeConfig;

export type StatusFilter =
    "All" | Status;

export type TicketTypeFilter =
    "All" | TicketType;
