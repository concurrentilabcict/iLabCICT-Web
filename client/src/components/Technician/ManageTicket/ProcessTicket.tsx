import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ChevronDown,
    FileText,
    ImageOff,
    Layers2,
    MessageSquareText,
    Monitor,
    User,
    Wrench,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import NavBar from "@/components/Technician/NavBar/NavBar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createApiError, privateFetch, type ApiError } from "@/lib/api";
import type { ApiTicket, Ticket } from "@/types/ticket";
import { capitalize, formatDateTime } from "@/utils/string";
import {
    statusConfig,
    typeConfig,
    type Status,
    type TicketType,
} from "@/utils/ticket";

const maintenanceOptions = [
    { label: "Repair", value: "repair" },
    { label: "Replace", value: "replace" },
    { label: "Installation", value: "installation" },
];

const mapTicket = (ticket: ApiTicket): Ticket => ({
    id: ticket.id,
    ticketCode: ticket.ticket_code,
    reportedBy: {
        id: ticket.reported_by.id,
        firstName: ticket.reported_by.first_name,
        lastName: ticket.reported_by.last_name,
    },
    assignedTo: ticket.assigned_to ? {
        id: ticket.assigned_to.id,
        firstName: ticket.assigned_to.first_name,
        lastName: ticket.assigned_to.last_name,
    } : { id: 0, firstName: "Unassigned", lastName: "" },
    room: {
        id: ticket.room.id,
        roomName: ticket.room.room_name,
        buildingName: ticket.room.building_name,
        floorNumber: ticket.room.floor_number,
    },
    computer: ticket.computer ? {
        id: ticket.computer.id,
        computerCode: ticket.computer.computer_code,
    } : { id: 0, computerCode: "Not specified" },
    type: ticket.type,
    title: ticket.title,
    complaintDescription: ticket.complaint_description,
    issueImage: ticket.issue_image,
    status: ticket.status,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
});

