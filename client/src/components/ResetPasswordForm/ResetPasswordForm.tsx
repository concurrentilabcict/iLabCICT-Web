import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Logo from "@/assets/logo.png";
import { Spinner } from "@/components/ui/spinner";
import {
    buildApiUrl,
    createApiError,
    publicFetch,
    type ApiError,
} from "@/lib/api";
import { appToast } from "@/utils/appToast";

const RESET_TOKEN_STORAGE_KEY = "ilabcict_password_reset_token";

type ResetPasswordResponse = {
    message?: string;
};

export default function ResetPasswordForm() {
    const navigate = useNavigate();
    const [resetToken] = useState(() =>
        sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY)
    );
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            if (!resetToken) {
                throw new Error("Your password reset session is missing or expired.");
            }

            if (!password || !confirmPassword) {
                throw new Error("Enter and confirm your new password.");
            }

            if (password !== confirmPassword) {
                throw new Error("Passwords must match.");
            }

            const response = await publicFetch(
                buildApiUrl("/api/users/forgot-password/otp/reset-password/"),
                {
                    method: "POST",
                    body: JSON.stringify({
                        reset_token: resetToken,
                        new_password: password,
                    }),
                }
            );
            const data = (await response.json().catch(() => null)) as
                | ResetPasswordResponse
                | null;

            if (!response.ok) {
                throw createApiError(
                    response.status,
                    data?.message || "Failed to reset password."
                );
            }

            return data;
        },
        onSuccess: (data) => {
            sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
            setError(null);
            appToast.success(data?.message || "Password reset successfully.");
            navigate("/login", { replace: true });
        },
        onError: (mutationError: ApiError) => {
            setError(
                mutationError.status === 500
                    ? "Server error. Please try again later."
                    : mutationError.message || "We couldn't reset your password."
            );
        },
    });

    if (!resetToken) {
        return (
            <div className="flex w-full flex-col items-center justify-center gap-4 px-5 text-center">
                <img src={Logo} alt="ILabCICT logo" className="h-auto w-25" />
                <h1 className="primary-text-color text-3xl font-bold tracking-wide">ILabCICT</h1>
                <h2 className="font-semibold">Reset session unavailable</h2>
                <p className="max-w-sm text-sm secondary-text-color">
                    Request and verify a new password reset code to continue.
                </p>
                <button type="button" onClick={() => navigate("/forgot-password")} className="primary-button w-full max-w-sm rounded-full!">
                    Request New Code
                </button>
                <button type="button" onClick={() => navigate("/login")} className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium secondary-text-color hover:text-black">
                    <ArrowLeft size={16} />
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center justify-center gap-y-1 px-5">
            <img src={Logo} alt="ILabCICT logo" className="h-auto w-25" />
            <h1 className="primary-text-color text-3xl font-bold tracking-wide">ILabCICT</h1>
            <h2 className="mt-1 font-medium">Create a New Password</h2>
            <p className="max-w-sm text-center text-sm secondary-text-color">
                Choose a secure password for your account.
            </p>

            {error && (
                <div className="mt-5 flex w-full max-w-sm items-center rounded-md border border-red-700/50 bg-red-100 p-4 text-sm text-red-700">
                    <span className="flex-1 text-center">{error}</span>
                    <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="cursor-pointer">
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!resetPasswordMutation.isPending) resetPasswordMutation.mutate();
                }}
                className="mt-5 flex w-full flex-col items-center gap-5"
            >
                <div className="relative w-full max-w-sm">
                    <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-11 outline-none focus:border-black!"
                    />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer secondary-text-color">
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>

                <div className="relative w-full max-w-sm">
                    <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-11 outline-none focus:border-black!"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer secondary-text-color">
                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>

                <button type="submit" disabled={resetPasswordMutation.isPending} className="primary-button w-full max-w-sm rounded-full! disabled:opacity-50">
                    {resetPasswordMutation.isPending ? <><Spinner className="size-5" />Resetting password...</> : "Reset Password"}
                </button>
            </form>
        </div>
    );
}
