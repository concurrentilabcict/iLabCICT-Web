import { Clock3, Radio, SlidersHorizontal, UserCheck } from "lucide-react";
import WorkflowAnimation from "@/components/LandingPage/WorkflowAnimation/WorkflowAnimation";

export default function TrackAndManage() {
  return (
    <section className="bg-white px-4 py-10 text-zinc-950 sm:px-6 lg:px-15">
      <div className="mx-auto grid max-w-[1180px] gap-8 text-zinc-950 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <WorkflowAnimation variant="track" />
        </div>

        <div className="order-1 flex flex-col justify-between gap-8 lg:order-2">
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
