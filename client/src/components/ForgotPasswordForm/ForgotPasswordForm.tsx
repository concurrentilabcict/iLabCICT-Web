import { useState, useEffect } from "react";
import Logo from "@/assets/logo.png";
import { Mail, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import { createApiError, publicFetch, type ApiError } from "@/lib/api";

const COOLDOWN_SECONDS = 30;

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (secondsLeft <= 0) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft]);

    

    const forgotPasswordMutation = useMutation({
        mutationFn: async () => {
            if (!email.trim()) {
                throw new Error("Email is required.");
            }

            const res = await publicFetch(
                "https://ilabcict-backend.onrender.com/api/users/forgot-password/send-email/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(
                    res.status,
                    data.message || "Failed to send email."
                );
            }

            return data;
        },

        onSuccess: () => {
            setError(null);
            setSecondsLeft(COOLDOWN_SECONDS);
        },

        onError: (error: ApiError) => {
            if (error.status === 500) {
                setError("Server error. Please try again later.");
                return;
            }

            setError("Incorrect Email.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (forgotPasswordMutation.isPending || secondsLeft > 0) return;

        forgotPasswordMutation.mutate();
    };

    const handleResend = () => {
        if (forgotPasswordMutation.isPending || secondsLeft > 0) return;

        forgotPasswordMutation.mutate();
    };

    const isPending = forgotPasswordMutation.isPending;
    const isSuccess = forgotPasswordMutation.isSuccess;
    const isCooldown = secondsLeft > 0;

    return (
        <div className="flex flex-col items-center justify-center gap-y-1 px-5 w-full">
            <img src={Logo} alt="Logo" className="w-25 h-auto" />

            <h1 className="primary-text-color text-3xl tracking-wide font-bold">
                IlabCICT
            </h1>

            <span>Forgot Your Password?</span>
            <span className="text-xs">
                Click the button below to receive a link.
            </span>

            {error && (
                <div
                    className="flex items-center justify-center text-sm bg-red-100 text-red-700
                    border border-red-700/50 rounded-md w-full max-w-sm p-5 mt-5"
                >
                    <span className="ml-auto">{error}</span>

                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="ml-auto cursor-pointer"
                    >
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>
            )}

            {isSuccess && (
                <div
                    className="w-full max-w-sm rounded-md border border-green-600/50
                    bg-green-100 text-green-700 p-4 mt-5 text-sm text-center"
                >
                    Password reset link sent successfully.
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center w-full gap-y-5 mt-5"
            >
                <div className="relative w-full max-w-sm">
                    <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-4 outline-none focus:border-black!"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={isCooldown || isPending}
                    className="w-full text-end primary-text-color font-semibold mb-5 cursor-pointer max-w-sm disabled:opacity-50"
                >
                    {isPending ? (
                        <span className="flex justify-end items-center gap-2">
                            <Spinner className="size-5" />
                            Sending...
                        </span>
                    ) : isCooldown ? (
                        `Retry in ${secondsLeft}s`
                    ) : (
                        "Resend Link"
                    )}
                </button>

                <button
                    type="submit"
                    disabled={isPending || isCooldown}
                    className="primary-button rounded-full! w-full max-w-sm disabled:opacity-50"
                >
                    {isPending ? (
                        <span className="flex justify-center items-center gap-2">
                            <Spinner className="size-5" />
                            Sending...
                        </span>
                    ) : (
                        "Send Link"
                    )}
                </button>
            </form>
        </div>
    );
}