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
    <div className="min-h-screen bg-[#f8f6f0] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-[#1e293b]">
            Mood Check-in
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#64748b] hover:text-[#1f4e43]"
          >
            ✕ Close
          </button>
        </div>

        <p className="text-sm text-[#6b7280] mb-8">
          Take a moment to notice how you’re feeling right now.
          There’s no right or wrong answer.
        </p>

        {/* Mood options */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {moods.map((m) => (
            <button
              key={m.key}
              onClick={() => setMood(m.key)}
              className={`rounded-2xl px-4 py-5 text-center border transition
                ${
                  mood === m.key
                    ? "border-[#1f4e43] ring-2 ring-[#1f4e43]/30"
                    : "border-[#e5e7eb] hover:shadow-sm"
                }
                ${m.color}`}
            >
              <div className="text-2xl mb-2">{m.emoji}</div>
              <p className="text-sm font-semibold text-[#1e293b]">
                {m.label}
              </p>
            </button>
          ))}
        </div>

        {/* Reflection note */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#1e293b] mb-2">
            Want to share what’s behind this feeling? (optional)
          </label>
          <textarea
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="You can write a few words here…"
            className="w-full rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#1f4e43]/30"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSubmit}
            disabled={!mood || saving}
            className={`flex-1 rounded-full px-6 py-3 text-sm font-semibold transition
              ${
                mood && !saving
                  ? "bg-[#1f4e43] text-white hover:bg-[#173a32]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {saving ? "Saving..." : "Save check-in"}
          </button>

          <Link
            to="/users/dashboard"
            className="flex-1 text-center rounded-full border border-[#1f4e43]
                       px-6 py-3 text-sm font-semibold text-[#1f4e43]
                       hover:bg-[#1f4e43] hover:text-white transition"
          >
            Skip for now
          </Link>
        </div>

        {/* Gentle message */}
        <div className="mt-8 text-center text-xs text-[#6b7280]">
          Your emotions are valid. You’re doing your best 🤍
        </div>
      </div>
    </div>
  );
}
