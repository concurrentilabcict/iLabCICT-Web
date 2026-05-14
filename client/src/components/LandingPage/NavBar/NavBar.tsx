import Logo from "@/assets/logo.png"

export default function NavBar() {
    return(
        <>
            <div className="flex items-center justify-between py-5 px-5 lg:px-15">
                <button className="button-navbar group">
                    <div className="flex flex-col items-center transition-transform
                     duration-400 group-hover:-translate-y-1/2">
                        <span className="flex items-center h-[40px]">CONTACT</span>
                        <span className="font-secondary flex items-center h-[40px]">CONTACT</span>
                    </div>
                </button>

            <img src={Logo} alt="ILabCICT Logo" className="w-13 pr-3 h-auto" />

            <button className="button-navbar group">
                    <div className="flex flex-col items-center transition-transform
                     duration-400 group-hover:-translate-y-1/2">
                        <span className="flex items-center h-[40px]">LOGIN</span>
                        <span className="font-secondary flex items-center h-[40px]">LOGIN</span>
                    </div>
                </button>
                
            </div>
        </>
    );
}