export default function Footer() {
    return (
        <footer id="contact" className="border-t border-white/10 bg-black px-4 py-8 text-white sm:px-6 lg:px-15">
            <div className="mx-auto flex max-w-[1180px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-2xl font-black">iLabCICT</p>
                    <p className="mt-2 max-w-[420px] text-sm font-medium leading-6 text-zinc-400">
                        Laboratory Maintenance and Technical Support Management for CICT operations.
                    </p>
                </div>

                <div className="flex flex-col gap-2 text-sm font-semibold text-zinc-400 md:items-end">
                    <div className="flex w-full items-center justify-between gap-6 md:block md:w-auto">
                        <span>Bulacan State University</span>
                        <span className="text-zinc-500 md:hidden">2026</span>
                    </div>
                    <span>Built by Team Concurrent</span>
                    <span className="hidden text-zinc-500 md:block">2026</span>
                </div>
            </div>
        </footer>
    );
}
