import { useEffect } from "react";
import NavBar from "../components/LandingPage/NavBar/NavBar";
import HeroSection from "@/components/LandingPage/HeroSection/HeroSection";

export default function LandingPage() {

    useEffect(() => {
        document.title = "IlabCICT";
    }, []);

    return(
        <>
            <div className="flex flex-col">
                <NavBar />
                <HeroSection />
            </div>
        </>
    );
}