import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { API } from "../utils/api";

export default function GuestSession() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(false);

  const sessionLink = useMemo(() => {
    if (!id || !token) return "";
    return `${window.location.origin}/guest-session/${id}?token=${encodeURIComponent(token)}`;
  }, [id, token]);

  useEffect(() => {
    const fetchGuestSession = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get(`/guest-session/${id}?token=${encodeURIComponent(token || "")}`);
        setBooking(res.data?.booking || null);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          "Could not load guest session. The link may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchGuestSession();
    } else {
      setLoading(false);
      setError("Missing session token.");
    }
  }, [id, token]);

  const fetchMessages = async (appointmentId) => {
    if (!appointmentId || !token) return;
    try {
      setChatLoading(true);
      setChatError("");
      const res = await API.get(
        `/guest/appointments/${appointmentId}/messages?token=${encodeURIComponent(token)}`
      );
      setMessages(res.data?.messages || []);
    } catch (err) {
      setChatError(err?.response?.data?.message || "Could not load chat messages right now.");
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !token || !booking?.appointment_id) return;
    if (pollRef.current) return;
    pollRef.current = true;

    const appointmentId = booking.appointment_id;
    fetchMessages(appointmentId);

    const interval = setInterval(() => {
      fetchMessages(appointmentId);
    }, 3000);

    return () => {
      clearInterval(interval);
      pollRef.current = false;
    };
  }, [id, token, booking?.appointment_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopyLink = async () => {
    if (!sessionLink) return;
    try {
      await navigator.clipboard.writeText(sessionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      alert("Could not copy the private session link. Please copy it manually.");
    }
  };

  const handleSendMessage = async () => {
    const appointmentId = booking?.appointment_id;
    if (!newMessage.trim() || !appointmentId || !token) return;
    try {
      setSending(true);
      setChatError("");
      await API.post(`/guest/appointments/${appointmentId}/messages`, {
        message: newMessage.trim(),
        token,
      });
      setNewMessage("");
      fetchMessages(booking?.appointment_id);
    } catch (err) {
      setChatError(err?.response?.data?.message || "Could not send your message.");
    } finally {
      setSending(false);
    }
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Join Video via Jitsi — no API call needed ──
  const handleJoinVideo = () => {
    const appointmentId = booking?.appointment_id;
    if (!appointmentId) return;
    const roomUrl = `https://meet.jit.si/mannsathi-session-${appointmentId}`;
    window.open(roomUrl, "_blank", "noopener,noreferrer");
  };

  const isVideoSession = String(booking?.session_type || "").toLowerCase() === "video";

  const isSessionLive = useMemo(() => {
    if (!booking?.date || !booking?.time) return false;
    try {
      const [year, month, day] = String(booking.date).split("-").map(Number);
      const [hour, minute] = String(booking.time).slice(0, 5).split(":").map(Number);
      const start = new Date(year, month - 1, day, hour, minute, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const now = new Date();
      return now >= start && now <= end;
    } catch {
      return false;
    }
  }, [booking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-[#efe7dc] shadow-[0_18px_60px_rgba(0,0,0,0.08)] px-8 py-10 text-center max-w-lg w-full">
          <h2 className="text-xl font-semibold text-neutral-900">Loading session...</h2>
          <p className="mt-3 text-sm text-neutral-500">Please wait while we fetch your booking details.</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-[#efe7dc] shadow-[0_18px_60px_rgba(0,0,0,0.08)] px-8 py-10 text-center max-w-lg w-full">
          <h2 className="text-xl font-semibold text-red-600">Session unavailable</h2>
          <p className="mt-3 text-sm text-neutral-600">{error}</p>
          <Link to="/book-appointment" className="inline-flex mt-6 items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-6 py-2.5 text-sm font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition">
            Book Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] px-4 py-8 xl:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Waiting Room</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Your booking is confirmed. Please stay on this page until your counselor joins.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 space-y-4">

            {/* Session Details */}
            <div className="bg-white rounded-2xl border border-[#e8e1d6] px-5 py-5">
              <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">Session Details</h2>
              <dl className="space-y-2 text-sm">
                {[
                  ["Guest", booking.guest_name],
                  ["Email", booking.guest_email],
                  ["Phone", booking.guest_phone || "Not provided"],
                  ["Date", booking.date],
                  ["Time", booking.time],
                  ["Type", isVideoSession ? "🎥 Video Call" : "💬 Chat"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="text-neutral-400 w-14 shrink-0">{label}</dt>
                    <dd className="text-neutral-800 font-medium break-words min-w-0">{value}</dd>
                  </div>
                ))}
                <div className="flex gap-2">
                  <dt className="text-neutral-400 w-14 shrink-0">Payment</dt>
                  <dd className="text-green-700 font-semibold">Paid</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-neutral-400 w-14 shrink-0">Status</dt>
                  <dd className="text-[#215c4c] font-semibold">{booking.booking_status}</dd>
                </div>
              </dl>
            </div>

            {/* ── Video Join Card (video sessions only) ── */}
            {isVideoSession && (
              <div className="bg-white rounded-2xl border border-[#dce8df] px-5 py-5">
                <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">🎥 Video Session</h2>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                  {isSessionLive
                    ? "Your session is live! Click below to join the video call."
                    : "Your video session link will be available at session time."}
                </p>
                {isSessionLive ? (
                  <button
                    type="button"
                    onClick={handleJoinVideo}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-4 py-2.5 text-sm font-semibold text-[#305b39] shadow-[0_3px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#89ad8f] transition"
                  >
                    🎥 Join Video Call
                  </button>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    ⏳ Video link will be available at session time.
                  </div>
                )}
              </div>
            )}

            {/* Counselor */}
            <div className="bg-white rounded-2xl border border-[#e8e1d6] px-5 py-5">
              <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">Counselor</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="text-neutral-400 w-14 shrink-0">Name</dt>
                  <dd className="text-neutral-800 font-medium">{booking.counselor?.name || "Assigned counselor"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-neutral-400 w-14 shrink-0">Status</dt>
                  <dd className="text-amber-700 font-semibold">Waiting to join</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-xl bg-[#f6faf7] border border-[#dfeee3] px-3 py-3">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your counselor will see this booking in their dashboard. When they join, you can
                  {isVideoSession ? " start the video call using the button above." : " chat using the session below."}
                </p>
              </div>
            </div>

            {/* Private Session Link */}
            <div className="bg-white rounded-2xl border border-[#dfe7df] px-5 py-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Private Link</h2>
                {copied && (
                  <span className="inline-flex items-center rounded-full bg-[#e3f3e6] border border-[#89ad8f] px-2 py-0.5 text-xs font-semibold text-[#215c4c]">Copied</span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-3 leading-relaxed">Save this link to reopen your waiting room if you close this tab.</p>
              <div className="rounded-xl border border-[#e5ece6] bg-[#f8faf9] px-3 py-2 text-xs text-neutral-600 break-all mb-3">{sessionLink}</div>
              <button type="button" onClick={handleCopyLink}
                className="w-full inline-flex items-center justify-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-4 py-2 text-sm font-semibold text-[#305b39] shadow-[0_3px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#89ad8f] transition">
                Copy Session Link
              </button>
            </div>
          </aside>

          {/* ── MAIN AREA ── */}
          <main className="flex-1 min-w-0">

            {/* Video session main area */}
            {isVideoSession ? (
              <div className="bg-white rounded-2xl border border-[#dce8df] flex flex-col items-center justify-center text-center px-8 py-16" style={{ minHeight: "680px" }}>
                <div className="text-6xl mb-4">🎥</div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Video Call Session</h2>
                <p className="text-sm text-neutral-500 max-w-sm mb-6">
                  {isSessionLive
                    ? "Your counselor is ready. Click the button below to join the video call."
                    : "Your video session hasn't started yet. Please wait until the scheduled time."}
                </p>
                {isSessionLive && (
                  <button type="button" onClick={handleJoinVideo}
                    className="inline-flex items-center gap-2 rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-7 py-3 text-sm font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition">
                    🎥 Join Video Call
                  </button>
                )}
              </div>
            ) : (
              /* Chat session main area */
              <div className="bg-white rounded-2xl border border-[#dce8df] flex flex-col h-full" style={{ minHeight: "680px" }}>

                <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Session Chat</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Messages with your counselor will appear here in real time.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {chatLoading && <span className="text-xs text-neutral-400 font-medium">Refreshing...</span>}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dde9df] bg-[#f4faf5] px-3 py-1 text-xs font-semibold text-[#2d5e4c]">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Waiting for counselor
                    </span>
                  </div>
                </div>

                {chatError && (
                  <div className="mx-6 mt-4 rounded-xl border border-[#f1d3d3] bg-[#fff7f7] px-4 py-3 text-sm text-[#9a3b3b]">{chatError}</div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3" style={{ minHeight: "520px", maxHeight: "580px" }}>
                  {!chatLoading && messages.length === 0 && !chatError && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16">
                      <div className="w-14 h-14 rounded-full bg-[#f0f7f1] border border-[#d5e9d9] flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-[#5a9b6d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-neutral-500">No messages yet</p>
                      <p className="text-xs text-neutral-400 mt-1 max-w-xs">Once your counselor joins, your conversation will appear here.</p>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const senderType = String(msg.sender_type || "").toLowerCase();
                    const isGuest = senderType === "guest" || senderType === "user" || senderType === "patient";
                    const label = isGuest ? "You" : booking.counselor?.name || "Counselor";
                    return (
                      <div key={msg.id} className={`flex ${isGuest ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[72%] ${isGuest ? "" : "flex items-end gap-2"}`}>
                          {!isGuest && (
                            <div className="w-7 h-7 rounded-full bg-[#dff3e4] border border-[#b9dec3] flex items-center justify-center shrink-0 mb-1">
                              <span className="text-[10px] font-bold text-[#2d5e4c]">{label.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <div className={`text-[11px] font-semibold mb-1 ${isGuest ? "text-right text-neutral-400" : "text-neutral-400"}`}>{label}</div>
                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isGuest ? "bg-[#dff3e4] text-[#1f4d35] border border-[#b9dec3] rounded-br-md" : "bg-[#f7f7f7] text-neutral-800 border border-[#e5e7eb] rounded-bl-md"}`}>
                              <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-6 py-4 border-t border-[#f0f0f0]">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleMessageKeyDown}
                      rows={2}
                      placeholder="Type your message… (Enter to send)"
                      className="flex-1 resize-none rounded-2xl border border-[#d8e5db] bg-[#fbfdfb] px-4 py-3 text-sm text-neutral-800 outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#dfeee3] placeholder:text-neutral-400 transition"
                    />
                    <button type="button" onClick={handleSendMessage} disabled={sending || !newMessage.trim()}
                      className="inline-flex items-center gap-2 rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-6 py-3 text-sm font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
                      {sending ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending</>
                      ) : (
                        <>Send<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg></>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-neutral-400 pl-1">
                    Press <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-[10px] font-mono">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-[10px] font-mono">Shift+Enter</kbd> for new line
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}