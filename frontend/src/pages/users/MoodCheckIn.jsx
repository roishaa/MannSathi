import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function MoodCheckIn() {
  const navigate = useNavigate();
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const moods = [
    { key: "great", label: "Great", emoji: "😄", color: "bg-[#e3f3e6]" },
    { key: "okay", label: "Okay", emoji: "🙂", color: "bg-[#fff7d6]" },
    { key: "meh", label: "Meh", emoji: "😐", color: "bg-[#f3f4f6]" },
    { key: "sad", label: "Sad", emoji: "😔", color: "bg-[#ffe1d6]" },
    { key: "anxious", label: "Anxious", emoji: "😣", color: "bg-[#efe6ff]" },
  ];

  const handleSubmit = async () => {
    if (!mood) return;
    
    setSaving(true);
    try {
      await api.post("/user/mood-entries", { 
        mood, 
        note: note.trim() || null 
      });

      // Navigate back to dashboard with refresh flag
      navigate("/users/dashboard", { 
        state: { refreshMood: Date.now() } 
      });
    } catch (error) {
      console.error("Error saving mood:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        alert("Mood check-in is only available for users. Please log in with a user account.");
        navigate("/");
      } else {
        const msg = error?.response?.data?.message || "Failed to save mood. Please try again.";
        alert(msg);
      }
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f7f5ee_42%,_#f3f7f1_100%)] px-4 py-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(20,38,33,0.12)] backdrop-blur-sm sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#eef1ed] pb-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-serif leading-tight text-[#1e293b] sm:text-4xl">
                Mood Check-in
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[#6b7280] sm:text-base">
                Take a moment to notice how you’re feeling right now.
                There’s no right or wrong answer.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="shrink-0 rounded-2xl border border-[#d9e6df] bg-[#f7fbf8] px-4 py-2 text-sm font-medium text-[#4b5563] transition-all duration-300 hover:border-[#1f4e43]/40 hover:text-[#1f4e43]"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-6 pt-6">
            {/* Mood options */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-[#3f4a5c]">How are you feeling?</div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {moods.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    className={`rounded-2xl border px-4 py-5 text-center transition-all duration-300
                  ${
                    mood === m.key
                      ? "border-[#1f4e43] ring-2 ring-[#1f4e43]/25 shadow-[0_12px_24px_rgba(31,78,67,0.12)]"
                      : "border-[#e5e7eb] hover:-translate-y-0.5 hover:border-[#d4ddd8] hover:shadow-[0_10px_20px_rgba(20,38,33,0.08)]"
                  }
                  ${m.color}`}
                  >
                    <div className="mb-2 text-2xl">{m.emoji}</div>
                    <p className="text-sm font-semibold text-[#1e293b]">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection note */}
            <div className="space-y-3 rounded-2xl border border-[#edf2ee] bg-[#fbfcfb] p-4 sm:p-5">
              <label className="block text-sm font-medium text-[#1e293b]">
                Want to share what’s behind this feeling? (optional)
              </label>
              <textarea
                rows="4"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="You can write a few words here…"
                className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f2937] shadow-sm transition-all duration-300 placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1f4e43]/30"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 border-t border-[#eef1ed] pt-6 sm:flex-row">
              <button
                onClick={handleSubmit}
                disabled={!mood || saving}
                className={`flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300
                ${
                  mood && !saving
                    ? "bg-[#1f4e43] text-white shadow-[0_12px_24px_rgba(31,78,67,0.28)] hover:-translate-y-0.5 hover:bg-[#173a32]"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                {saving ? "Saving..." : "Save check-in"}
              </button>

              <Link
                to="/users/dashboard"
                className="flex-1 rounded-2xl border border-[#1f4e43]/30 px-6 py-3 text-center text-sm font-semibold text-[#1f4e43] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1f4e43] hover:bg-[#f4faf7]"
              >
                Skip for now
              </Link>
            </div>
          </div>

          {/* Gentle message */}
          <div className="mt-6 text-center text-xs text-[#6b7280] sm:mt-8">
            Your emotions are valid. You’re doing your best 🤍
          </div>
        </div>
      </div>
    </div>
  );
}
