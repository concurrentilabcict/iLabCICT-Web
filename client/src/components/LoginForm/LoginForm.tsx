import Logo from '@/assets/logo.png';
import { User, LockKeyhole, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl, createApiError, publicFetch, type ApiError } from '@/lib/api';
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

    const handleSignIn = () => {
        if (!loginMutation.isPending) {
            loginMutation.mutate();
        }
    };

    const loginMutation = useMutation({
        mutationFn: async () => {

            if (!email || !password) {
                throw new Error("Username and password are required.");

            }

            const res = await publicFetch(buildApiUrl("/api/auth/login/"), {
                method: "POST",
                body: JSON.stringify({ username: email.toLowerCase(), password }),
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
                name: name, email: data.email ?? email.trim().toLowerCase(),
                role: data.role, profilePicture: data.profile_image,
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
            <div className="flex w-full flex-col items-center justify-center gap-y-1 px-5 lg:items-stretch lg:px-0">
                <div className="flex flex-col items-center gap-y-1 lg:hidden">
                    <img src={Logo} alt="ILabCICT logo" className="h-auto w-25" />
                    <h1 className='primary-text-color text-3xl tracking-wide font-bold'>ILabCICT</h1>
                    <span>Welcome back, sign in to continue.</span>
                </div>

                <div className="hidden lg:block">
                    <p className="mb-2 text-sm font-semibold primary-text-color">WELCOME BACK</p>
                    <h2 className="text-4xl font-semibold text-zinc-950">Sign in to your account</h2>
                    <p className="mt-3 text-base secondary-text-color">
                        Enter your account details to continue to ILabCICT.
                    </p>
                </div>

                {error &&
                    <div className="mt-5 flex w-full max-w-sm items-center justify-center rounded-md border border-red-700/50 bg-red-100 p-5 text-sm text-red-700 lg:max-w-none">
                        <span className='ml-auto'>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            aria-label="Dismiss error"
                            className='ml-auto cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700'
                        >
                            <X size={18} strokeWidth={3} />
                        </button>
                    </div>}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSignIn();
                    }}
                    className="mt-5 flex w-full flex-col items-center gap-y-5 lg:mt-9 lg:items-stretch"
                >
                    <div className="relative w-full max-w-sm lg:max-w-none">
                        <label htmlFor="login-username" className="sr-only">Username</label>
                        <User
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />

                        <input
                            id="login-username"
                            type="text"
                            placeholder="Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            required
                            className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-4 outline-none focus:border-black! focus-visible:ring-2 focus-visible:ring-black/10 lg:h-12"
                        />
                    </div>

                    <div className="relative w-full max-w-sm lg:max-w-none">
                        <label htmlFor="login-password" className="sr-only">Password</label>
                        <LockKeyhole
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />

                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="w-full rounded-lg border primary-border-color py-3 pl-10 pr-11 outline-none focus:border-black! focus-visible:ring-2 focus-visible:ring-black/10 lg:h-12"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md secondary-text-color hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                        >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>

                    <div className="flex w-full max-w-sm justify-end lg:max-w-none">
                        <button
                            onClick={() => navigate("/forgot-password")}
                            type="button"
                            className="mb-5 cursor-pointer rounded-sm font-semibold primary-text-color hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bf3419]/30"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button className='primary-button w-full max-w-sm rounded-full! lg:h-12 lg:max-w-none'
                        type="submit"
                        disabled={loginMutation.isPending}>

                        {loginMutation.isPending ? <><Spinner className='size-5' /> Signing in... </>
                            : <>Sign In</>}
                    </button>
                </form>
            </div>
        </>
    );
}