const formatMaintenanceTitle = (maintenanceType: string) => {
    return maintenanceType
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export default function ProcessTicket() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isMobile = useMediaQuery("(max-width: 767px)");
    const technicianId = Number(localStorage.getItem("id"));
    const [maintenanceType, setMaintenanceType] = useState("repair");
    const [isMaintenanceTypeOpen, setIsMaintenanceTypeOpen] = useState(false);
    const [repairNotes, setRepairNotes] = useState("");

    const {
        data: ticket,
        isLoading,
        isError,
    } = useQuery<Ticket>({
        queryKey: ["ticket", id],
        queryFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/tickets/${id}/`);
            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status, data.message || "Failed to fetch ticket.");
            }

            return mapTicket(data as ApiTicket);
        },
        enabled: !!id,
    });

    const createRepairLogMutation = useMutation({
        mutationFn: async () => {
            if (!ticket) {
                throw createApiError(400, "Ticket is not available.");
            }

            if (!Number.isInteger(technicianId) || technicianId <= 0) {
                throw createApiError(400, "Unable to identify the logged-in technician.");
            }

            const notes = repairNotes.trim();

            if (!notes) {
                throw createApiError(400, "Please add technician notes before resolving the ticket.");
            }

            const createResponse = await privateFetch("https://ilabcict-backend.onrender.com/api/repair-logs/", {
                method: "POST",
                body: JSON.stringify({
                    maintenance_type: maintenanceType,
                    ticket: ticket.id,
                    title: `${formatMaintenanceTitle(maintenanceType)} - ${ticket.title}`,
                    repair_notes: notes,
                    technician: technicianId,
                }),
            });
            const createData = await createResponse.json();

            if (!createResponse.ok) {
                console.error("Failed to create repair log response:", createData);
                console.error("Failed to create repair log response JSON:", JSON.stringify(createData, null, 2));
                throw createApiError(createResponse.status, createData.message || "Failed to create repair log.");
            }
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["tickets"] }),
                queryClient.invalidateQueries({ queryKey: ["ticket", id] }),
                queryClient.invalidateQueries({ queryKey: ["repairLogs"] }),
                queryClient.invalidateQueries({ queryKey: ["admin-repair-logs"] }),
            ]);

            toast.success("Ticket resolved successfully.");
            navigate("/repair-logs", { replace: true });
        },
        onError: (error: ApiError) => {
            console.error("Failed to resolve ticket:", error);
            toast.error(error.message || "Failed to resolve ticket.");
        },
    });

    if (isLoading) {
        return (
            <ProcessTicketShell isMobile={isMobile}>
                <p className="py-10 text-center secondary-text-color">Loading ticket...</p>
            </ProcessTicketShell>
        );
    }

    if (isError || !ticket) {
        return <Navigate to="/manage-ticket" replace />;
    }

    if (ticket.status !== "ongoing" || ticket.type !== "report") {
        return <Navigate to="/manage-ticket" replace />;
    }

    const reportedBy = `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}`;
    const assignedTo = `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`.trim();
    const isSubmitting = createRepairLogMutation.isPending;
    const status = capitalize(ticket.status) as Status;
    const type = capitalize(ticket.type) as TicketType;
    const statusData = statusConfig[status];
    const typeData = typeConfig[type];
    const StatusIcon = statusData.icon;
    const selectedMaintenanceType = maintenanceOptions.find(
        (option) => option.value === maintenanceType
    )?.label ?? "Repair";

    return (
        <ProcessTicketShell isMobile={isMobile}>
            <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-3 py-4 pb-24 md:px-5 md:pb-8">
                <div className="flex flex-wrap items-center gap-2 text-sm secondary-text-color">
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-foreground">
                        {ticket.ticketCode}
                    </span>
                    <span className={`rounded-full px-3 py-1 font-medium ${typeData.className}`}>
                        {type}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${statusData.className}`}>
                        <StatusIcon size={14} />
                        {status}
                    </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
                    <section className="flex flex-col gap-4">
                        <div className="primary-border-color rounded-2xl border bg-white p-4">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="rounded-xl bg-red-50 p-2.5 text-primary-color">
                                    <Wrench size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl font-semibold">{ticket.title}</h1>
                                    <p className="mt-1 text-sm secondary-text-color">
                                        Reported {formatDateTime(ticket.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-dashed bg-muted/30 p-4">
                                <div className="mb-2 flex items-center gap-x-1.5 font-medium secondary-text-color">
                                    <FileText size={15} />
                                    <h2>Issue Description</h2>
                                </div>
                                <p className="leading-7">{ticket.complaintDescription}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="primary-border-color rounded-2xl border bg-white p-4">
                                <div className="mb-3 flex items-center gap-x-1.5 font-medium">
                                    <Monitor size={16} />
                                    <h2>Device Information</h2>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <InfoRow label="Computer" value={ticket.computer.computerCode} />
                                    <InfoRow label="Room" value={`${capitalize(ticket.room.buildingName)}, ${ticket.room.roomName}`} />
                                    <InfoRow label="Floor" value={`Floor ${ticket.room.floorNumber}`} />
                                </div>
                            </div>

                            <div className="primary-border-color rounded-2xl border bg-white p-4">
                                <div className="mb-3 flex items-center gap-x-1.5 font-medium">
                                    <User size={16} />
                                    <h2>People</h2>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <InfoRow label="Reported by" value={reportedBy} />
                                    <InfoRow label="Assigned to" value={assignedTo || "Unassigned"} />
                                    <InfoRow label="Updated" value={formatDateTime(ticket.updatedAt)} />
                                </div>
                            </div>
                        </div>

                        <div className="primary-border-color rounded-2xl border bg-white p-4">
                            <div className="mb-3 flex items-center gap-x-1.5 font-medium">
                                <ImageOff size={16} />
                                <h2>Attached Photo</h2>
                            </div>

                            {ticket.issueImage ? (
                                <img
                                    src={ticket.issueImage}
                                    alt={ticket.title}
                                    className="h-72 w-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 text-muted-foreground">
                                    <ImageOff size={28} />
                                    <span className="text-sm font-medium">No image attached</span>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="primary-border-color rounded-2xl border bg-white p-4">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="rounded-xl bg-red-50 p-2.5 text-primary-color">
                                    <MessageSquareText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Notes & Activity</h2>
                                    <p className="mt-1 text-sm secondary-text-color">
                                        Add the work performed before closing this ticket.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Maintenance type
                                    </label>
                                    <DropdownMenu
                                        open={isMaintenanceTypeOpen}
                                        onOpenChange={setIsMaintenanceTypeOpen}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                className="flex h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-input bg-white px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span>{selectedMaintenanceType}</span>
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform ${isMaintenanceTypeOpen ? "rotate-180" : ""}`}
                                                />
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="start"
                                            sideOffset={8}
                                            className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-md"
                                        >
                                            {maintenanceOptions.map((option) => (
                                                <DropdownMenuItem
                                                    key={option.value}
                                                    className={`px-3 py-2 ${maintenanceType === option.value ? "font-medium" : ""}`}
                                                    onSelect={() => setMaintenanceType(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Technician notes
                                    </label>
                                    <Textarea
                                        value={repairNotes}
                                        onChange={(event) => setRepairNotes(event.target.value)}
                                        placeholder="Add diagnostics, actions taken, parts replaced, and final result..."
                                        className="min-h-44 resize-none bg-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="rounded-xl bg-muted/40 p-3 text-sm secondary-text-color">
                                    Need help drafting notes?
                                    <button
                                        type="button"
                                        onClick={() => navigate("/chatbot")}
                                        className="ml-1 font-medium primary-text-color hover:underline"
                                    >
                                        Open chatbot
                                    </button>
                                </div>

                                <Button
                                    type="button"
                                    className="h-10 w-full"
                                    onClick={() => createRepairLogMutation.mutate()}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner className="size-5" />
                                            Resolving ticket...
                                        </>
                                    ) : (
                                        <>
                                            <Layers2 size={16} />
                                            Resolve Ticket
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </ProcessTicketShell>
    );
}

type ProcessTicketShellProps = {
    children: ReactNode;
    isMobile: boolean;
};

function ProcessTicketShell({ children, isMobile }: ProcessTicketShellProps) {
    return (
        <SidebarProvider>
            {isMobile ? <NavBar /> : <Sidebar />}
            <SidebarInset>
                <div className="min-h-screen bg-[#f8fafc]">
                    {isMobile ? <MobileHeader title="Process Ticket" /> : <Header title="Process Ticket" />}
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

type InfoRowProps = {
    label: string;
    value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="secondary-text-color">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}
