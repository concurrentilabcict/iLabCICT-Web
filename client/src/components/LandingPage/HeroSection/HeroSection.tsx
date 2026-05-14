import HeroVisual from "@/assets/hero-section.png"
import HeroContent from "./HeroContent";

export default function HeroSection() {
    return(
        <>
            <div className="flex flex-col gap-y-10">
                <div className="px-3">
                    <HeroContent />
                </div>
                
                <div className="flex justify-center px-3">
                    <img src={HeroVisual} alt="Hero Section Visual" 
                    className="w-[clamp(336px,calc(104.412vw-39.882px),762px)]" />
                </div>
            </div>
        </>
    );
}