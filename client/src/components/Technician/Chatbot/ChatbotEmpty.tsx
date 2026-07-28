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
        if (window.matchMedia("(max-width: 767px)").matches) return;

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

    const handleInputFocus = () => {
        window.setTimeout(() => {
            inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }, 100);
    };

    return (
        <div className="flex h-[calc(100dvh-86px)] min-h-0 flex-col px-3 md:h-auto md:min-h-[520px] md:py-14">
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pt-7 pb-4 md:overflow-visible md:pt-0">
                <div className="flex w-full flex-col gap-y-2.5 mb-6">
                    <h1 className="secondary-text-color">Hi There, {firstName}</h1>
                    <h2 className="font-semibold text-3xl md:text-4xl lg:text-5xl">
                        Need help diagnosing <br /> a computer issue?
                    </h2>
                    <p className="text-sm md:text-base secondary-text-color max-w-[450px]">
                        Describe the problem, symptoms, or error message and receive step-by-step
                        troubleshooting guidance.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm lg:text-base w-full">
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
            </div>

            <form
                onSubmit={handleSubmit}
                className="sticky bottom-0 flex w-full items-center gap-2 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:static md:pb-0 md:pt-0"
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Describe the device issue or error message..."
                    value={message}
                    onChange={(event) => onMessageChange(event.target.value)}
                    onFocus={handleInputFocus}
                    className="min-w-0 flex-1 rounded-full border px-4 py-3 text-base outline-none focus:border-black!"
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
