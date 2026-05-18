import Logo from '@/assets/logo.png';
import { User, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm() {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <div className="flex flex-col items-center justify-center gap-y-1 px-5 w-full">
                <img src={Logo} alt="Logo" className="w-25 h-auto" />
                <h1 className='primary-text-color text-3xl tracking-wide font-bold'>IlabCICT</h1>
                <span>Welcome back, sign in to continue.</span>

                <div className="flex flex-col items-center w-full gap-y-5 mt-15">
                    <div className="relative w-full max-w-sm">
                        <User
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 secondary-text-color"
                        />

                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-black"
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
                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-black"
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

                    <button className='primary-button'>
                        Sign In
                    </button>
                </div>
            </div>
        </>
    );
}