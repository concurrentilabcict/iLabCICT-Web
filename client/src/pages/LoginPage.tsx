import LoginForm from "@/components/LoginForm/LoginForm";
import "@/styles/system.css"

export default function LoginPage() {
    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <LoginForm />
            </div>
        </>
    );
}