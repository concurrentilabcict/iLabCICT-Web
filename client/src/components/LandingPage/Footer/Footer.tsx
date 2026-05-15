import Logo from "@/assets/logo.png"

export default function Footer() {
    return(
        <>
            <footer className="w-full flex flex-col items-center gap-y-3
            md:flex-row md:justify-between px-3 lg:px-5 py-5">
                <span>ILABCICT</span>
                <span>BUILT BY TEAM CONCURRENT</span>
            </footer>
        </>
    );
}