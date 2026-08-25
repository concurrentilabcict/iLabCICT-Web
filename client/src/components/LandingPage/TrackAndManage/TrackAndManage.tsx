import { Clock3, Radio, SlidersHorizontal, UserCheck } from "lucide-react";
import WorkflowAnimation from "@/components/LandingPage/WorkflowAnimation/WorkflowAnimation";

type TrackAndManageProps = {
  isDarkMode: boolean;
};

export default function TrackAndManage({
  isDarkMode,
}: TrackAndManageProps) {
  return (
    <section className={`px-4 py-10 sm:px-6 lg:px-15 ${isDarkMode ? "bg-black text-white" : "bg-white text-zinc-950"}`}>
      <div className="mx-auto grid max-w-[1180px] gap-8 text-zinc-950 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <WorkflowAnimation variant="track" />

        <div className="flex flex-col justify-between gap-8">
          <div>
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#bf3419] text-sm font-black text-white">02</span>
            <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">Track every ticket as it moves.</h2>
            <p className="mt-4 max-w-[520px] text-sm font-medium leading-7 text-zinc-600 sm:text-base">
              Technicians can assign work, filter by status, and keep the board updated from open to ongoing to resolved.
            </p>
          </div>

          <div className="grid gap-3 text-sm font-bold text-zinc-700 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <UserCheck size={18} className="text-[#bf3419]" />
              Assignment control
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <SlidersHorizontal size={18} className="text-[#bf3419]" />
              Status filtering
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <Radio size={18} className="text-[#bf3419]" />
              Live updates
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
              <Clock3 size={18} className="text-[#bf3419]" />
              Faster response
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
