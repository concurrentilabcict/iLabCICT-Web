import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, KeyRound, Mail, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Logo from "@/assets/logo.png";
import { Spinner } from "@/components/ui/spinner";
import {
    buildApiUrl,
    createApiError,
    publicFetch,
    type ApiError,
} from "@/lib/api";

const COOLDOWN_SECONDS = 30;
const RESET_TOKEN_STORAGE_KEY = "ilabcict_password_reset_token";

type OtpStep = "email" | "verify";
type MessageResponse = { message?: string };
type VerifyOtpResponse = MessageResponse & { reset_token?: string };

const getErrorMessage = (error: ApiError, fallback: string) => {
    if (error.status === 500) {
        return "Server error. Please try again later.";
    }

    return error.message || fallback;
};

export default function ForgotPasswordForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState<OtpStep>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (secondsLeft <= 0) return;

        const interval = window.setInterval(() => {
            setSecondsLeft((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [secondsLeft]);

    const sendOtpMutation = useMutation({
        mutationFn: async () => {
            const normalizedEmail = email.trim().toLowerCase();

            if (!normalizedEmail) {
                throw new Error("Email is required.");
            }

            const response = await publicFetch(
                buildApiUrl("/api/users/forgot-password/otp/send-email/"),
                {
                    method: "POST",
                    body: JSON.stringify({ email: normalizedEmail }),
                }
            );
            const data = (await response.json().catch(() => null)) as MessageResponse | null;

            if (!response.ok) {
                throw createApiError(
                    response.status,
                    data?.message || "Failed to send the verification code."
                );
            }

            return data;
        },
        onSuccess: (data) => {
            setError(null);
            setSuccessMessage(
                data?.message || "A password reset code has been sent to your email."
            );
            setStep("verify");
            setSecondsLeft(COOLDOWN_SECONDS);
        },
        onError: (mutationError: ApiError) => {
            setSuccessMessage(null);
            setError(
                getErrorMessage(
                    mutationError,
                    "We couldn't send the verification code. Please try again."
                )
            );
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (code.length !== 6) {
                throw new Error("Enter the 6-digit verification code.");
            }

            const response = await publicFetch(
                buildApiUrl("/api/users/forgot-password/otp/verify-otp/"),
                {
                    method: "POST",
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        code,
                    }),
                }
            );
            const data = (await response.json().catch(() => null)) as VerifyOtpResponse | null;

            if (!response.ok || !data?.reset_token) {
                throw createApiError(
                    response.status,
                    data?.message || "The verification code is invalid or expired."
                );
            }

            return data.reset_token;
        },
        onSuccess: (resetToken) => {
            sessionStorage.setItem(RESET_TOKEN_STORAGE_KEY, resetToken);
            setError(null);
            navigate("/reset-password");
        },
        onError: (mutationError: ApiError) => {
            setError(
                getErrorMessage(
                    mutationError,
                    "The verification code is invalid or expired."
                )
            );
        },
    });

    const handleChangeEmail = () => {
        setStep("email");
        setCode("");
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <div className="flex w-full flex-col items-center justify-center gap-y-1 px-5">
            <img src={Logo} alt="IlabCICT logo" className="h-auto w-25" />
            <h1 className="primary-text-color text-3xl font-bold tracking-wide">IlabCICT</h1>
            <h2 className="mt-1 font-medium">
                {step === "email" ? "Forgot Your Password?" : "Verify Your Email"}
            </h2>
            <p className="max-w-sm text-center text-sm secondary-text-color">
                {step === "email"
                    ? "Enter your email to receive a one-time password."
                    : `Enter the 6-digit code sent to ${email.trim().toLowerCase()}.`}
            </p>

            {error && (
                <div className="mt-5 flex w-full max-w-sm items-center rounded-md border border-red-700/50 bg-red-100 p-4 text-sm text-red-700">
                    <span className="flex-1 text-center">{error}</span>
                    <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="cursor-pointer">
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>
            )}

            {step === "verify" && successMessage && (
                <div className="mt-5 w-full max-w-sm rounded-md border border-green-600/50 bg-green-100 p-4 text-center text-sm text-green-700">
                    {successMessage}
                </div>
            )}

            {step === "email" ? (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!sendOtpMutation.isPending) sendOtpMutation.mutate();
                    }}
                    className="mt-5 flex w-full flex-col items-center gap-5"
                >
                    <div className="relative w-full max-w-sm">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color" />
                        <input
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-4 outline-none focus:border-black!"
                        />
                    </div>
                    <button type="submit" disabled={sendOtpMutation.isPending} className="primary-button w-full max-w-sm rounded-full! disabled:opacity-50">
                        {sendOtpMutation.isPending ? <><Spinner className="size-5" />Sending code...</> : "Send Code"}
                    </button>
                </form>
            ) : (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!verifyOtpMutation.isPending) verifyOtpMutation.mutate();
                    }}
                    className="mt-5 flex w-full flex-col items-center gap-5"
                >
                    <div className="relative w-full max-w-sm">
                        <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color" />
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="6-digit verification code"
                            value={code}
                            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-4 text-center font-semibold tracking-[0.35em] outline-none focus:border-black!"
                        />
                    </div>
                    <div className="flex w-full max-w-sm items-center justify-between gap-4 text-sm">
                        <button type="button" onClick={handleChangeEmail} className="cursor-pointer font-medium secondary-text-color hover:text-black">
                            Change email
                        </button>
                        <button
                            type="button"
                            onClick={() => sendOtpMutation.mutate()}
                            disabled={secondsLeft > 0 || sendOtpMutation.isPending}
                            className="cursor-pointer font-semibold primary-text-color disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {sendOtpMutation.isPending ? "Sending..." : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend Code"}
                        </button>
                    </div>
                    <button type="submit" disabled={verifyOtpMutation.isPending || code.length !== 6} className="primary-button w-full max-w-sm rounded-full! disabled:opacity-50">
                        {verifyOtpMutation.isPending ? <><Spinner className="size-5" />Verifying...</> : "Verify Code"}
                    </button>
                </form>
            )}

            <button type="button" onClick={() => navigate("/login")} className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium secondary-text-color hover:text-black">
                <ArrowLeft size={16} />
                Back to Login
            </button>
        </div>
    );
}
