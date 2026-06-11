import Logo from '@/assets/logo.png';
import { User, LockKeyhole, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiError, publicFetch, type ApiError } from '@/lib/api';
import { useAuth } from '@/auth/useAuth';
import { useMutation } from '@tanstack/react-query';
import { Spinner } from "@/components/ui/spinner"

export default function LoginForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const { login } = useAuth();

    const loginMutation = useMutation({
        mutationFn: async () => {

            if (!email || !password) {
                throw new Error("Username and password are required.");

            }

            const res = await publicFetch("https://ilabcict-backend.onrender.com/api/auth/login/", {
                method: "POST",
                body: JSON.stringify({ username: email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw createApiError(
                    res.status,
                    data.message || "Failed to sign in."
                );
            }

            return data;
        },

        onSuccess: (data) => {
            const name = data.first_name + " " + data.last_name;

            login({
                id: data.id, accessToken: data.access, refreshToken: data.refresh,
                name: name, role: data.role, profilePicture: data.profile_image,
            });

            navigate("/manage-ticket");
        },

        onError: (error: ApiError) => {
            if (error.status === 500) {
                setError("Server error. Please try again later.");
                return;
            }

            setError("Incorrect username or password.");
        }
    });


    return (
        <>
            <div className="flex flex-col items-center justify-center gap-y-1 px-5 w-full">
                <img src={Logo} alt="Logo" className="w-25 h-auto" />
                <h1 className='primary-text-color text-3xl tracking-wide font-bold'>IlabCICT</h1>
                <span>Welcome back, sign in to continue.</span>

                {error &&
                    <div className="flex items-center justify-center text-sm bg-red-100 text-red-700
                    border border-red-700/50 rounded-md w-full max-w-sm p-5 mt-5">
                        <span className='ml-auto'>{error}</span>
                        <button onClick={() => setError(null)} className='ml-auto cursor-pointer'>
                            <X size={18} strokeWidth={3} />
                        </button>
                    </div>}

                <div className={`flex flex-col items-center w-full gap-y-5 ${error ? "mt-5" : "mt-5"}`}>
                    <div className="relative w-full max-w-sm">
                        <User
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />

                        <input
                            type="text"
                            placeholder="Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-4 outline-none focus:border-black!"
                        />
                    </div>

                    <div className="relative w-full max-w-sm">
                        <LockKeyhole
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
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

                    <button className='w-full text-end primary-text-color font-semibold mb-5 cursor-pointer max-w-sm'>Forgot Password?</button>

                    <button className=' primary-button rounded-full! w-full max-w-sm'
                        onClick={() => loginMutation.mutate()}
                        disabled={loginMutation.isPending}>

                        {loginMutation.isPending ? <><Spinner className='size-5' /> Signing in... </>
                            : <>Sign In</>}
                    </button>
                </div>
            </div>
        </>
    );
}
