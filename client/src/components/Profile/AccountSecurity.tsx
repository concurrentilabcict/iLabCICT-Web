import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { createApiError, privateFetch, type ApiError } from "@/lib/api";
import SavePasswordDialog from "./SavePasswordDialog";
import toast from "react-hot-toast";

export default function AccountSecurity() {

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isMatch, setIsMatch] = useState(true);
    const [passwordError, setPasswordError] = useState("");

    const userId = localStorage.getItem("id");
    const hasEmptyPasswordField = Boolean(passwordError) && (!currentPassword || !newPassword || !confirmPassword);
    const currentPasswordInputClass = isChangingPassword
        ? `primary-input w-full max-w-full! ${hasEmptyPasswordField && !currentPassword ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input w-full";
    const newPasswordInputClass = isChangingPassword
        ? `primary-input w-full ${(!isMatch || (hasEmptyPasswordField && !newPassword)) ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input w-full";
    const confirmPasswordInputClass = isChangingPassword
        ? `primary-input w-full ${(!isMatch || (hasEmptyPasswordField && !confirmPassword)) ? "border-red-600! focus:border-red-600!" : ""}`
        : "disable-input w-full";

    const validatePasswordChange = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill out all password fields.");
            setIsMatch(true);
            return false;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirm password do not match.");
            setIsMatch(false);
            return false;
        }

        setIsMatch(true);
        setPasswordError("");
        return true;
    };

    const handleSubmit = () => {
        if (!validatePasswordChange()) {
            return;
        }

        changePasswordMutation.mutate();
    }

    const changePasswordMutation = useMutation({
        mutationFn: async () => {
            const res = await privateFetch(`https://ilabcict-backend.onrender.com/api/users/reset-password/${userId}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    old_password: currentPassword,
                    password: newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(res.status,
                    data.message || "Failed to change the password");
            }
        },

        onSuccess: () => {
            toast.success("Password updated successfully.");
        },

        onError: (error: ApiError) => {
            if (error.status === 400) {
                toast.error("Incorrect current password.");
                return;
            }

            if (error.status === 500) {
                toast.error("Server error. Please try again later.");
                return;
            }

            toast.error("Failed to change the password.");
        }
    });

    const handleCancelPasswordChange = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsMatch(true);
        setPasswordError("");
        setIsChangingPassword(false);
    };

    return (
        <>
            <div className={`flex flex-col gap-y-5 ${isMobile ? "" : "px-3"}`}>
                <h1 className={`text-lg mt-2 font-semibold ${isMobile ? "px-3" : ""}`}>Account Security</h1>
                <div className="h-px w-full bg-[#e5e5e5]" />

                <div className={`flex flex-col mb-5 ${isMobile ? "px-3" : ""}`}>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4">

                            <div className="flex flex-col gap-y-1 w-full">
                                <span className="font-medium text-sm">Current Password</span>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    disabled={!isChangingPassword}
                                    onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError("") }}
                                    className={currentPasswordInputClass}
                                    aria-invalid={hasEmptyPasswordField && !currentPassword ? true : undefined}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between gap-y-4 sm:gap-x-2">
                                <div className="flex flex-col gap-y-1 w-full sm:w-1/2">
                                    <span className="font-medium text-sm">New Password</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        disabled={!isChangingPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setIsMatch(true); setPasswordError("") }}
                                        className={newPasswordInputClass}
                                        aria-invalid={!isMatch || (hasEmptyPasswordField && !newPassword)}
                                    />
                                </div>

                                <div className="flex flex-col gap-y-1 w-full sm:w-1/2">
                                    <span className="font-medium text-sm">Confirm Password</span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        disabled={!isChangingPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setIsMatch(true); setPasswordError("") }}
                                        className={confirmPasswordInputClass}
                                        aria-invalid={!isMatch || (hasEmptyPasswordField && !confirmPassword)}
                                    />
                                </div>
                            </div>

                            {passwordError && (
                                <p className="text-sm text-red-600">
                                    {passwordError}
                                </p>
                            )}

                            <div className="flex justify-end gap-x-2">
                                {isChangingPassword ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCancelPasswordChange}
                                            className="secondary-button cursor-pointer text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <SavePasswordDialog
                                            onSave={handleSubmit}
                                            onBeforeOpen={validatePasswordChange}
                                            isPending={changePasswordMutation.isPending}
                                        />
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsChangingPassword(true)}
                                        className="secondary-button hover:secondary-button-hover mt-1.5 text-sm cursor-pointer w-fit sm:self-auto font-medium mb-1"
                                    >
                                        Change Password
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block h-px w-full bg-[#e5e5e5]" />
            </div>
        </>
    );
}
