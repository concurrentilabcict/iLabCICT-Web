import { ChevronDown, CircleAlert, HelpCircle, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "What should I do if the mouse or keyboard is not working?",
    answer:
      "Check that the device is securely connected. If it still does not work, try another USB port and submit a report if the problem continues.",
  },
  {
    question: "How do I restart a computer?",
    answer:
      "Save your work first, then select Restart from the Start menu. If the screen is unresponsive, make sure the monitor is powered on and the HDMI/VGA cable is connected properly. If the issue continues, submit a ticket through the Manage Tickets page.",
  },
  {
    question: "How can I check if a laboratory is under maintenance?",
    answer:
      "Open the Laboratory page to view the current room status and any available maintenance notices.",
  },
  {
    question: "How can I track my submitted tickets?",
    answer:
      "Open Manage Tickets to see your reported issues and their current status: Open, Ongoing, or Resolved.",
  },
  {
    question: "What happens after I submit a report?",
    answer:
      "A technician reviews the report, updates its status, and works on the issue. You can monitor the progress from Manage Tickets.",
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3 py-5 md:px-6 md:py-7">
      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 primary-text-color">
                <HelpCircle size={20} />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-950">FAQ</h1>
                <p className="text-sm font-medium text-zinc-500">Quick help for common lab issues.</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Topics</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950">{faqs.length}</p>
              <p className="mt-1 text-sm font-medium text-zinc-500">Frequently asked questions</p>
            </div>
          </section>

          <section className="rounded-xl bg-[#fff5ed] p-5 text-[#943915] shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
            <div className="flex items-start gap-3">
              <CircleAlert size={20} className="mt-0.5 shrink-0" />
              <div>
                <h2 className="text-base font-bold">Still experiencing issues?</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed">
                  Create a ticket and our technicians will help with troubleshooting and resolution.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/create-ticket")}
              className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#bf4b24] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#a9401e]"
            >
              <MessageSquareText size={16} />
              Create a Ticket
            </button>
          </section>
        </aside>

        <section className="self-start rounded-xl bg-white p-3 shadow-[0_4px_14px_rgba(15,23,42,0.08)] md:p-4">
          <div className="border-b border-zinc-100 px-2 pb-3 md:px-3">
            <h2 className="text-base font-bold text-zinc-950">Common Questions</h2>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Choose a question to view the answer.
            </p>
          </div>

          <div className="divide-y divide-zinc-100">
            {faqs.map((faq) => {
              const isOpen = openQuestion === faq.question;

              return (
                <article key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(isOpen ? null : faq.question)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-2 py-3 text-left md:px-3"
                  >
                    <h3 className="text-sm font-semibold leading-snug text-zinc-950">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`shrink-0 text-zinc-500 transition-transform ${
                        isOpen ? "rotate-180 primary-text-color" : ""
                      }`}
                      size={18}
                    />
                  </button>
                  {isOpen && (
                    <p className="px-2 pb-5 text-sm font-medium leading-relaxed text-zinc-500 md:px-3">
                      {faq.answer}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
