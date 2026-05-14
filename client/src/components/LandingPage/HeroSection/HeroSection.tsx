import HeroVisual from "@/assets/hero-section.png"
import HeroContent from "./HeroContent";

export default function HeroSection() {
    return(
        <>
            <div className="flex flex-col gap-y-10">
                <div>
                    <HeroContent />
                </div>
                
                <div className="px-3">
                    <img src={HeroVisual} alt="Hero Section Visual" className="w-full" />
                </div>
            </div>
        </>
    );
}