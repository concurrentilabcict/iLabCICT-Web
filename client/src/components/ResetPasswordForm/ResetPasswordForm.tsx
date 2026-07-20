import Logo from '@/assets/logo.png';
import { User, LockKeyhole, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createApiError, publicFetch, type ApiError } from '@/lib/api';
import { useAuth } from '@/auth/useAuth';
import { useMutation } from '@tanstack/react-query';
import { Spinner } from "@/components/ui/spinner"


export default function ResetPasswordForm(){

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const handleClick = () => {
        if (!resetPasswordMutation.isPending) {
            resetPasswordMutation.mutate();
        }
    };

    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            if (!confirmPassword || !password) {
                throw new Error("Username and password are required.");
            }else if(confirmPassword !== password){
                throw new Error("Passwords must match.");
            }

            const res = await publicFetch("https://ilabcict-backend.onrender.com/api/users/forgot-password/reset-password/", {
                method: "POST",
                body: JSON.stringify({ 
                    token: token || null,
                    password: password,
                    confirm_password: confirmPassword
                }),
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw createApiError(
                    res.status,
                    data.message || "Failed to reset password."
                );
            }

            return data;
        },
        onSuccess: () => {
            setError(null);
            navigate("/login");
        },
        onError: (error: ApiError) => {
            if (error.status === 500) {
                setError("Server error. Please try again later.");
                return;
            }
        }
    });

    return(
        <>
            <div className="flex flex-col items-center justify-center gap-y-1 px-5 w-full">
                <img src={Logo} alt="Logo" className="w-25 h-auto" />
                <h1 className='primary-text-color text-3xl tracking-wide font-bold'>IlabCICT</h1>
                <span>Create a new password for your account.</span>

                {error &&
                    <div className="flex items-center justify-center text-sm bg-red-100 text-red-700
                    border border-red-700/50 rounded-md w-full max-w-sm p-5 mt-5">
                        <span className='ml-auto'>{error}</span>
                        <button onClick={() => setError(null)} className='ml-auto cursor-pointer'>
                            <X size={18} strokeWidth={3} />
                        </button>
                    </div>}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleClick();
                    }}
                    className={`flex flex-col items-center w-full gap-y-5 ${error ? "mt-5" : "mt-5"}`}
                >
                    <div className="relative w-full max-w-sm">
                        <LockKeyhole
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-4 outline-none focus:border-black!"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 secondary-text-color cursor-pointer"
                        >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    <div className="relative w-full max-w-sm">
                        <LockKeyhole
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />

                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-4 outline-none focus:border-black!"
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 secondary-text-color cursor-pointer"
                        >
                            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    <button className=' primary-button rounded-full! w-full max-w-sm'
                        type="submit"
                        disabled={resetPasswordMutation.isPending}>

                        {resetPasswordMutation.isPending ? <><Spinner className='size-5' />Resetting password... </>
                            : <>Reset Password</>}
                    </button>
                </form>
            </div>
        </>
    );

}