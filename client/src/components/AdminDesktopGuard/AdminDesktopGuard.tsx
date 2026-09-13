import type { ReactNode } from "react";
import { Monitor } from "lucide-react";

import { useMediaQuery } from "@/hooks/useMediaQuery";

type AdminDesktopGuardProps = {
    children: ReactNode;
};

export default function AdminDesktopGuard({ children }: AdminDesktopGuardProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    if (isDesktop) {
        return children;
    }

    return (
        <main className="flex min-h-dvh w-full items-center justify-center bg-[#f8fafc] px-6 py-10">
            <div className="flex max-w-md flex-col items-center text-center">
                <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Monitor size={24} aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-semibold text-zinc-950">
                    Admin Portal is available on desktop only.
                </h1>
                <p className="mt-3 text-base leading-7 text-zinc-600">
                    Please use a desktop or larger screen to continue.
                </p>
            </div>
        </main>
    );
}
