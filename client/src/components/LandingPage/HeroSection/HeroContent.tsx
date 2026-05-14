import HeroButtons from "./HeroButtons";

export default function HeroContent() {
    return (
        <>
            <div className="flex flex-col items-center gap-y-3">
                <div className="text-center text-hero-content">
                    <h1 className="">Smarter Laboratories.</h1>
                    <h1 className="text-[#bf3419]">Stronger Results.</h1>
                </div>

                <div className="text-center text-secondary">
                    <p>iLabCICT centralizes maintenance, technical support, and laboratory operations for Bulacan State University's CICT-built for efficiency, reliability, and control.</p>
                </div>

                <HeroButtons />
            </div>
        </>
    );
}