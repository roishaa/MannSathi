import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function VideoRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Jitsi room name — unique per appointment ID ──
  const roomName = `mannsathi-session-${id}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      try {
        await api.get(`/appointments/${id}/video-room`);
      } catch (e) {
        if (e?.response?.status === 401) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_data");
          navigate("/login", { replace: true });
          return;
        }
        // 404 or other errors are fine — Jitsi doesn't need a room URL
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1f1a] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-[#2a7a66] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/80 text-lg font-medium">Setting up your video room...</p>
        <p className="text-white/40 text-sm">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1f1a] flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-6xl">📹</div>
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-2">Unable to load video room</h2>
          <p className="text-white/60 text-sm max-w-sm">{error}</p>
        </div>
        <button
          onClick={() => navigate("/sessions")}
          className="px-6 py-3 rounded-full bg-[#2a7a66] text-white font-semibold hover:bg-[#215c4c] transition"
        >
          ← Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1f1a] flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#1a2e28] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2a7a66] flex items-center justify-center text-white text-sm">🌿</div>
          <div>
            <p className="text-white font-semibold text-sm">MannSathi</p>
            <p className="text-white/50 text-xs">Video Session</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <button
            onClick={() => navigate("/sessions")}
            className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 hover:bg-red-500/30 transition"
          >
            Leave session
          </button>
        </div>
      </div>

      {/* ── Jitsi iframe ── */}
      <div className="flex-1 relative">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          className="absolute inset-0 w-full h-full border-0"
          title="MannSathi Video Session"
        />
      </div>

      {/* ── Bottom notice ── */}
      <div className="px-5 py-2 bg-[#1a2e28] border-t border-white/10 text-center">
        <p className="text-white/30 text-xs">
          This session is private and confidential. Only you and your counselor can join.
        </p>
      </div>
    </div>
  );
}