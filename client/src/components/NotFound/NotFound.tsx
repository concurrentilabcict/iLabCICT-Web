import { useEffect } from "react";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

import Logo from "@/assets/logo.png";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";

const getReturnDestination = (
    isAuthenticated: boolean,
    role: string
) => {
    if (!isAuthenticated) {
        return { path: "/", label: "Return to Home" };
    }

    if (role === "admin") {
        return { path: "/dashboard", label: "Return to Dashboard" };
    }

    return { path: "/manage-ticket", label: "Return to Tickets" };
};

export default function NotFound() {
    const { isAuthenticated, role } = useAuth();
    const destination = getReturnDestination(isAuthenticated, role);

    useEffect(() => {
        document.title = "Page Not Found | iLabCICT";
    }, []);

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#f6f7f9] px-4 py-10 sm:px-6">
            <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-[0_22px_65px_rgba(15,23,42,0.10)] sm:p-10">
                <div className="flex items-center justify-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#bf3419]/8">
                        <img src={Logo} alt="" className="h-8 w-auto" />
                    </div>
                    <div className="text-left leading-tight">
                        <p className="text-sm font-black text-zinc-950">iLabCICT</p>
                        <p className="text-xs font-semibold text-zinc-500">
                            Laboratory Operations
                        </p>
                    </div>
                </div>

                <div className="mx-auto mt-8 flex size-14 items-center justify-center rounded-lg bg-[#bf3419]/8 text-[#bf3419]">
                    <FileQuestion size={28} aria-hidden="true" />
                </div>

                <p className="mt-5 text-sm font-bold uppercase text-[#bf3419]">
                    Error 404
                </p>
                <h1 className="mt-2 text-3xl font-bold text-zinc-950 sm:text-4xl">
                    Page Not Found
                </h1>
                <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-zinc-600 sm:text-base sm:leading-7">
                    The page may no longer exist, or the URL may be incorrect.
                </p>

                <Button asChild size="lg" className="mt-7 h-11 px-5">
                    <Link to={destination.path}>
                        <ArrowLeft aria-hidden="true" />
                        {destination.label}
                    </Link>
                </Button>
            </section>
        </main>
    );
}
