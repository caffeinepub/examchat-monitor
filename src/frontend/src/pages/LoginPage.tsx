import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

type Role = "participant" | "host" | null;

export default function LoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [role, setRole] = useState<Role>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleParticipantJoin = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!actor) {
      toast.error("Connecting to server...");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const participantId = await (actor as any).registerParticipant(
        name.trim(),
      );
      localStorage.setItem(
        "participantSession",
        JSON.stringify({ participantId, participantName: name.trim() }),
      );
      navigate({ to: "/chat" });
    } catch (_e) {
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleHostLogin = () => {
    if (password === "TMMVVCE") {
      localStorage.setItem(
        "hostSession",
        JSON.stringify({ role: "host", password: "TMMVVCE" }),
      );
      navigate({ to: "/host" });
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#ECE5DD" }}
    >
      {/* Header */}
      <div className="w-full" style={{ background: "#075E54" }}>
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 fill-white"
              aria-label="ExamChat logo"
              role="img"
            >
              <title>ExamChat</title>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.522 5.857L.057 23.882a.5.5 0 0 0 .61.61l6.101-1.456A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.5-5.19-1.373l-.371-.214-3.862.922.937-3.773-.234-.386A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              ExamChat
            </h1>
            <p className="text-white/70 text-xs">Secure Exam Monitoring</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Role selector */}
          {!role && (
            <div className="p-8">
              <h2 className="text-center text-gray-700 font-semibold text-lg mb-2">
                Who are you?
              </h2>
              <p className="text-center text-gray-400 text-sm mb-8">
                Select your role to continue
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  data-ocid="login.participant_button"
                  onClick={() => {
                    setRole("participant");
                    setError("");
                  }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <Users className="w-7 h-7 text-[#25D366]" />
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">
                    I am a Participant
                  </span>
                </button>
                <button
                  type="button"
                  data-ocid="login.host_button"
                  onClick={() => {
                    setRole("host");
                    setError("");
                  }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-[#075E54] hover:bg-[#075E54]/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#075E54]/10 flex items-center justify-center group-hover:bg-[#075E54]/20 transition-colors">
                    <Shield className="w-7 h-7 text-[#075E54]" />
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">
                    I am a Host
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Participant form */}
          {role === "participant" && (
            <div className="p-8">
              <button
                type="button"
                onClick={() => {
                  setRole(null);
                  setError("");
                }}
                className="text-[#075E54] text-sm mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    Join as Participant
                  </h2>
                  <p className="text-gray-400 text-xs">
                    Enter your name to begin
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  data-ocid="login.name_input"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleParticipantJoin()
                  }
                  className="border-gray-200 focus:border-[#25D366] focus:ring-[#25D366]/20"
                />
                {error && (
                  <p
                    data-ocid="login.error_state"
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </p>
                )}
                <Button
                  data-ocid="login.join_button"
                  onClick={handleParticipantJoin}
                  disabled={loading}
                  className="w-full text-white font-semibold h-11"
                  style={{ background: loading ? "#aaa" : "#25D366" }}
                >
                  {loading ? "Joining..." : "Join Exam"}
                </Button>
              </div>
            </div>
          )}

          {/* Host form */}
          {role === "host" && (
            <div className="p-8">
              <button
                type="button"
                onClick={() => {
                  setRole(null);
                  setError("");
                }}
                className="text-[#075E54] text-sm mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#075E54]/15 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#075E54]" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">Host Login</h2>
                  <p className="text-gray-400 text-xs">
                    Enter your password to continue
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  data-ocid="login.password_input"
                  type="password"
                  placeholder="Host password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleHostLogin()}
                  className="border-gray-200 focus:border-[#075E54]"
                />
                {error && (
                  <p
                    data-ocid="login.error_state"
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </p>
                )}
                <Button
                  data-ocid="login.submit_button"
                  onClick={handleHostLogin}
                  className="w-full font-semibold h-11 text-white"
                  style={{ background: "#075E54" }}
                >
                  Login as Host
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
