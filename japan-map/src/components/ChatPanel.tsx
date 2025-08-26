// src/components/ChatPanel.tsx
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "../lib/utils";
import { askMeshQA, UiDoc } from "../lib/qaClient";
import { UiBlocks } from "@/components/UiBlocks"; // change to relative import if you don't use "@/"

type MeshLevel = "250m" | "500m" | "1km";
type MeshRef = { level: MeshLevel; id: string };

interface ChatPanelProps {
  meshRef: MeshRef; // level + id
  onClose: () => void;
}

// Message type: keep your original roles, add optional UI payload
type ChatMsg = {
  role: "user" | "ai";
  content: string;
  ui?: UiDoc; // NEW
};

export default function ChatPanel({ meshRef, onClose }: ChatPanelProps) {
  const meshKey = useMemo(() => `${meshRef.level}:${meshRef.id}`, [meshRef]);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMsg[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const messages = chatHistory[meshKey] || [];

  useEffect(() => {
    if (!chatHistory[meshKey]) {
      setChatHistory((prev) => ({ ...prev, [meshKey]: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meshKey]);

  const handleSend = async ({ message }: { message: string }) => {
    const q = (message || "").trim();
    if (!q) return;
    setError(null);

    const userMsg: ChatMsg = { role: "user", content: q };
    setChatHistory((prev) => ({ ...prev, [meshKey]: [...(prev[meshKey] || []), userMsg] }));
    reset();

    setLoading(true);
    try {
      const { answer, ui } = await askMeshQA({ meshRef, question: q });
      const aiMsg: ChatMsg = { role: "ai", content: answer, ui }; // keep ui
      setChatHistory((prev) => ({ ...prev, [meshKey]: [...(prev[meshKey] || []), aiMsg] }));
    } catch (e: any) {
      setError(e?.message || "Failed to get answer.");
      const aiMsg: ChatMsg = { role: "ai", content: "Sorry — API error while answering." };
      setChatHistory((prev) => ({ ...prev, [meshKey]: [...(prev[meshKey] || []), aiMsg] }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full max-w-[400px] bg-transparent flex flex-col pl-4 py-2 pr-0 space-y-2">
      <div className="p-2 rounded-2xl shadow-2xl bg-white/50 backdrop-blur-2xl border border-black/10 ">
        <div className="px-4 flex justify-between items-center">
          <div className="space-x-2 flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">Mirai AI Chat</h2>
            <span className="bg-blue-200 border border-blue-600 text-blue-600 rounded-full px-2 py-0.5 text-xs">
              {meshRef.level} · {meshRef.id}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close">
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
                ? "bg-black text-gray-100 ml-auto"
                : "bg-white text-black mr-auto border border-gray-200"
            )}
          >
            {/* Text (plain). If you want Markdown, swap in react-markdown here */}
            <div className="whitespace-pre-wrap">{msg.content}</div>

            {/* NEW: structured UI blocks under AI messages (keeps your original design) */}
            {msg.role === "ai" && msg.ui?.blocks?.length ? (
              <div className="mt-3">
                <UiBlocks ui={msg.ui} />
              </div>
            ) : null}
          </div>
        ))}

        {loading && (
          <div className="p-3 rounded-2xl text-sm max-w-[85%] leading-snug bg-white text-black mr-auto border border-gray-200">
            Thinking…
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl text-sm max-w-[85%] leading-snug bg-red-50 text-red-700 mr-auto border border-red-200">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit(handleSend)}
        className="p-4 border-t bg-white/50 backdrop-blur-2xl rounded-2xl flex gap-2 border border-black/10 shadow-2xl"
      >
        <input
          {...register("message")}
          type="text"
          placeholder="Ask something about this mesh…"
          className="flex-1 border border-gray-300 bg-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-white hover:text-black cursor-pointer transition"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
