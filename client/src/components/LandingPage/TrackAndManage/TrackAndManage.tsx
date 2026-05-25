import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Demo from "@/assets/videos/demo.mp4";

gsap.registerPlugin(ScrollTrigger);

type TrackAndManageProps = {
  isDarkMode: boolean;
};

export default function TrackAndManage({
  isDarkMode,
}: TrackAndManageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      {
        opacity: 0,
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 100%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <div className="mt-5 lg:mt-5 flex flex-col px-3 lg:px-5">
      <div className="flex items-start gap-x-3">
        <h3 className="mt-[clamp(6px,calc(-8.64px+4.07vw),33px)] lg:text-xl">
          02
        </h3>

        <h1
          ref={titleRef}
          className="text-[clamp(30px,calc(30px+70*((100vw-360px)/663)),100px)]
          font-secondary font-extralight"
        >
          TRACK & MANAGE
        </h1>
      </div>

      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full mb-7"
      >
        <source src={Demo} type="video/mp4" />
      </video>

      <p className="text-base lg:text-xl mb-7">
        TECHNICIANS RECEIVE, PRIORITIZE, AND MANAGE TASKS IN REAL-TIME.
      </p>

      <div
        className={`h-px w-full ${
          isDarkMode ? "bg-white" : "bg-black"
        }`}
      />
    </div>
  );
}