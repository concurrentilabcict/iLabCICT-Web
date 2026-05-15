import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type EveryRoleProps = {
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

gsap.registerPlugin(ScrollTrigger);

export default function EveryRole({
    setIsDarkMode,
}: EveryRoleProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const trigger = ScrollTrigger.create({
            trigger: sectionRef.current,

            start: "top 70%",
            end: "bottom 30%",

            markers: true,

            invalidateOnRefresh: true,

            onEnter: () => {
                setIsDarkMode(true);
            },

            onEnterBack: () => {
                setIsDarkMode(true);
            },

            onLeave: () => {
                setIsDarkMode(false);
            },

            onLeaveBack: () => {
                setIsDarkMode(false);
            },
        });

        ScrollTrigger.refresh();

        return () => {
            trigger.kill();
        };
    }, [setIsDarkMode]);

    return (
        <div
            ref={sectionRef}
            className="relative flex items-center justify-center py-20"
        >
            <h1
                className="font-secondary font-light text-center text-[clamp(40px,12.82px+7.55vw,90px)]
                lg:text-[clamp(75px,calc(75px+(140-75)*((100vw-1024px)/(1920-1024))),140px)]"
            >
                LABORATORY <br />
                OPERATIONS <br className="lg:hidden" />
                SHOULD <br />
                FEEL{" "}
                <span className="relative inline-block">
                    <span className="relative z-10">
                        SEAMLESS
                    </span>

                    <svg
                        className="absolute left-1/2 top-1/2 w-[115%] h-[160%] -translate-x-1/2 -translate-y-1/2"
                        viewBox="0 0 100 40"
                        preserveAspectRatio="none"
                    >
                        <ellipse
                            cx="50"
                            cy="20"
                            rx="44"
                            ry="13"
                            fill="none"
                            stroke="white"
                            strokeWidth="0.2"
                        />
                    </svg>
                </span>
                , <br className="lg:hidden" />
                <span className="font-primary font-semibold text-[#bf3419]">
                    FAST
                </span>{" "}
                AND <br />
                <span className="font-primary font-semibold text-[#f4aa29]">
                    INTELLIGENT
                </span>
            </h1>
        </div>
    );
}