import ResetPasswordForm from "@/components/ResetPasswordForm/ResetPasswordForm";
import { useEffect } from "react";

export default function ResetPasswordPage() {

    useEffect(()=>{
        document.title = "ILabCICT | Reset Password";
    },[]);

    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <ResetPasswordForm />
            </div>
        </>
    );
}
