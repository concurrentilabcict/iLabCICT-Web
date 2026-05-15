import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type EveryRoleProps = {
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

gsap.registerPlugin(ScrollTrigger);

export default function EveryRole({ setIsDarkMode }: EveryRoleProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.to("body", {
            backgroundColor: "#000000",
            color: "#ffffff",

            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top center",
                markers: true,
                toggleActions: "play reverse play reverse",
                onEnter: () => {
                    setIsDarkMode(true);
                },

                onLeaveBack: () => {
                    setIsDarkMode(false);
                }
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return (
        <div ref={sectionRef}
            className="flex items-center justify-center min-h-screen">
            <h1 className="font-secondary text-center text-[100px]">LABORATORY <br />OPERATIONS SHOULD <br /> FEEL SEAMLESS, FAST AND INTELLIGENT.</h1>
        </div>
    );
}