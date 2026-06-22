import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { Bot, Send } from "lucide-react";
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
    }, [messages]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage();
    };

    return (
        <div className="flex h-[calc(100vh-86px)] min-h-[520px] flex-col px-3 md:h-[calc(100vh-96px)] md:px-0">
            <div className="scrollbar-hide flex-1 overflow-y-auto py-5 md:py-8">
                <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
                    {messages.map((chatMessage) => (
                        <div
                            key={chatMessage.id}
                            className={`flex items-start gap-3 ${chatMessage.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {chatMessage.role === "assistant" && (
                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#bf3419]/10 text-[#bf3419]">
                                    <Bot size={18} />
                                </div>
                            )}
                            <div
                                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[70%] md:text-base ${chatMessage.role === "user"
                                        ? "rounded-tr-sm bg-[#bf3419] text-white"
                                        : "rounded-tl-sm border bg-white"
                                    }`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {chatMessage.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="sticky bottom-0 bg-white pb-4 pt-3 md:pb-6">
                <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[760px] items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Describe the device issue or error message..."
                        value={message}
                        onChange={(event) => onMessageChange(event.target.value)}
                        className="flex-1 rounded-full border px-4 py-3 text-base outline-none focus:border-black!"
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
        </div>
    );
}
