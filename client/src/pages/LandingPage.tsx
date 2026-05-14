import { useEffect } from "react";
import NavBar from "../components/LandingPage/NavBar/NavBar";

export default function LandingPage() {

    useEffect(() => {
        document.title = "IlabCICT";
    }, []);

    return(
        <>
            <div className="flex flex-col">
                <NavBar />
            </div>
        </>
    );
}