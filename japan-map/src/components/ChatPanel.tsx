// components/ChatPanel.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "../lib/utils";

interface ChatPanelProps {
    meshId: string;
    onClose: () => void;
}

export default function ChatPanel({ meshId, onClose }: ChatPanelProps) {
    const [chatHistory, setChatHistory] = useState<Record<string, { role: "user" | "ai"; content: string }[]>>({});
    const { register, handleSubmit, reset } = useForm();

    const messages = chatHistory[meshId] || [];

    const handleSend = ({ message }: any) => {
        if (!message) return;

        const userMsg = { role: "user" as const, content: message };
        const aiMsg = {
            role: "ai" as const,
            content: `I received your message about mesh ${meshId}: "${message}"`,
        };

        setChatHistory(prev => ({
            ...prev,
            [meshId]: [...(prev[meshId] || []), userMsg, aiMsg],
        }));

        reset();
    };

    useEffect(() => {
        if (!chatHistory[meshId]) {
            setChatHistory(prev => ({ ...prev, [meshId]: [] }));
        }
    }, [meshId]);

    return (
        <div

            className="h-full w-full max-w-[400px] bg-transparent flex flex-col pl-4 py-2 pr-0 space-y-2"
        >
            <div className="p-2 rounded-2xl shadow-2xl bg-white/50 backdrop-blur-2xl border border-black/10 ">
                <div className="px-4 flex justify-between items-center  ">
                    <div className="space-x-4 flex items-center ">
                        <h2 className="text-lg font-semibold text-gray-800">Mirai AI Chat </h2>
                        <span className="bg-blue-200 border border-blue-600 text-blue-600 rounded-full px-2 py-0.5 text-xs">{meshId}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-white/50 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/10">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "p-3 rounded-2xl text-sm max-w-[85%] leading-snug",
                            msg.role === "user"
                                ? "bg-black text-gray-100  ml-auto"
                                : "bg-white text-black mr-auto border border-gray-200"
                        )}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(handleSend)} className="p-4 border-t bg-white/50 backdrop-blur-2xl rounded-2xl  flex gap-2 border border-black/10 shadow-2xl">
                <input
                    {...register("message")}
                    type="text"
                    placeholder="Ask something about this mesh..."
                    className="flex-1 border border-gray-300 bg-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    type="submit"
                    className="px-5 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-white hover:text-black cursor-pointer transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
