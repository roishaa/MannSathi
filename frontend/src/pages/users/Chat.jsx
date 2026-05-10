import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API } from "../../utils/api";

const SESSION_DURATION_MINUTES = 60;

export default function Chat() {
  const { id } = useParams();

  const userToken =
    localStorage.getItem("user_token") || localStorage.getItem("auth_token");
  const userHeaders = userToken
    ? { Authorization: `Bearer ${userToken}` }
    : undefined;

  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);
  const pollRef = useRef(false);

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
      if (!dateValue) continue;
      for (const timeValue of possibleTimes) {
        if (!timeValue) continue;
        const dt = buildLocalDateTime(dateValue, timeValue);
        if (dt) return dt;
      }
    }

    console.warn("Could not parse session start from appointment:", {
      date_time: appt.date_time,
      date: appt.date,
      time: appt.time,
      rawDate: appt.rawDate,
      rawTime: appt.rawTime,
    });

    return null;
  };

  const loadAppointment = async () => {
    if (!id) return;

    try {
      setAppointmentLoading(true);

      const res = await API.get("/user/appointments", {
        headers: userHeaders,
      });

      const rawAppointments = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.appointments || res.data?.data || [];

      let found = rawAppointments.find((item) => String(item.id) === String(id));

      if (!found) {
        const sessionRes = await API.get("/user/sessions", {
          headers: userHeaders,
        });

        const rawSessions = Array.isArray(sessionRes.data)
          ? sessionRes.data
          : sessionRes.data?.items ||
            sessionRes.data?.sessions ||
            sessionRes.data?.data ||
            [];

        const session = rawSessions.find((item) => String(item.id) === String(id));

        if (session) {
          found = {
            id: session.id,
            status: session.status,
            date_time: session.date_time,
            date: session.date,
            time: session.time,
            counselor_name:
              session.counselor_name || session.counselor?.name || "Counselor",
            counselor: session.counselor,
          };
        }
      }

      if (!found) {
        console.warn(
          "Appointment not found in response. ID:",
          id,
          "Available IDs:",
          rawAppointments.map((a) => a.id)
        );
      }

      setAppointment(found || null);
    } catch (err) {
      console.error("Failed to load appointment info:", err);
      setAppointment(null);
    } finally {
      setAppointmentLoading(false);
    }
  };

  const fetchMessages = async (isFirst = false) => {
    if (!id) return;

    try {
      if (isFirst) setLoading(true);
      setError("");

      const res = await API.get(`/appointments/${id}/messages`, {
        headers: userHeaders,
      });

      const msgs = res.data?.messages || [];
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load user chat messages:", {
        error: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      setError(err?.response?.data?.message || "Could not load chat messages.");
    } finally {
      if (isFirst) setLoading(false);
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

      await API.post(
        `/appointments/${id}/messages`,
        { message: newMessage.trim() },
        { headers: userHeaders }
      );

      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send user message:", {
        error: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
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
    if (pollRef.current) return;
    pollRef.current = true;

    loadAppointment();
    fetchMessages(true);

    const interval = setInterval(() => {
      loadAppointment();
      fetchMessages(false);
    }, 3000);

    return () => {
      clearInterval(interval);
      pollRef.current = false;
    };
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
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8fc] via-[#eef7f3] to-[#f9fafb] px-4 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <Link
            to="/users/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#d7e3dc] bg-white px-4 py-2 text-sm font-medium text-[#1f4e43] shadow-sm transition hover:bg-[#f4fbf8]"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="border-b border-[#eef2f7] bg-gradient-to-r from-[#1f4e43] to-[#2f6a5b] px-6 py-5 text-white md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Session Chat</h1>
                <p className="mt-1 text-sm text-white/80">
                  Private conversation with {counselorName}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
                <div className="text-white/70">Session with</div>
                <div className="font-semibold">{counselorName}</div>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 md:px-8 md:py-6">
            {appointmentLoading ? (
              <div className="mb-5 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 text-sm text-[#64748b]">
                Loading session details...
              </div>
            ) : (
              <div
                className={`mb-5 rounded-2xl border px-4 py-4 shadow-sm ${
                  chatState.bannerType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <div className="font-medium">{chatState.bannerText}</div>

                {appointment && (
                  <div className="mt-2 text-xs opacity-80">
                    Session:{" "}
                    {appointment.date ||
                      appointmentInfo.sessionStart?.toDateString()}{" "}
                    at{" "}
                    {appointment.time ||
                      appointmentInfo.sessionStart?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 shadow-sm">
                {error}
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="rounded-[24px] border border-[#e9eef5] bg-[#f8fafc] p-5 shadow-sm">
                <h2 className="text-base font-semibold text-[#0f172a]">
                  Chat Details
                </h2>

                <div className="mt-4 space-y-4 text-sm">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                      Counselor
                    </div>
                    <div className="mt-1 font-semibold text-[#1e293b]">
                      {counselorName}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                      Status
                    </div>
                    <div className="mt-1 font-semibold text-[#1e293b]">
                      {appointment?.status || "Pending"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                      Duration
                    </div>
                    <div className="mt-1 font-semibold text-[#1e293b]">
                      {SESSION_DURATION_MINUTES} minutes
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                      Privacy
                    </div>
                    <div className="mt-1 text-[#475569]">
                      This chat is only for you and your counselor.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex h-[72vh] min-h-[560px] flex-col rounded-[24px] border border-[#e9eef5] bg-[#fcfcfd] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-[#0f172a]">
                      Conversation
                    </h2>
                    <p className="text-xs text-[#64748b]">
                      Send messages during your active session
                    </p>
                  </div>

                  <div className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-medium text-[#1f4e43]">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[linear-gradient(to_bottom,#f8fafc,#ffffff)] px-4 py-5 md:px-5">
                  {loading ? (
                    <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 && !error ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-[#eef7f3] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1f4e43]">
                        Start Conversation
                      </div>
                      <p className="mt-4 max-w-sm text-sm text-[#64748b]">
                        No messages yet. Once your session is active, you can begin
                        chatting here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const senderType = String(
                          msg.sender_type || ""
                        ).toLowerCase().trim();

                        const isUser =
                          senderType === "user" ||
                          senderType === "patient" ||
                          senderType === "guest";

                        const label = isUser ? "You" : counselorName;
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
                            className={`flex ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-[22px] px-4 py-3 shadow-sm ${
                                isUser
                                  ? "rounded-br-md bg-[#1f4e43] text-white"
                                  : "rounded-bl-md border border-[#e5e7eb] bg-white text-[#1e293b]"
                              }`}
                            >
                              <div
                                className={`mb-1 text-[11px] font-semibold ${
                                  isUser ? "text-white/70" : "text-[#64748b]"
                                }`}
                              >
                                {label}
                              </div>

                              <div className="whitespace-pre-wrap break-words text-sm leading-6">
                                {messageText}
                              </div>

                              {timestamp && (
                                <div
                                  className={`mt-2 text-[10px] ${
                                    isUser ? "text-white/70" : "text-[#94a3b8]"
                                  }`}
                                >
                                  {timestamp}
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

                <div className="border-t border-[#eef2f7] bg-white px-4 py-4 md:px-5">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 rounded-[22px] border border-[#dbe3ea] bg-[#f8fafc] p-2 focus-within:border-[#1f4e43] focus-within:bg-white">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        disabled={chatState.isLocked || sending}
                        placeholder={
                          chatState.isLocked
                            ? "Chat is unavailable right now..."
                            : `Message ${counselorName}...`
                        }
                        className="w-full resize-none bg-transparent px-3 py-2 text-sm text-[#1e293b] outline-none placeholder:text-[#94a3b8] disabled:cursor-not-allowed disabled:text-[#94a3b8]"
                      />
                    </div>

                    <button
                      onClick={handleSend}
                      disabled={chatState.isLocked || sending || !newMessage.trim()}
                      className="h-[54px] rounded-[20px] bg-[#1f4e43] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173d35] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-[#94a3b8]">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}