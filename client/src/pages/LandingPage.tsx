import { useEffect, useState } from "react";
import NavBar from "../components/LandingPage/NavBar/NavBar";
import HeroSection from "@/components/LandingPage/HeroSection/HeroSection";
import GenerateReports from "@/components/LandingPage/GenerateReports/GenerateReports"
import HowItWorks from "@/components/LandingPage/HowItWorks/HowItWorks"
import ResolveEfficiently from "@/components/LandingPage/ResolveEfficiently/ResolveEfficiently"
import SubmitRequest from "@/components/LandingPage/SubmitRequest/SubmitRequest"
import TrackAndManage from "@/components/LandingPage/TrackAndManage/TrackAndManage"
import EveryRole from "@/components/LandingPage/EveryRole/EveryRole";

export default function LandingPage() {

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        document.title = "IlabCICT";
    }, []);

    return (
        <>
            <div className="flex flex-col">
                <NavBar />
                <div className="mb-30">
                    <HeroSection />
                </div>

                <HowItWorks />
                <SubmitRequest />
                <TrackAndManage />
                <ResolveEfficiently />
                <GenerateReports isDarkMode={isDarkMode} />
                <EveryRole setIsDarkMode={setIsDarkMode} />
                <ResolveEfficiently />
            </div>
        </>
    );
}