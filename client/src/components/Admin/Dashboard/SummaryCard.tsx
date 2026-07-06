export default function SummaryCard() {
  return (
    <div
      className="
        min-w-0
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-gradient-to-br
        from-[#faf9fa]
        via-[#f9f6f7]
        to-[#f5ebed]
        px-4 py-5
        sm:px-5 sm:py-6
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-zinc-800 sm:text-base">
            Total Revenue
          </h3>

          <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
            <span className="font-medium text-emerald-500">
              +20.1%
            </span>{" "}
            from last month
          </p>
        </div>

        <span className="shrink-0 text-xl text-zinc-400 sm:text-2xl">$</span>
      </div>

      <h2 className="mt-8 break-words text-2xl font-medium tracking-tight text-zinc-800 sm:mt-12 sm:text-3xl">
        $45,231.89
      </h2>
    </div>
  );
}
