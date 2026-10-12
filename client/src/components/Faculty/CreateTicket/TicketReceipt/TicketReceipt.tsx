import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { formatDateTime } from "@/utils/string";

import type { TicketReceiptData } from "../hooks";

const REDIRECT_SECONDS = 5;

type TicketReceiptProps = {
  receipt: TicketReceiptData;
};

export default function TicketReceipt({ receipt }: TicketReceiptProps) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const isReport = receipt.type === "report";

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate("/manage-ticket", { replace: true });
      return;
    }

    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, navigate]);

  const details = [
    { label: "Ticket Code", value: receipt.ticketCode },
    { label: "Type", value: isReport ? "Report" : "Request" },
    { label: "Title", value: receipt.title },
    { label: "Computer", value: receipt.computerCode },
    { label: "Laboratory", value: receipt.laboratory },
    { label: "Status", value: "Open" },
    { label: "Submitted", value: formatDateTime(receipt.submittedAt) },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  return (
    <section role="status" className="mx-auto w-full max-w-[520px] px-5 py-8">
      <div className="rounded-2xl bg-white p-6 text-center shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-600 text-white">
          <Check size={32} />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950">
          {isReport ? "Report Submitted!" : "Request Submitted!"}
        </h1>
        <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-500">
          {isReport
            ? "Our technicians will review your report and help resolve the issue quickly."
            : "Our technicians will review your request and provide the support you need."}
        </p>

        <div className="mt-5 rounded-xl bg-zinc-50 px-4 py-1 text-left">
          <dl className="divide-y divide-zinc-200">
            {details.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-3">
                <dt className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</dt>
                <dd className="min-w-0 break-words text-right text-sm font-bold text-zinc-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mb-3 rounded-lg bg-white p-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">Description</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-zinc-700">{receipt.description}</p>
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-zinc-400">Redirecting to tickets in {secondsLeft}s...</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full primary-bg-color transition-[width] duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / REDIRECT_SECONDS) * 100}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => navigate("/manage-ticket", { replace: true })}
          className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl primary-bg-color text-sm font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
        >
          <ArrowRight size={18} />
          Go to Tickets
        </button>
      </div>
    </section>
  );
}
