import HeroVisual from "@/assets/hero-section.png"
import HeroContent from "./HeroContent";

export default function HeroSection() {
    return(
        <>
            <div className="flex flex-col lg:flex-row lg:justify-center gap-y-10
            px-3 lg:px-15 lg:gap-x-[clamp(0px,calc(60*((100vw-1024px)/896)),60px)]">
                <div>
                    <HeroContent />
                </div>
                
                <div className="flex justify-center">
                    <img src={HeroVisual} alt="Hero Section Visual" 
                    className="w-[clamp(336px,calc(104.412vw-39.882px),762px)]
                               lg:w-[clamp(380px,calc(380px+420*((100vw-1024px)/896)),800px)] h-auto" />
                </div>
            </div>
        </>
    );
}