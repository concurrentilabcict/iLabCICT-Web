import { useEffect } from "react";
import {
    ArrowLeft,
    ArrowRight,
    MonitorOff,
    Unplug,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Page Not Found | iLabCICT";
    }, []);

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate(destination.path);
    };

    return (
        <main className="relative min-h-dvh overflow-hidden bg-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] border-r border-zinc-200 bg-[#fff8f5] lg:block"
            />

            <div className="relative mx-auto flex min-h-dvh w-full max-w-[1180px] flex-col px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
                <header className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
                        <img src={Logo} alt="" className="h-8 w-auto" />
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-black text-zinc-950">iLabCICT</p>
                        <p className="text-xs font-semibold text-zinc-500">
                            Laboratory Operations
                        </p>
                    </div>
                </header>

                <section className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-2 lg:gap-20 lg:py-12">
                    <div className="-mx-5 border-y border-[#bf3419]/10 bg-[#fff8f5] px-5 py-12 sm:-mx-8 sm:px-8 lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:pr-10">
                        <div className="mx-auto w-fit lg:mx-0">
                            <div
                                aria-label="404"
                                className="relative text-8xl font-black leading-none text-[#bf3419] sm:text-9xl"
                            >
                                <span aria-hidden="true">404</span>
                                <MonitorOff
                                    size={26}
                                    strokeWidth={2.25}
                                    aria-hidden="true"
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%] text-[#bf3419] sm:size-8"
                                />
                            </div>

                            <div className="mt-7 flex items-center gap-3" aria-hidden="true">
                                <span className="h-px w-16 bg-zinc-300 sm:w-24" />
                                <span className="flex size-10 items-center justify-center rounded-lg border border-[#bf3419]/20 bg-white text-[#bf3419] shadow-sm">
                                    <Unplug size={18} />
                                </span>
                                <span className="h-px w-16 border-t border-dashed border-zinc-300 sm:w-24" />
                            </div>

                            <p className="mt-4 text-center text-xs font-bold uppercase text-zinc-500">
                                Requested route unavailable
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-lg text-center lg:mx-0 lg:text-left">
                        <p className="text-sm font-bold uppercase text-[#bf3419]">
                            Navigation error
                        </p>
                        <h1 className="mt-3 text-4xl font-black leading-tight text-zinc-950 sm:text-5xl">
                            Page Not Found
                        </h1>
                        <p className="mt-4 text-base font-medium leading-7 text-zinc-600 sm:text-lg">
                            The page you're looking for doesn't exist or may have been moved.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                            <Button asChild size="lg" className="h-11 px-5">
                                <Link to={destination.path}>
                                    {destination.label}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={handleGoBack}
                                className="h-11 px-5"
                            >
                                <ArrowLeft aria-hidden="true" />
                                Go Back
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
