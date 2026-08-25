import { CheckCircle2, Clock3, Monitor, Wrench } from "lucide-react";
import WorkflowAnimation from "@/components/LandingPage/WorkflowAnimation/WorkflowAnimation";

type ResolveEfficientlyProps = {
  isDarkMode: boolean;
};

export default function ResolveEfficiently({
  isDarkMode,
}: ResolveEfficientlyProps) {
  return (
    <section className={`px-4 py-10 sm:px-6 lg:px-15 ${isDarkMode ? "bg-black text-white" : "bg-white text-zinc-950"}`}>
      <div className="mx-auto grid max-w-[1180px] gap-8 text-zinc-950 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#bf3419] text-sm font-black text-white">03</span>
            <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">Review resolved ticket history.</h2>
            <p className="mt-4 max-w-[520px] text-sm font-medium leading-7 text-zinc-600 sm:text-base">
              Repair logs keep the resolved ticket, repair notes, technician, computer, room, and completion date in one clear history.
            </p>
          </div>

          <div className="grid gap-3 text-sm font-bold text-zinc-700 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <CheckCircle2 size={18} className="text-[#bf3419]" />
              Resolved tickets
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <Wrench size={18} className="text-[#bf3419]" />
              Repair notes
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <Monitor size={18} className="text-[#bf3419]" />
              Device context
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <Clock3 size={18} className="text-[#bf3419]" />
              Completion date
            </div>
          </div>
        </div>

        <WorkflowAnimation variant="resolve" />
      </div>
    </section>
  );
}
