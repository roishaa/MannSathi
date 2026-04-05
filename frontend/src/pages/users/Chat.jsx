import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API } from "../../utils/api";

const SESSION_DURATION_MINUTES = 60;

export default function Chat() {
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
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

  const parseSessionStart = (appt) => {
    if (!appt) return null;

    const possibleDateTimes = [
      appt.date_time,
      appt.dateTime,
      appt.rawDateTime,
      appt.sessionStart,
      appt.session_start,
    ];

    for (const value of possibleDateTimes) {
      if (!value) continue;

      const normalized = String(value).replace(" ", "T");
      const dt = new Date(normalized);

      if (isValidDate(dt)) {
        return dt;
      }
    }

    const possibleDates = [appt.date, appt.rawDate, appt.session_date];
    const possibleTimes = [appt.time, appt.rawTime, appt.session_time];

    for (const dateValue of possibleDates) {
      for (const timeValue of possibleTimes) {
        const dt = buildLocalDateTime(dateValue, timeValue);
        if (dt) return dt;
      }
    }

    return null;
  };

  const loadAppointment = async () => {
    if (!id) return;

    try {
      setAppointmentLoading(true);

      const res = await API.get("/user/appointments");
      const rawAppointments = Array.isArray(res.data)
        ? res.data
        : res.data?.appointments || res.data?.data || [];

      const found = rawAppointments.find((item) => String(item.id) === String(id));
      setAppointment(found || null);
    } catch (err) {
      console.error("Failed to load appointment info:", err);
      setAppointment(null);
    } finally {
      setAppointmentLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/appointments/${id}/messages`);
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error("Failed to load user chat messages:", err);
      setError(err?.response?.data?.message || "Could not load chat messages.");
    } finally {
      setLoading(false);
    }
  };

  const appointmentInfo = useMemo(() => {
    if (!appointment) {
      return {
        sessionStart: null,
        sessionEnd: null,
        status: "",
      };
    }

    const sessionStart = parseSessionStart(appointment);
    const sessionEnd = sessionStart
      ? new Date(sessionStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000)
      : null;

    return {
      sessionStart,
      sessionEnd,
      status: String(appointment.status || "").toLowerCase(),
    };
  }, [appointment]);

  const chatState = useMemo(() => {
    const now = new Date();
    const { sessionStart, sessionEnd, status } = appointmentInfo;

    if (!sessionStart || !sessionEnd) {
      return {
        isLocked: true,
        bannerType: "error",
        bannerText: "Session time could not be determined.",
      };
    }

    if (["cancelled", "canceled", "declined"].includes(status)) {
      return {
        isLocked: true,
        bannerType: "error",
        bannerText: "This session is no longer available for chat.",
      };
    }

    if (status === "completed") {
      return {
        isLocked: true,
        bannerType: "error",
        bannerText: "This session has already ended.",
      };
    }

    if (now < sessionStart) {
      return {
        isLocked: true,
        bannerType: "error",
        bannerText: `Chat is locked until ${sessionStart.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}.`,
      };
    }

    if (now >= sessionStart && now <= sessionEnd) {
      return {
        isLocked: false,
        bannerType: "success",
        bannerText: "Session is live now. You can chat with your counselor.",
      };
    }

    return {
      isLocked: true,
      bannerType: "error",
      bannerText: "This session time has ended.",
    };
  }, [appointmentInfo]);

  const handleSend = async () => {
    if (chatState.isLocked || !newMessage.trim() || !id) return;

    try {
      setSending(true);
      setError("");

      await API.post(`/appointments/${id}/messages`, {
        message: newMessage.trim(),
      });

      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send user message:", err);
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
    if (!id) return;

    loadAppointment();
    fetchMessages();

    const interval = setInterval(() => {
      loadAppointment();
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const counselorName =
    appointment?.counselor_name ||
    appointment?.counselor?.name ||
    appointment?.counselor?.full_name ||
    "Counselor";

  return (
    <div className="min-h-screen bg-[#f8f6f0] px-5 md:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/users/dashboard" className="text-sm underline text-[#1f4e43]">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
        <h1 className="text-xl font-semibold text-[#1e293b]">Session Chat</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Private chat with your counselor.
        </p>

        {appointmentLoading ? (
          <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#6b7280]">
            Loading session details...
          </div>
        ) : (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm border ${
              chatState.bannerType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {chatState.bannerText}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-5 rounded-3xl border border-[#e5e7eb] bg-[#f9fafb] p-4 h-[420px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {!loading && messages.length === 0 && !error && (
              <div className="text-xs text-[#6b7280] text-center mt-8">
                No messages yet.
              </div>
            )}

            {messages.map((msg, index) => {
              const senderType = String(msg.sender_type || "").toLowerCase();
              const isUser = senderType === "user";
              const label = isUser ? "USER" : "COUNSELOR";
              const messageText = msg.message || msg.content || "";
              const timestamp = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm border ${
                      isUser
                        ? "bg-[#dff3e4] text-[#1f4d35] border-[#b9dec3]"
                        : "bg-white text-[#1e293b] border-[#e5e7eb]"
                    }`}
                  >
                    <div className="text-[11px] uppercase font-semibold opacity-70 mb-1">
                      {label}
                    </div>

                    <div className="whitespace-pre-wrap break-words">
                      {messageText}
                    </div>

                    {timestamp && (
                      <div className="text-[10px] opacity-60 mt-1">
                        {timestamp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={chatState.isLocked || sending}
              className="flex-1 rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none resize-none disabled:bg-[#f3f4f6] disabled:text-[#9ca3af]"
              placeholder={
                chatState.isLocked
                  ? "Chat is unavailable right now..."
                  : `Message ${counselorName}...`
              }
            />
            <button
              onClick={handleSend}
              disabled={chatState.isLocked || sending || !newMessage.trim()}
              className="rounded-2xl bg-[#1f4e43] text-white px-5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}