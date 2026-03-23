import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface Message {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: bigint;
  isMalpractice: boolean;
}

function formatTime(ts: bigint) {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const session = (() => {
    try {
      return JSON.parse(localStorage.getItem("participantSession") || "");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!session?.participantId) {
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  const fetchMessages = useCallback(async () => {
    if (!actor || !session?.participantId) return;
    try {
      const msgs = await (actor as any).getMyMessages(session.participantId);
      setMessages(
        (msgs as Message[]).sort(
          (a, b) => Number(a.timestamp) - Number(b.timestamp),
        ),
      );
    } catch {
      // silent
    }
  }, [actor, session?.participantId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }); // eslint-disable-next-line

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !actor || !session) return;
    setSending(true);
    setInput("");
    try {
      await (actor as any).sendMessage(
        session.participantId,
        session.participantName,
        text,
      );
      await fetchMessages();
    } catch {
      toast.error("Failed to send message");
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, actor, session, fetchMessages]);

  const flagMalpractice = useCallback(
    async (type: string) => {
      if (!actor || !session) return;
      try {
        await (actor as any).flagMalpractice(
          session.participantId,
          session.participantName,
          type,
        );
        await fetchMessages();
      } catch {
        // silent
      }
    },
    [actor, session, fetchMessages],
  );

  // Malpractice detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        toast.warning("⚠️ Malpractice detected: Tab switched!", {
          duration: 4000,
        });
        flagMalpractice("TAB_SWITCH");
      }
    };
    const handleBlur = () => {
      toast.warning("⚠️ Malpractice detected: Window lost focus!", {
        duration: 4000,
      });
      flagMalpractice("WINDOW_BLUR");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [flagMalpractice]);

  if (!session) return null;

  return (
    <div className="h-screen flex flex-col" style={{ background: "#ECE5DD" }}>
      {/* Header */}
      <header
        data-ocid="chat.section"
        className="flex items-center gap-3 px-4 py-3 shadow-md z-10"
        style={{ background: "#075E54" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "#25D366" }}
        >
          {session.participantName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">
            {session.participantName}
          </p>
          <p className="text-white/60 text-xs">Exam in progress</p>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            data-ocid="chat.logout_button"
            onClick={() => {
              localStorage.removeItem("participantSession");
              navigate({ to: "/" });
            }}
            className="text-white/70 text-xs hover:text-white transition-colors px-2 py-1 rounded"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Messages */}
      <main
        data-ocid="chat.list"
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin"
        style={{ background: "#ECE5DD" }}
      >
        {messages.length === 0 && (
          <div
            data-ocid="chat.empty_state"
            className="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <div className="bg-white/80 rounded-2xl px-6 py-4 text-center shadow-sm">
              <p className="text-sm font-medium">Welcome to ExamChat</p>
              <p className="text-xs mt-1 text-gray-400">
                Type your answer and send it below
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={String(msg.id)} msg={msg} index={i + 1} />
        ))}
        <div ref={bottomRef} />
      </main>

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: "#F0F0F0" }}
      >
        <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 shadow-xs">
          <input
            ref={inputRef}
            data-ocid="chat.input"
            type="text"
            className="flex-1 outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-transparent"
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
        </div>
        <button
          type="button"
          data-ocid="chat.submit_button"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
          style={{ background: input.trim() ? "#25D366" : "#aaa" }}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  if (msg.isMalpractice) {
    return (
      <div
        data-ocid={`chat.item.${index}`}
        className="flex justify-end mb-1 animate-slide-in"
      >
        <div
          className="relative max-w-[75%] px-3 py-2 rounded-2xl rounded-br-sm shadow-msg"
          style={{ background: "#FF4444", color: "white" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-bold uppercase tracking-wide">
              MALPRACTICE
            </span>
          </div>
          <p className="text-sm">{msg.text}</p>
          <p className="text-right text-xs mt-1 opacity-75">
            {formatTime(msg.timestamp)}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      data-ocid={`chat.item.${index}`}
      className="flex justify-end mb-1 animate-slide-in"
    >
      <div
        className="relative max-w-[75%] px-3 py-2 rounded-2xl rounded-br-sm shadow-msg"
        style={{ background: "#DCF8C6" }}
      >
        <p className="text-sm text-gray-800">{msg.text}</p>
        <p className="text-right text-xs mt-1" style={{ color: "#8696a0" }}>
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}
