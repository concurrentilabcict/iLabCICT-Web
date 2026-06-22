import { FileText, FileWarning } from 'lucide-react';

export const ticketTypeConfig = {
    report: {
        icon: FileWarning,
        className: "bg-red-100 text-red-700",
    },

    request: {
        icon: FileText,
        className: "bg-purple-100 text-purple-700",
    }
}

export type TicketType = keyof typeof ticketTypeConfig;