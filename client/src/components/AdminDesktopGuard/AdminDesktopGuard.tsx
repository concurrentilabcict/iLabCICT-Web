import type { ReactNode } from "react";
import { LogIn, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type AdminDesktopGuardProps = {
    children: ReactNode;
};

export default function AdminDesktopGuard({ children }: AdminDesktopGuardProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleBackToLogin = () => {
        logout();
        navigate("/login", { replace: true });
    };

    if (isDesktop) {
        return children;
    }

    return (
        <main className="flex min-h-dvh w-full items-center justify-center bg-[#f8fafc] px-6 py-10">
            <div className="flex max-w-md flex-col items-center text-center">
                <div className="primary-bg-color mb-5 flex size-12 items-center justify-center rounded-lg text-white shadow-sm shadow-[#bf3419]/25">
                    <Monitor size={24} aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-semibold text-zinc-950">
                    Admin Portal is available on desktop only.
                </h1>
                <p className="mt-3 text-base leading-7 text-zinc-600">
                    Please use a desktop or larger screen to continue.
                </p>
                <Button
                    type="button"
                    onClick={handleBackToLogin}
                    className="primary-bg-color mt-7 gap-2 px-5 text-white hover:bg-[#a82d16]"
                >
                    <LogIn size={18} aria-hidden="true" />
                    Back to Login
                </Button>
            </div>
        </main>
    );
}
