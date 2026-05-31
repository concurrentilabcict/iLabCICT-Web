import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function AccountSecurity() {

    const isMobile = useMediaQuery("(max-width: 767px)");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const changePasswordMutation = useMutation({
        mutationFn: async () => {

        }
    });

    const handleCancelPasswordChange = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={isChangingPassword ? "primary-input w-full max-w-full!" : "disable-input w-full"}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between gap-y-4 sm:gap-x-2">
                                <div className="flex flex-col gap-y-1 w-full sm:w-1/2">
                                    <span className="font-medium text-sm">New Password</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        disabled={!isChangingPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={isChangingPassword ? "primary-input w-full" : "disable-input w-full"}
                                    />
                                </div>

                                <div className="flex flex-col gap-y-1 w-full sm:w-1/2">
                                    <span className="font-medium text-sm">Confirm Password</span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        disabled={!isChangingPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={isChangingPassword ? "primary-input w-full" : "disable-input w-full"}
                                    />
                                </div>
                            </div>

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
                                        <button
                                            type="button"
                                            className="primary-button text-sm cursor-pointer font-medium"
                                        >
                                            Save Password
                                        </button>
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
