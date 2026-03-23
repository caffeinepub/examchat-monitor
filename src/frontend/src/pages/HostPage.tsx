import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

const HOST_PASSWORD = "TMMVVCE";

interface Participant {
  id: string;
  name: string;
}

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

export default function HostPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const session = (() => {
    try {
      return JSON.parse(localStorage.getItem("hostSession") || "");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!session?.password) {
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  const fetchData = useCallback(async () => {
    if (!actor) return;
    try {
      const [pResult, mResult] = await Promise.all([
        (actor as any).getParticipants(HOST_PASSWORD),
        (actor as any).getAllMessages(HOST_PASSWORD),
      ]);
      const pArr: Participant[] = pResult?.[0] ?? [];
      const mArr: Message[] = mResult?.[0] ?? [];
      setParticipants(pArr);
      setMessages(
        mArr.sort(
          (a: Message, b: Message) => Number(a.timestamp) - Number(b.timestamp),
        ),
      );
      setLastRefresh(new Date());
    } catch {
      // silent
    }
  }, [actor]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const selectedMessages = messages.filter((m) => m.participantId === selected);

  const getLastMessage = (participantId: string) => {
    const msgs = messages.filter((m) => m.participantId === participantId);
    if (!msgs.length) return null;
    return msgs[msgs.length - 1];
  };

  const getMalpracticeCount = (participantId: string) =>
    messages.filter((m) => m.participantId === participantId && m.isMalpractice)
      .length;

  if (!session) return null;

  return (
    <div className="h-screen flex flex-col" style={{ background: "#ECE5DD" }}>
      {/* Top header */}
      <header
        className="flex items-center justify-between px-4 py-3 shadow-md z-10"
        style={{ background: "#075E54" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#25D366" }}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Host Dashboard</p>
            <p className="text-white/60 text-xs">
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""} • Last updated{" "}
              {lastRefresh.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="host.toggle"
            onClick={fetchData}
            className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-ocid="host.logout_button"
            onClick={() => {
              localStorage.removeItem("hostSession");
              navigate({ to: "/" });
            }}
            className="text-white/70 text-xs hover:text-white transition-colors px-2 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          data-ocid="host.list"
          className="w-80 flex-shrink-0 flex flex-col border-r overflow-y-auto scrollbar-thin"
          style={{ background: "white", borderColor: "#e0e0e0" }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "#e0e0e0" }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Participants
            </p>
          </div>
          {participants.length === 0 && (
            <div
              data-ocid="host.empty_state"
              className="flex flex-col items-center justify-center flex-1 p-8 text-gray-400"
            >
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No participants yet</p>
              <p className="text-xs mt-1">
                Waiting for participants to join...
              </p>
            </div>
          )}
          {participants.map((p, i) => {
            const last = getLastMessage(p.id);
            const malpracticeCount = getMalpracticeCount(p.id);
            const isSelected = selected === p.id;
            return (
              <button
                type="button"
                key={p.id}
                data-ocid={`host.item.${i + 1}`}
                onClick={() => setSelected(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b transition-colors ${
                  isSelected ? "bg-[#25D366]/10" : "hover:bg-gray-50"
                }`}
                style={{ borderColor: "#f0f0f0" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: isSelected ? "#25D366" : "#128C7E" }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800 truncate">
                      {p.name}
                    </span>
                    {last && (
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(last.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-gray-400 truncate">
                      {last
                        ? last.isMalpractice
                          ? "⚠️ Malpractice"
                          : last.text
                        : "No messages"}
                    </span>
                    {malpracticeCount > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {malpracticeCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Chat panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div
              className="flex-1 flex flex-col items-center justify-center"
              style={{ background: "#ECE5DD" }}
            >
              <div className="bg-white/80 rounded-2xl px-8 py-6 text-center shadow-sm">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium">
                  Select a participant
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Click on a participant to view their messages
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Participant header */}
              <div
                className="flex items-center gap-3 px-4 py-3 shadow-sm"
                style={{ background: "#075E54" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: "#25D366" }}
                >
                  {participants
                    .find((p) => p.id === selected)
                    ?.name.charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {participants.find((p) => p.id === selected)?.name}
                  </p>
                  <p className="text-white/60 text-xs">
                    {selectedMessages.length} message
                    {selectedMessages.length !== 1 ? "s" : ""} •
                    {getMalpracticeCount(selected)} malpractice
                    {getMalpracticeCount(selected) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                data-ocid="host.panel"
                className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin"
                style={{ background: "#ECE5DD" }}
              >
                {selectedMessages.length === 0 && (
                  <div
                    data-ocid="host.empty_state"
                    className="flex items-center justify-center h-full"
                  >
                    <div className="bg-white/80 rounded-xl px-6 py-4 text-center shadow-sm">
                      <p className="text-sm text-gray-500">
                        No messages from this participant yet
                      </p>
                    </div>
                  </div>
                )}
                {selectedMessages.map((msg, i) => (
                  <HostMessageBubble
                    key={String(msg.id)}
                    msg={msg}
                    index={i + 1}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function HostMessageBubble({ msg, index }: { msg: Message; index: number }) {
  if (msg.isMalpractice) {
    return (
      <div
        data-ocid={`host.item.${index}`}
        className="flex justify-start mb-1 animate-slide-in"
      >
        <div
          className="relative max-w-[75%] px-3 py-2 rounded-2xl rounded-bl-sm shadow-msg"
          style={{ background: "#FF4444", color: "white" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-bold uppercase tracking-wide">
              MALPRACTICE
            </span>
          </div>
          <p className="text-sm">{msg.text}</p>
          <p className="text-xs mt-1 opacity-75">{formatTime(msg.timestamp)}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      data-ocid={`host.item.${index}`}
      className="flex justify-start mb-1 animate-slide-in"
    >
      <div
        className="relative max-w-[75%] px-3 py-2 rounded-2xl rounded-bl-sm shadow-msg"
        style={{ background: "white" }}
      >
        <p className="text-sm text-gray-800">{msg.text}</p>
        <p className="text-xs mt-1" style={{ color: "#8696a0" }}>
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}
