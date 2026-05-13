import { useEffect } from "react";


export default function LandingPage() {

    useEffect(() => {
        document.title = "IlabCICT";
    }, []);

    return(
        <>
            <div className="flex items-center justify-center min-h-screen">
                <h1>Landing Page</h1>
            </div>
        </>
    );
}