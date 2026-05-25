import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export default function AIChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 I'm MannSathi's AI assistant. Tell me what you're going through and I'll help find the right counselor for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedCounselor, setSuggestedCounselor] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchCounselors = async () => {
    try {
      const res = await api.get("/counselors");
      return res.data?.items || res.data?.data || res.data || [];
    } catch {
      return [];
    }
  };

  const buildSystemPrompt = (counselors) => {
    const counselorList = counselors
      .filter((c) => c.status === "APPROVED" || !c.status)
      .map(
        (c) =>
          `ID: ${c.id} | Name: ${c.name} | Specialization: ${c.specialization || "General"} | Experience: ${c.experience_years || 0} years | Bio: ${c.bio || "N/A"}`
      )
      .join("\n");

    return `You are a compassionate AI assistant for MannSathi, a mental health platform based in Nepal.
Your role is to listen empathetically to users and suggest the most suitable counselor from the available list below.

AVAILABLE COUNSELORS:
${counselorList}

INSTRUCTIONS:
- Always respond with empathy and warmth first — acknowledge what the user is feeling
- After listening, suggest ONE counselor by name with a brief reason why they are a good fit
- Also suggest one relevant self-help resource from this list based on their concern:
  * Anxiety → /topics/anxiety
  * Stress → /topics/stress
  * Depression → /topics/depression
  * Relationships → /topics/relationships
  * OCD → /topics/ocd
  * Psychotic concerns → /topics/psychotic
  * General → /resources
- Keep responses short, warm, and easy to read — no long paragraphs
- Never diagnose or give medical advice
- Always remind the user that a real counselor is the best next step
- At the end of your response, include a JSON block in this exact format (nothing else after it):
SUGGESTION:{"counselor_id": <id>, "counselor_name": "<name>", "reason": "<short reason>", "resource_path": "<path>", "resource_label": "<label>"}`;
  };

  const parseAssistantMessage = (raw) => {
    const marker = "SUGGESTION:";
    const idx = raw.indexOf(marker);
    if (idx === -1) return { text: raw, suggestion: null };
    const text = raw.slice(0, idx).trim();
    try {
      const jsonStr = raw.slice(idx + marker.length).trim();
      const suggestion = JSON.parse(jsonStr);
      return { text, suggestion };
    } catch {
      return { text, suggestion: null };
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setSuggestedCounselor(null);

    try {
      const counselors = await fetchCounselors();
      const systemPrompt = buildSystemPrompt(counselors);

      const apiMessages = updatedMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...apiMessages,
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const raw = data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
      const { text, suggestion } = parseAssistantMessage(raw);

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      if (suggestion) setSuggestedCounselor(suggestion);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!suggestedCounselor) return;
    setOpen(false);

    const token = localStorage.getItem("user_token");

    if (token) {
      // Logged in → go to full booking page with pre-selected counselor
      navigate("/users/appointments/book", {
        state: { suggestedCounselorId: suggestedCounselor.counselor_id },
      });
    } else {
      // Not logged in → go to guest booking page
      navigate("/book-appointment");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi 👋 I'm MannSathi's AI assistant. Tell me what you're going through and I'll help find the right counselor for you.",
      },
    ]);
    setSuggestedCounselor(null);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Open AI assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1f4e43] shadow-[0_8px_30px_rgba(31,78,67,0.45)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_36px_rgba(31,78,67,0.55)]"
      >
        {open ? (
          <span className="text-white text-xl font-bold">✕</span>
        ) : (
          <span className="text-2xl">🧠</span>
        )}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#1f4e43] animate-ping opacity-20" />
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/60 bg-white shadow-[0_24px_70px_rgba(20,38,33,0.18)] flex flex-col overflow-hidden"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1f4e43] to-[#2a7a66] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🧠
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">MannSathi AI</p>
                <p className="text-white/70 text-xs">Find your counselor</p>
              </div>
            </div>
            <button onClick={handleReset} title="Start over" className="text-white/60 hover:text-white text-xs transition">
              ↺ Reset
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f9fbf9]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1f4e43] text-white rounded-br-sm"
                      : "bg-white text-[#1e293b] border border-[#eef1ed] rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#eef1ed] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#1f4e43] opacity-40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Counselor suggestion card */}
            {suggestedCounselor && !loading && (
              <div className="bg-[#f0faf5] border border-[#c3e6d8] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1f4e43] flex items-center justify-center text-white font-bold text-base shrink-0">
                    {suggestedCounselor.counselor_name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1e293b]">{suggestedCounselor.counselor_name}</p>
                    <p className="text-xs text-[#6b7280]">{suggestedCounselor.reason}</p>
                  </div>
                </div>
                <button
                  onClick={handleBookNow}
                  className="w-full rounded-xl bg-[#1f4e43] text-white text-sm font-semibold py-2.5 transition-all hover:bg-[#173a32] hover:shadow-md"
                >
                  Book with {suggestedCounselor.counselor_name} →
                </button>
                {suggestedCounselor.resource_path && (
                  <button
                    onClick={() => { setOpen(false); navigate(suggestedCounselor.resource_path); }}
                    className="w-full rounded-xl border border-[#1f4e43]/30 text-[#1f4e43] text-sm font-medium py-2 transition-all hover:bg-[#f0faf5]"
                  >
                    📚 {suggestedCounselor.resource_label || "View Resources"}
                  </button>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-2 bg-[#f9fbf9] border-t border-[#eef1ed] shrink-0">
            <p className="text-[10px] text-[#9ca3af] text-center leading-relaxed">
              🤍 I'm an AI assistant, not a licensed counselor. For emergencies, please contact a professional directly.
            </p>
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-[#eef1ed] flex gap-2 items-end shrink-0">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me how you're feeling…"
              className="flex-1 resize-none rounded-2xl border border-[#e5e7eb] bg-[#f9fbf9] px-4 py-2.5 text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1f4e43]/25 transition"
              style={{ maxHeight: "100px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                input.trim() && !loading
                  ? "bg-[#1f4e43] text-white hover:bg-[#173a32] hover:scale-105"
                  : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
              }`}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}