import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function EveryRole() {
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
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return (
        <div ref={sectionRef}
            className="flex items-center justify-center min-h-screen">

        </div>
    );
}