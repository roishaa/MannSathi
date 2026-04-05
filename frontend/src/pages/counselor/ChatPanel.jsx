import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../utils/api";

const SESSION_DURATION_MINUTES = 60;

export default function ChatPanel({ selectedSession }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

  const buildLocalDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const [year, month, day] = String(dateStr).split("-").map(Number);
    const [hour, minute] = String(timeStr).slice(0, 5).split(":").map(Number);

    if (
      !year ||
      !month ||
      !day ||
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return null;
    }

    const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
    return isValidDate(dt) ? dt : null;
  };

  const parseSessionStart = (session) => {
    if (!session) return null;

    const possibleDateTimes = [
      session.rawDateTime,
      session.date_time,
      session.dateTime,
      session.sessionStart,
      session.session_start,
    ];

    for (const value of possibleDateTimes) {
      if (!value) continue;

      const normalized = String(value).replace(" ", "T");
      const dt = new Date(normalized);

      if (isValidDate(dt)) {
        return dt;
      }
    }

    const possibleDates = [session.rawDate, session.date, session.session_date];
    const possibleTimes = [session.rawTime, session.time, session.session_time];

    for (const dateValue of possibleDates) {
      for (const timeValue of possibleTimes) {
        const dt = buildLocalDateTime(dateValue, timeValue);
        if (dt) return dt;
      }
    }

    return null;
  };

  const getSenderType = (msg) => {
    const raw =
      msg?.sender_type ??
      msg?.senderType ??
      msg?.from ??
      msg?.sender ??
      "";

    const value = String(raw).toLowerCase();

    if (
      value.includes("counselor") ||
      value.includes("counsellor") ||
      value.includes("doctor") ||
      value.includes("therapist")
    ) {
      return "counselor";
    }

    if (
      value.includes("user") ||
      value.includes("patient") ||
      value.includes("guest")
    ) {
      return "user";
    }

    return "user";
  };

  const getMessageText = (msg) => {
    return msg?.message || msg?.content || msg?.text || "";
  };

  const getMessageTime = (msg) => {
    if (!msg?.created_at) return "";
    const dt = new Date(msg.created_at);
    if (!isValidDate(dt)) return "";
    return dt.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const sessionInfo = useMemo(() => {
    if (!selectedSession) {
      return {
        sessionStart: null,
        sessionEnd: null,
        isLocked: true,
        banner: "No session selected",
      };
    }

    const sessionStart = parseSessionStart(selectedSession);
    const sessionEnd = sessionStart
      ? new Date(sessionStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000)
      : null;

    const now = new Date();
    const status = String(selectedSession.status || "").toLowerCase();

    if (!sessionStart || !sessionEnd) {
      return {
        sessionStart,
        sessionEnd,
        isLocked: true,
        banner: "Session time could not be determined.",
      };
    }

    if (["cancelled", "canceled", "declined"].includes(status)) {
      return {
        sessionStart,
        sessionEnd,
        isLocked: true,
        banner: "This session is no longer available.",
      };
    }

    if (status === "completed") {
      return {
        sessionStart,
        sessionEnd,
        isLocked: true,
        banner: "This session has already ended.",
      };
    }

    if (now < sessionStart) {
      return {
        sessionStart,
        sessionEnd,
        isLocked: true,
        banner: `Chat is locked until ${sessionStart.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}.`,
      };
    }

    if (now >= sessionStart && now <= sessionEnd) {
      return {
        sessionStart,
        sessionEnd,
        isLocked: false,
        banner: "Chat unlocked",
      };
    }

    return {
      sessionStart,
      sessionEnd,
      isLocked: true,
      banner: "This session has ended.",
    };
  }, [selectedSession]);

  const fetchMessages = async () => {
    if (!selectedSession?.id) return;

    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/appointments/${selectedSession.id}/messages`);
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error("Failed to load counselor chat messages:", err);
      setError(err?.response?.data?.message || "Could not load chat messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedSession?.id || !newMessage.trim() || sessionInfo.isLocked)
      return;

    try {
      setSending(true);
      setError("");

      await api.post(`/appointments/${selectedSession.id}/messages`, {
        message: newMessage.trim(),
      });

      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send counselor message:", err);
      setError(err?.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!selectedSession?.id) return;

    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedSession) {
    return (
      <div className="rounded-3xl border border-[#e5e7eb] bg-[#fcfcfb] p-10 text-center">
        <div className="text-5xl mb-4">💬</div>
        <div className="text-2xl font-semibold text-[#1f4e43]">
          No session selected
        </div>
        <div className="text-[#6b7280] mt-2">
          Select a booked session to open that patient’s chat.
        </div>
      </div>
    );
  }

  const patientName =
    selectedSession.patient ||
    selectedSession.name ||
    selectedSession.user_name ||
    selectedSession.user?.name ||
    "Patient";

  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-[#fcfcfb] overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#e5e7eb]">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#7c7b77] font-semibold">
            Active Session
          </div>
          <div className="text-2xl font-semibold text-[#1f4e43]">
            {patientName}
          </div>
          <div className="text-sm text-[#6b7280] mt-1">
            {selectedSession.date || selectedSession.rawDate || "Not set"} ·{" "}
            {selectedSession.time || selectedSession.rawTime || "Not set"}
          </div>
        </div>

        <div
          className={`px-4 py-2 rounded-full text-sm font-medium border ${
            sessionInfo.isLocked
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {sessionInfo.banner}
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="px-5 pt-4">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e5e7eb]">
            <div className="font-semibold text-[#111827]">{patientName}</div>
            <div className="text-sm text-[#6b7280]">Chat with patient</div>
          </div>

          <div className="h-[280px] overflow-y-auto px-4 py-4 bg-[#fafafa]">
            {loading ? (
              <div className="text-sm text-[#6b7280]">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-[#6b7280]">No messages yet.</div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  const senderType = getSenderType(msg);
                  const isCounselor = senderType === "counselor";
                  const label = isCounselor ? "COUNSELOR" : "USER";
                  const text = getMessageText(msg);
                  const time = getMessageTime(msg);

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex ${
                        isCounselor ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm border ${
                          isCounselor
                            ? "bg-[#dff3e4] text-[#1f4d35] border-[#b9dec3]"
                            : "bg-white text-[#1e293b] border-[#e5e7eb]"
                        }`}
                      >
                        <div className="text-[11px] uppercase font-semibold opacity-70 mb-1">
                          {label}
                        </div>
                        <div className="whitespace-pre-wrap break-words">
                          {text}
                        </div>
                        {time && (
                          <div className="text-[10px] opacity-60 mt-1">
                            {time}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#e5e7eb] bg-white flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={sessionInfo.isLocked || sending}
              className="flex-1 rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none resize-none disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
              placeholder={
                sessionInfo.isLocked
                  ? "Chat is unavailable right now..."
                  : "Type a message..."
              }
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim() || sessionInfo.isLocked}
              className="rounded-2xl bg-[#1f4e43] text-white px-6 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}