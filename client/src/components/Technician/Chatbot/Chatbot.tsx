import { useAuth } from "@/auth/useAuth";
import { ScreenShareOff, CloudAlert, HardDrive, User } from 'lucide-react';

export default function Chatbot() {

    const { name } = useAuth();

    const splitFullName = (fullName: string) => {
        const parts = fullName.trim().split(" ").filter(Boolean);

        return {
            firstName: parts.slice(0, -1).join(" "),
            lastName: parts.slice(-1).join(" "),
        };
    };
    const currentName = splitFullName(name);

    return (
        <>
            <div className="flex flex-col justify-center items-center min-h-screen px-3 py-3">
                <div className="flex flex-col gap-y-2.5 mb-8">
                    <h1 className="secondary-text-color">Hi There, {currentName.firstName}</h1>
                    <h2 className="font-semibold text-3xl">Need help diagnosing <br /> a computer issue?</h2>
                    <p className="text-sm secondary-text-color">Describe the problem, symptoms, or error message <br />
                        and receive step-by-step troubleshooting guidance.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm lg:text-base">
                    <button className="text-left flex justify-between flex-col border h-28 p-2 rounded-lg">
                        <p>No display, no power, boot loops</p>

                        <ScreenShareOff size={16} />
                    </button>

                    <button className="text-left flex justify-between flex-col border h-28 p-2 rounded-lg">
                        <p>Internet, Wi-Fi, and LAN problems</p>

                        <CloudAlert size={16} />
                    </button>

                    <button className="text-left flex justify-between flex-col border h-28 p-2 rounded-lg">
                        <p>Slow PC, SSD/HDD errors, high usage</p>

                        <HardDrive size={16} />
                    </button>

                    <button className="text-left flex justify-between flex-col border h-28 p-2 rounded-lg">
                        <p>Get recommended troubleshooting actions</p>

                        <User size={16} />
                    </button>
                </div>

                <div className="border w-full rounded-full">
                    <input type="text" placeholder="Test Test" />
                </div>
            </div>
        </>
    );
}
