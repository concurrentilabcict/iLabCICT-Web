import LoginForm from "@/components/LoginForm/LoginForm";
import "@/styles/system.css"
import { useEffect } from "react";
export default function LoginPage() {

    useEffect(()=>{
        document.title = "IlabCICT | Login";
    },[]);

    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <LoginForm />
            </div>
        </>
    );
}