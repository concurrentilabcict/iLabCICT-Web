import HeroButtons from "./HeroButtons";

export default function HeroContent() {
    return (
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bf3419]/15 bg-white/80 px-4 py-2 text-xs font-bold uppercase text-[#bf3419] shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                Laboratory Maintenance Platform
            </div>

            <div className="space-y-4">
                <h1 className="text-6xl font-black leading-none text-zinc-950 sm:text-7xl lg:text-9xl">
                    iLabCICT
                </h1>
                <p className="mx-auto max-w-[720px] text-2xl font-semibold leading-tight text-zinc-900 sm:text-4xl lg:text-5xl">
                    Premium control for laboratory support, assets, and reports.
                </p>
            </div>

            <p className="mx-auto max-w-[680px] text-sm font-medium leading-7 text-zinc-600 sm:text-base">
                Centralize faculty requests, technician workflows, room computers, audit trails, and weekly reporting in one reliable CICT operations system.
            </p>

            <HeroButtons />
        </div>
    );
}
