import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";
import type { ChatMessage } from "./Chatbot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatbotActiveProps = {
    message: string;
    messages: ChatMessage[];
    onMessageChange: (message: string) => void;
    onSendMessage: () => void | Promise<void>;
    isSending: boolean;
};

export default function ChatbotActive({
    message,
    messages,
    onMessageChange,
    onSendMessage,
    isSending,
}: ChatbotActiveProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage();
    };

    return (
        <div className="flex h-[calc(100vh-86px)] min-h-[520px] flex-col bg-white px-3 md:h-[calc(100vh-96px)] md:px-0">
            <div className="scrollbar-hide flex-1 overflow-y-auto py-6 md:py-10">
                <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8">
                    {messages.map((chatMessage) => (
                        <div
                            key={chatMessage.id}
                            className={`flex ${chatMessage.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={
                                    chatMessage.role === "user"
                                        ? "max-w-[82%] rounded-[22px] bg-[#f4f4f4] px-4 py-2.5 text-sm leading-relaxed text-gray-950 md:max-w-[70%] md:text-base"
                                        : "w-full max-w-none text-sm leading-7 text-gray-950 md:text-base md:leading-8"
                                }
                            >
                                <div
                                    className={`${chatMessage.role === "assistant"
                                            ? "[&_a]:text-[#bf3419] [&_code]:rounded-md [&_code]:bg-[#f4f4f4] [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
                                            : "[&_p]:m-0"
                                    }`}
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {chatMessage.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 md:text-base">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bf3419] opacity-40" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#bf3419]" />
                                </span>
                                Thinking...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="sticky bottom-0 bg-white pb-4 pt-3 md:pb-6">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto flex w-full max-w-[760px] items-center gap-2 rounded-full border border-[#e5e5e5] bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Describe the device issue or error message..."
                        value={message}
                        onChange={(event) => onMessageChange(event.target.value)}
                        className="min-w-0 flex-1 rounded-full px-3 py-2.5 text-base outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#bf3419] text-white transition hover:bg-[#d0472c] disabled:cursor-not-allowed disabled:bg-[#d14a2e]"
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
