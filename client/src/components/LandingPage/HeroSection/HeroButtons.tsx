import { ArrowRight, CirclePlay } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroButtons() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#bf3419] px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(191,52,25,0.24)] transition hover:bg-[#a82d15]"
            >
                Access System
                <ArrowRight size={16} />
            </button>

            <a
                href="#workflow"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-bold text-zinc-800 shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition hover:border-zinc-300 hover:bg-zinc-50"
            >
                <CirclePlay size={16} />
                See Workflow
            </a>
        </div>
    );
}
