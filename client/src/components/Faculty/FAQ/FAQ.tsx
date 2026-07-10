import { ChevronDown, CircleAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "What should I do if the mouse or keyboard is not working?",
    answer: "Check that the device is securely connected. If it still does not work, try another USB port and submit a report if the problem continues.",
  },
  {
    question: "How do I restart a computer?",
    answer: "Save your work first, then select Restart from the Start menu. If the screen is unresponsive, make sure the monitor is powered on and the HDMI/VGA cable is connected properly. If the issue continues, submit a ticket through the Manage Tickets page.",
  },
  {
    question: "How can I check if a laboratory is under maintenance?",
    answer: "Open the Laboratory page to view the current room status and any available maintenance notices.",
  },
  {
    question: "How can I track my submitted tickets?",
    answer: "Open Manage Tickets to see your reported issues and their current status: Open, Ongoing, or Resolved.",
  },
  {
    question: "What happens after I submit a report?",
    answer: "A technician reviews the report, updates its status, and works on the issue. You can monitor the progress from Manage Tickets.",
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-5 md:px-5">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Explore FAQ</h1>
        <p className="mt-1 text-base text-gray-500">Find answers to common questions</p>
      </section>

      <section className="mt-5 space-y-3">
        {faqs.map((faq) => {
          const isOpen = openQuestion === faq.question;

          return (
            <article key={faq.question} className={`overflow-hidden rounded-2xl transition-colors ${
              isOpen ? "bg-[#bf4b24] text-white shadow-[0_10px_24px_rgba(191,75,36,0.28)]" : "bg-white text-gray-950 shadow-[0_3px_10px_rgba(15,23,42,0.15)]"
            }`}>
              <button
                type="button"
                onClick={() => setOpenQuestion(isOpen ? null : faq.question)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left sm:p-5"
              >
                <h2 className="text-base font-bold leading-snug sm:text-lg">{faq.question}</h2>
                <ChevronDown className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-white" : "text-gray-950"}`} size={22} />
              </button>
              {isOpen && <p className="px-4 pb-5 text-sm leading-relaxed text-white/75 sm:px-5">{faq.answer}</p>}
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-[#f4d49d] bg-[#fff0d7] p-5 text-[#943915] shadow-sm">
        <div className="flex items-center gap-2.5">
          <CircleAlert size={24} />
          <h2 className="text-xl font-bold">Still experiencing issues?</h2>
        </div>
        <p className="mt-3 text-sm font-medium leading-relaxed">Create a ticket and our technicians will assist you with troubleshooting and resolution.</p>
        <button
          type="button"
          onClick={() => navigate("/manage-ticket")}
          className="mt-5 w-full cursor-pointer rounded-xl bg-[#bf4b24] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#a9401e]"
        >
          Create a Ticket
        </button>
      </section>
    </div>
  );
}
