import type { LucideIcon } from "lucide-react";
import {
    AlertTriangle,
    BarChart3,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Clock3,
    Download,
    FileText,
    ImagePlus,
    Monitor,
    Radio,
    Send,
    UserCheck,
    Wrench,
} from "lucide-react";

type WorkflowAnimationVariant = "submit" | "track" | "resolve" | "report";

type WorkflowAnimationProps = {
    variant: WorkflowAnimationVariant;
};

type WorkflowStep = {
    label: string;
    detail: string;
    icon: LucideIcon;
};

type WorkflowAnimationConfig = {
    eyebrow: string;
    title: string;
    steps: WorkflowStep[];
};

const workflowAnimationConfig: Record<WorkflowAnimationVariant, WorkflowAnimationConfig> = {
    submit: {
        eyebrow: "Faculty intake",
        title: "Report package",
        steps: [
            {
                label: "Scan PC",
                detail: "PC202600014",
                icon: Monitor,
            },
            {
                label: "Attach image",
                detail: "Optional proof",
                icon: ImagePlus,
            },
            {
                label: "Send report",
                detail: "Ticket created",
                icon: Send,
            },
        ],
    },
    track: {
        eyebrow: "Live ticket board",
        title: "Open to resolved",
        steps: [
            {
                label: "Open",
                detail: "Faculty report",
                icon: AlertTriangle,
            },
            {
                label: "Assigned",
                detail: "Technician owner",
                icon: UserCheck,
            },
            {
                label: "Ongoing",
                detail: "Work in progress",
                icon: Radio,
            },
            {
                label: "Resolved",
                detail: "Closed loop",
                icon: CheckCircle2,
            },
        ],
    },
    resolve: {
        eyebrow: "Repair log archive",
        title: "Completed work",
        steps: [
            {
                label: "Diagnose",
                detail: "Broken monitor",
                icon: Wrench,
            },
            {
                label: "Update status",
                detail: "Resolved",
                icon: ClipboardCheck,
            },
            {
                label: "Save history",
                detail: "Maintenance log",
                icon: Clock3,
            },
        ],
    },
    report: {
        eyebrow: "Weekly reporting",
        title: "Scheduled output",
        steps: [
            {
                label: "Collect",
                detail: "Tickets and logs",
                icon: BarChart3,
            },
            {
                label: "Schedule",
                detail: "Friday 10:00 PM",
                icon: CalendarClock,
            },
            {
                label: "Export",
                detail: "Weekly summary",
                icon: Download,
            },
        ],
    },
};

