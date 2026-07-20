import "@/styles/system.css"
import ForgotPasswordForm from "@/components/ForgotPasswordForm/ForgotPasswordForm";
import { useEffect } from "react";

export default function ForgotPasswordPage() {

    useEffect(()=>{
        document.title = "IlabCICT | Forgot Password";
    },[]);

    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <ForgotPasswordForm />
            </div>
        </>
    );
}