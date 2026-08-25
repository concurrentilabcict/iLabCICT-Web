import { CalendarClock, Download, FileText, UserCheck } from "lucide-react";
import WorkflowAnimation from "@/components/LandingPage/WorkflowAnimation/WorkflowAnimation";

type GenerateReportsProps = {
    isDarkMode: boolean;
};

export default function GenerateReports({
    isDarkMode,
}: GenerateReportsProps) {
    return (
        <section className={`px-4 py-10 sm:px-6 lg:px-15 ${isDarkMode ? "bg-black text-white" : "bg-white text-zinc-950"}`}>
            <div className="mx-auto grid max-w-[1180px] gap-8 text-zinc-950 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <WorkflowAnimation variant="report" />

                <div className="flex flex-col justify-between gap-8">
                    <div>
                        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#bf3419] text-sm font-black text-white">04</span>
                        <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">Generate reports that are ready to review.</h2>
                        <p className="mt-4 max-w-[520px] text-sm font-medium leading-7 text-zinc-600 sm:text-base">
                            Weekly reports show the written maintenance summary, technician, created date, total logs, and repair log breakdown with PDF export.
                        </p>
                    </div>

                    <div className="grid gap-3 text-sm font-bold text-zinc-700 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
                            <FileText size={18} className="text-[#bf3419]" />
                            Report summary
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
                            <UserCheck size={18} className="text-[#bf3419]" />
                            Technician record
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
                            <CalendarClock size={18} className="text-[#bf3419]" />
                            Repair log date
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
                            <Download size={18} className="text-[#bf3419]" />
                            Export PDF
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
