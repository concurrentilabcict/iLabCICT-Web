import "@/styles/landing.css"

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import NavBar from "../components/LandingPage/NavBar/NavBar";
import HeroSection from "@/components/LandingPage/HeroSection/HeroSection";
import GenerateReports from "@/components/LandingPage/GenerateReports/GenerateReports";
import HowItWorks from "@/components/LandingPage/HowItWorks/HowItWorks";
import ResolveEfficiently from "@/components/LandingPage/ResolveEfficiently/ResolveEfficiently";
import SubmitRequest from "@/components/LandingPage/SubmitRequest/SubmitRequest";
import TrackAndManage from "@/components/LandingPage/TrackAndManage/TrackAndManage";
import EveryRole from "@/components/LandingPage/EveryRole/EveryRole";
import Footer from "@/components/LandingPage/Footer/Footer";

export default function LandingPage() {
    const [showTransition, setShowTransition] = useState(true);

    useEffect(() => {
        document.title = "IlabCICT";

        const timer = setTimeout(() => {
            setShowTransition(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence>
                {showTransition && (
                    <motion.div
                        initial={{
                            opacity: 1,
                            scale: 1,
                            transformOrigin: "bottom right",
                        }}
                        animate={{
                            opacity: 0,
                            scale: 2.5,
                            filter: "blur(5px)",
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.75,
                            ease: [0.76, 0, 0.24, 1],
                        }}
                        className="fixed inset-0 bg-white z-[100] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <main className="flex flex-col bg-white text-black">
                <NavBar />

                <div className="pt-20">
                    <HeroSection />
                </div>

                <HowItWorks />

                <SubmitRequest />

                <TrackAndManage />

                <ResolveEfficiently />

                <GenerateReports />

                <EveryRole />

                <Footer />
            </main>
        </>
    );
}
