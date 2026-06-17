import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { CloudAlert, HardDrive, ScreenShareOff, Send, User } from "lucide-react";

type ChatbotEmptyProps = {
    firstName: string;
    message: string;
    onMessageChange: (message: string) => void;
    onSendMessage: () => void | Promise<void>;
    isSending: boolean;
};

export default function ChatbotEmpty({
    firstName,
    message,
    onMessageChange,
    onSendMessage,
    isSending,
}: ChatbotEmptyProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const quickMessages = [
        {
            text: "No display, no power, boot loops",
            icon: <ScreenShareOff size={16} />,
        },
        {
            text: "Internet, Wi-Fi, and LAN problems",
            icon: <CloudAlert size={16} />,
        },
        {
            text: "Slow PC, SSD/HDD errors, high usage",
            icon: <HardDrive size={16} />,
        },
        {
            text: "Get recommended troubleshooting actions",
            icon: <User size={16} />,
        },
    ];

    const handleQuickMessage = (text: string) => {
        onMessageChange(text);
        inputRef.current?.focus();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage();
    };

    return (
        <div className="flex flex-col items-center px-3 pt-7 pb-6 md:py-14">
            <div className="flex flex-col gap-y-2.5 mb-6 w-full">
                <h1 className="secondary-text-color">Hi There, {firstName}</h1>
                <h2 className="font-semibold text-3xl md:text-4xl lg:text-5xl">
                    Need help diagnosing <br /> a computer issue?
                </h2>
                <p className="text-sm md:text-base secondary-text-color max-w-[450px]">
                    Describe the problem, symptoms, or error message and receive step-by-step
                    troubleshooting guidance.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm lg:text-base mb-8 w-full">
                {quickMessages.map((quickMessage) => (
                    <button
                        key={quickMessage.text}
                        type="button"
                        onClick={() => handleQuickMessage(quickMessage.text)}
                        className="cursor-pointer text-left flex justify-between flex-col border h-28 p-2 rounded-lg"
                    >
                        <p>{quickMessage.text}</p>

                        {quickMessage.icon}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Describe the device issue or error message..."
                    value={message}
                    onChange={(event) => onMessageChange(event.target.value)}
                    className="flex-1 rounded-full border px-4 py-3 text-base outline-none focus:border-black!"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!message.trim() || isSending}
                    className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#bf3419] text-white hover:bg-[#d0472c] disabled:cursor-not-allowed disabled:bg-[#d14a2e]"
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
