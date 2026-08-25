import { useEffect, useState } from "react";
import Logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NavBar() {
    const [showNav, setShowNav] = useState(true);
    const navigate = useNavigate();
    const navLinks = [
        {
            label: "Home",
            href: "#home",
        },
        {
            label: "Workflow",
            href: "#workflow",
        },
        {
            label: "Roles",
            href: "#roles",
        },
    ];

    const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        event.preventDefault();

        const target = document.querySelector<HTMLElement>(href);

        if (!target) {
            return;
        }

        window.history.pushState(null, "", href);
        window.landingLenis?.scrollTo(target, {
            offset: href === "#home" ? 0 : -96,
            duration: 1.45,
            easing: (time: number) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
        });

        if (!window.landingLenis) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                setShowNav(false);
            } else {
                setShowNav(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className={`
                fixed left-0 top-0 z-50 w-full px-4 py-4
                transition-transform duration-500 ease-in-out sm:px-6 lg:px-15
                ${showNav ? "translate-y-0" : "-translate-y-full"}
            `}
        >
            <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between rounded-full border border-zinc-200/80 bg-white/88 px-3 shadow-[0_14px_44px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:px-5">
                <a href="#home" onClick={(event) => handleNavClick(event, "#home")} className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#bf3419]/8">
                        <img src={Logo} alt="iLabCICT Logo" className="h-8 w-auto" />
                    </span>
                    <span className="hidden leading-tight sm:block">
                        <span className="block text-sm font-black text-zinc-950">iLabCICT</span>
                        <span className="block text-xs font-semibold text-zinc-500">Laboratory Operations</span>
                    </span>
                </a>

                <nav className="hidden items-center gap-1 rounded-full bg-zinc-100/80 p-1 lg:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={(event) => handleNavClick(event, link.href)}
                            className="rounded-full px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white hover:text-zinc-950 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#bf3419] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(191,52,25,0.22)] transition hover:bg-[#a82d15] sm:px-5"
                >
                    Login
                    <ArrowRight size={15} />
                </button>
            </div>
        </div>
    );
}