export default function WorkflowAnimation({
    variant,
}: WorkflowAnimationProps) {
    const config = workflowAnimationConfig[variant];

    if (variant === "submit") {
        return (
            <div className="submit-workflow-demo">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-[#bf3419]" />
                        <span className="size-3 rounded-full bg-[#f4aa29]" />
                        <span className="size-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Faculty intake
                    </span>
                </div>

                <div className="submit-workflow-stage relative min-h-[390px] overflow-hidden bg-white p-5">
                    <div className="submit-workflow-glow" />
                    <div className="submit-workflow-panel relative z-10 mx-auto flex max-w-[520px] flex-col gap-4 rounded-[26px] border border-zinc-200 bg-zinc-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#bf3419] text-white">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Create report</p>
                                <h3 className="text-xl font-black text-zinc-950">Lab issue ticket</h3>
                            </div>
                        </div>

                        <div className="submit-workflow-field submit-workflow-field-lab">
                            <span>Laboratory</span>
                            <div className="flex items-center gap-2">
                                <strong>SLD 1</strong>
                                <ChevronDown size={17} className="text-zinc-400" />
                            </div>
                            <div className="submit-workflow-dropdown submit-workflow-dropdown-lab">
                                <p>SLD 1</p>
                                <p>SLD 2</p>
                                <p>ProgLab 1</p>
                            </div>
                        </div>

                        <div className="submit-workflow-field submit-workflow-field-pc">
                            <span>Affected computer</span>
                            <div className="flex items-center gap-2">
                                <strong>PC202600014</strong>
                                <ChevronDown size={17} className="text-zinc-400" />
                            </div>
                            <div className="submit-workflow-dropdown submit-workflow-dropdown-pc">
                                <p>PC202600012</p>
                                <p>PC202600014</p>
                                <p>PC202600018</p>
                            </div>
                        </div>

                        <div className="submit-workflow-field submit-workflow-field-title">
                            <span>Title</span>
                            <strong className="submit-workflow-type">Monitor not turning on</strong>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr]">
                            <div className="submit-workflow-description">
                                <span>Description</span>
                                <p>Screen stays black after checking cable and power strip.</p>
                            </div>

                            <div className="submit-workflow-upload">
                                <ImagePlus size={20} />
                                <span>Attach image</span>
                            </div>
                        </div>

                        <button className="submit-workflow-button" type="button">
                            <Send size={18} />
                            Submit report
                        </button>

                        <span className="submit-workflow-cursor" />
                    </div>

                    <div className="submit-workflow-toast">
                        <CheckCircle2 size={18} />
                        TK202600130 created
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`workflow-playbook workflow-playbook-${variant}`}>
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-[#bf3419]" />
                    <span className="size-3 rounded-full bg-[#f4aa29]" />
                    <span className="size-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    {config.eyebrow}
                </span>
            </div>

            <div className="workflow-playbook-stage">
                {variant === "track" && (
                    <div className="workflow-board workflow-board-track">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="workflow-kicker">Ticket board</p>
                                <h3 className="workflow-title">Manage ticket status</h3>
                            </div>
                            <span className="workflow-live-pill">Live</span>
                        </div>

                        <div className="workflow-filter-row">
                            <span>All</span>
                            <span>Open</span>
                            <span>Ongoing</span>
                            <span>Resolved</span>
                            <span className="workflow-filter-active">Assigned</span>
                        </div>

                        <div className="workflow-ticket-list">
                            <div className="workflow-ticket-row">
                                <div className="workflow-row-icon"><AlertTriangle size={17} /></div>
                                <div className="min-w-0 flex-1">
                                    <p>Monitor not turning on</p>
                                    <span>SLD 1 • PC202600014</span>
                                </div>
                                <strong className="workflow-track-status">
                                    <span className="workflow-track-status-open">Open</span>
                                    <span className="workflow-track-status-ongoing">Ongoing</span>
                                </strong>
                            </div>

                            <div className="workflow-ticket-row">
                                <div className="workflow-row-icon"><UserCheck size={17} /></div>
                                <div className="min-w-0 flex-1">
                                    <p>Keyboard replacement</p>
                                    <span>ProgLab 1 • PC202600018</span>
                                </div>
                                <strong className="workflow-status-resolved">Resolved</strong>
                            </div>
                        </div>

                        <div className="workflow-action-bar workflow-action-bar-track">
                            <span>Status is ready for update</span>
                            <button type="button">Update status</button>
                        </div>
                        <div className="workflow-toast workflow-toast-track"><CheckCircle2 size={16} /> Ticket moved to ongoing</div>
                        <span className="workflow-cursor workflow-cursor-track" />
                    </div>
                )}

                {variant === "resolve" && (
                    <div className="workflow-board workflow-board-resolve">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="workflow-kicker">Technician repair logs</p>
                                <h3 className="workflow-title">Resolved ticket history</h3>
                            </div>
                        </div>

                        <button className="workflow-repair-log-preview" type="button">
                            <div className="workflow-row-icon"><Wrench size={17} /></div>
                            <div className="min-w-0 flex-1">
                                <p>MH202600025</p>
                                <span>Monitor not turning on • resolved</span>
                            </div>
                            <strong>Open</strong>
                        </button>

                        <div className="workflow-repair-history-card workflow-repair-history-card-open">
                            <div className="workflow-repair-history-header">
                                <div className="workflow-row-icon"><Wrench size={17} /></div>
                                <div className="min-w-0 flex-1">
                                    <p>MH202600025</p>
                                    <span>Resolved from TK202600130</span>
                                </div>
                                <strong>Resolved</strong>
                            </div>

                            <div>
                                <h4>Monitor not turning on</h4>
                                <p>Replaced monitor cable and verified display output.</p>
                            </div>

                            <div className="workflow-repair-history-grid">
                                <div>
                                    <span>Computer</span>
                                    <strong>PC202600014</strong>
                                </div>
                                <div>
                                    <span>Room</span>
                                    <strong>SLD 1</strong>
                                </div>
                                <div>
                                    <span>Technician</span>
                                    <strong>Paul Adriyan Mojal</strong>
                                </div>
                                <div>
                                    <span>Resolved</span>
                                    <strong>Aug 24 • 6:55 PM</strong>
                                </div>
                            </div>
                        </div>

                        <span className="workflow-cursor workflow-cursor-resolve" />
                    </div>
                )}

                {variant === "report" && (
                    <div className="workflow-board workflow-board-report">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="workflow-kicker">Weekly report</p>
                                <h3 className="workflow-title">Generated summary</h3>
                                <span className="workflow-report-code">#RP202600016</span>
                            </div>
                            <button className="workflow-report-export-button" type="button">
                                <Download size={15} />
                                Export PDF
                            </button>
                        </div>

                        <div className="workflow-report-summary-card">
                            <div>
                                <FileText size={15} />
                                <span>Report Summary</span>
                            </div>
                            <p>
                                This week's maintenance summary highlights recurring broken monitor issues. Repairs were completed through replacement with minimal operational impact.
                            </p>
                        </div>

                        <div className="workflow-report-meta-grid">
                            <div>
                                <UserCheck size={15} />
                                <span>Technician</span>
                                <strong>John Patricks Soriaga</strong>
                            </div>
                            <div>
                                <CalendarClock size={15} />
                                <span>Created</span>
                                <strong>July 31, 2026 • 10:00 PM</strong>
                            </div>
                            <div>
                                <FileText size={15} />
                                <span>Total Logs</span>
                                <strong>4</strong>
                            </div>
                        </div>

                        <div className="workflow-report-log-summary">
                            <div>Repair Log Summary</div>
                            <div>
                                <strong>July 25, 2026</strong>
                                <span>4 logs</span>
                            </div>
                        </div>

                        <div className="workflow-toast workflow-toast-report"><FileText size={16} /> PDF exported</div>
                        <span className="workflow-cursor workflow-cursor-report" />
                    </div>
                )}
            </div>
        </div>
    );
}
