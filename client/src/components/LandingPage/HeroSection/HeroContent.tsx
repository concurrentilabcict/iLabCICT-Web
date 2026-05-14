import HeroButtons from "./HeroButtons";

export default function HeroContent() {
    return (
        <>
            <div className="flex flex-col items-center justify-center lg:items-start gap-y-3
                            pt-[clamp(0px,calc(80*((100vw-1024px)/896)),80px)]">
                <div className="text-center lg:text-left text-hero-content">
                    <h1 className="">Smarter Laboratories.</h1>
                    <h1 className="text-[#bf3419]">Stronger Results.</h1>
                </div>

                <div className="text-center lg:text-left text-secondary max-w-[467px] lg:max-w-none">
                    <p>iLabCICT centralizes maintenance, technical support,<br className="hidden lg:block" />
                        and laboratory operations for Bulacan State University's CICT-<br className="hidden lg:block" />
                        built for efficiency, reliability, and control.</p>
                </div>

                <HeroButtons />
            </div>
        </>
    );
}