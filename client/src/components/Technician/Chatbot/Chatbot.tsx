import { useAuth } from "@/auth/useAuth";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import ChatbotActive from "./ChatbotActive";
import ChatbotEmpty from "./ChatbotEmpty";

export type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
};

export default function Chatbot() {
    const { name } = useAuth();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const chatMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await privateFetch(buildApiUrl("/api/chat/"), {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    message,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                throw createApiError(res.status, data.reply || data.message || "Failed to get chatbot response.");
            }

            return data.reply as string;
        },
    });

    const splitFullName = (fullName: string) => {
        const parts = fullName.trim().split(" ").filter(Boolean);

        return {
            firstName: parts.slice(0, -1).join(" ") || parts[0] || "",
            lastName: parts.slice(-1).join(" "),
        };
    };

    const currentName = splitFullName(name);
    const hasActiveChat = messages.length > 0;
    const isSending = chatMutation.isPending;

    const handleSendMessage = () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage || isSending) return;

        const messageId = Date.now();
        const userMessage: ChatMessage = {
            id: messageId,
            role: "user",
            content: trimmedMessage,
        };

        setMessages((currentMessages) => [...currentMessages, userMessage]);
        setMessage("");

        chatMutation.mutate(trimmedMessage, {
            onSuccess: (reply) => {
                setMessages((currentMessages) => [
                    ...currentMessages,
                    {
                        id: messageId + 1,
                        role: "assistant",
                        content: reply,
                    },
                ]);
            },
            onError: (error) => {
                console.error(error);

                setMessages((currentMessages) => [
                    ...currentMessages,
                    {
                        id: messageId + 1,
                        role: "assistant",
                        content: "Sorry, I couldn't get a response right now. Please try again.",
                    },
                ]);
            },
        });
    };

    if (hasActiveChat) {
        return (
            <ChatbotActive
                message={message}
                messages={messages}
                onMessageChange={setMessage}
                onSendMessage={handleSendMessage}
                isSending={isSending}
            />
        );
    }

    return (
        <ChatbotEmpty
            firstName={currentName.firstName}
            message={message}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
            isSending={isSending}
        />
    );
}
