import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  /* =========================
      USER
  ========================= */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const userName = user?.pseudonym || user?.name || user?.full_name || "LotusMind 🌸";
  const userEmail = user?.email || "user@email.com";

  /* =========================
      MOOD
  ========================= */
  const [moodItems, setMoodItems] = useState([]);
  const [moodLoading, setMoodLoading] = useState(false);

  const loadMood = async () => {
    setMoodLoading(true);
    try {
      const res = await api.get("/user/mood-entries?range=7d");
      setMoodItems(res.data?.items || []);
    } catch (e) {
      console.log("Mood fetch failed:", e?.response?.status, e?.response?.data || e.message);
      setMoodItems([]);
    } finally {
      setMoodLoading(false);
    }
  };

  useEffect(() => {
    loadMood();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.refreshMood]);

  const todayMood = moodItems?.[0];

  /* =========================
      SESSIONS
  ========================= */
  const [nextSession, setNextSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const pollStartedRef = useRef(false);

  const normalizeStatus = (status) => (status || "").toLowerCase().trim();

  const normalizeSession = (item) => {
    if (!item) return null;

    const rawDateTime =
      item.date_time ||
      item.appointment_datetime ||
      item.appointment_date_time ||
      null;

    const rawDate =
      item.date ||
      item.appointment_date ||
      (rawDateTime ? new Date(rawDateTime).toISOString().split("T")[0] : null);

    const rawTime =
      item.time ||
      item.appointment_time ||
      (rawDateTime
        ? new Date(rawDateTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : null);

    return {
      id: item.id,
      counselor_id: item.counselor_id || item.counselor?.id || null,
      counselor_name:
        item.counselor_name ||
        item.counselor?.name ||
        item.counsellor?.name ||
        "Counselor not assigned",
      date: rawDate,
      time: rawTime,
      type: item.type || item.session_type || "chat",
      status: item.status || "pending",
      payment_status: item.payment_status || "paid",
      meeting_link: item.meeting_link || item.meet_link || null,
    };
  };

  const loadNextSession = async () => {
    setSessionLoading(true);
    try {
      const res = await api.get("/user/appointments/next");
      const appointment = res.data?.item || res.data?.data || null;
      setNextSession(normalizeSession(appointment));
    } catch (e) {
      console.log("Next session fetch failed:", e?.response?.status, e?.response?.data || e.message);
      setNextSession(null);
    } finally {
      setSessionLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get("/user/sessions");
      const rawItems =
        res.data?.items ||
        res.data?.sessions ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setSessions((rawItems || []).map(normalizeSession).filter(Boolean));
    } catch (e) {
      console.log("Sessions fetch failed:", e?.response?.status, e?.response?.data || e.message);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadNextSession();
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pollStartedRef.current) return;
    pollStartedRef.current = true;

    const t = setInterval(() => {
      loadNextSession();
      loadSessions();
    }, 10000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
      45-MIN SESSION TIME LOGIC
  ========================= */
  const getSessionStart = (session) => {
    if (!session?.date || !session?.time) return null;
    const start = new Date(`${session.date}T${session.time}`);
    return isNaN(start.getTime()) ? null : start;
  };

  const getSessionEnd = (session) => {
    const start = getSessionStart(session);
    if (!start) return null;
    return new Date(start.getTime() + 45 * 60 * 1000);
  };

  const now = new Date();

  const isPastByTime = (session) => {
    const end = getSessionEnd(session);
    return end ? now > end : false;
  };

  const isLiveByTime = (session) => {
    const start = getSessionStart(session);
    const end = getSessionEnd(session);
    return start && end ? now >= start && now <= end : false;
  };

  const isUpcomingByTime = (session) => {
    const start = getSessionStart(session);
    return start ? now < start : false;
  };

  const upcoming = sessions.filter((s) => {
    const st = normalizeStatus(s.status);
    return (st === "pending" || st === "confirmed") && !isPastByTime(s);
  });

  const liveSession = upcoming.find((s) => isLiveByTime(s));
  const nextUpcomingSession = upcoming.find((s) => isUpcomingByTime(s));

  const displaySession = liveSession || nextSession || nextUpcomingSession || null;

  const displaySessionStatus = normalizeStatus(displaySession?.status);
  const hasCounselorAssigned = Boolean(displaySession?.counselor_id);
  const isSessionConfirmed = displaySessionStatus === "confirmed";
  const isPaymentPaid = (displaySession?.payment_status || "").toLowerCase() === "paid";

  const sessionStart = getSessionStart(displaySession);
  const sessionEnd = getSessionEnd(displaySession);

  const isBeforeSession = sessionStart ? now < sessionStart : false;
  const isWithinSessionTime =
    sessionStart && sessionEnd ? now >= sessionStart && now <= sessionEnd : false;
  const isAfterSession = sessionEnd ? now > sessionEnd : false;

  const chatUnlocked = Boolean(
    displaySession &&
      hasCounselorAssigned &&
      isSessionConfirmed &&
      isPaymentPaid &&
      isWithinSessionTime
  );

  const formatSessionTime = (session) => {
    if (!session?.date || !session?.time) return "the scheduled time";
    return `${session.date} at ${session.time}`;
  };

  /* =========================
      LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  /* =========================
      NAV
  ========================= */
  const navItems = [
    { label: "Dashboard", to: "/users/dashboard", icon: "🏠" },
    { label: "Search Counselor", to: "/search-doctor", icon: "🧑‍⚕️" },
    { label: "Sessions", to: "/sessions", icon: "📅" },
    { label: "Payments", to: "/payments", icon: "💳" },
    { label: "Settings", to: "/settings", icon: "⚙️" },
  ];

  const isActive = (to) => location.pathname === to;

  const badgeClass = (status) => {
    const s = normalizeStatus(status);
    const base = "text-[11px] rounded-full px-3 py-1 border whitespace-nowrap capitalize";

    if (s === "confirmed") return `${base} bg-emerald-50 border-emerald-200 text-emerald-700`;
    if (s === "pending") return `${base} bg-amber-50 border-amber-200 text-amber-700`;
    if (s === "completed") return `${base} bg-green-50 border-green-200 text-green-700`;
    if (s === "cancelled") return `${base} bg-gray-50 border-gray-200 text-gray-700`;

    return `${base} bg-[#f9fafb] border-[#e5e7eb] text-[#374151]`;
  };

  const quickActions = [
    { title: "Book session", desc: "Find a counselor", to: "/users/appointments/book", icon: "📌" },
    { title: "My sessions", desc: "Upcoming & history", to: "/sessions", icon: "🗓️" },
    { title: "Mood check-in", desc: "Track emotions", to: "/users/mood-check", icon: "🙂" },
  ];

  const chatAction = {
    title: "Chat",
    desc: chatUnlocked ? "Message your counselor" : "Available only during session time",
    to: chatUnlocked ? `/chat/${displaySession?.id}` : "#",
    icon: "💬",
    locked: !chatUnlocked,
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      happy: "😊",
      sad: "😢",
      anxious: "😰",
      calm: "😌",
      angry: "😠",
      neutral: "😐",
      excited: "🤩",
      stressed: "😣",
      tired: "😴",
      grateful: "🙏",
    };
    return moodMap[mood?.toLowerCase()] || "🙂";
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-[#e5e7eb]">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm">
            ☰
          </button>
          <div className="font-serif font-semibold text-[#1f4e43]">MannSathi</div>
          <button onClick={handleLogout} className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm">
            Logout
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#215c4c] text-white px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="font-serif font-semibold text-xl tracking-wide">MannSathi</div>
              <button onClick={() => setOpen(false)} className="text-white text-lg">
                ✕
              </button>
            </div>

            <div className="mt-6 bg-white/10 rounded-3xl p-5 border border-white/15">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-[#d6ebe2]">{userEmail}</p>
              <div className="mt-3 text-xs text-[#d6ebe2]">
                Mood: <span className="font-semibold text-white">{moodLoading ? "loading..." : todayMood?.mood || "not checked"}</span>
              </div>
            </div>

            <nav className="mt-6 space-y-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition ${
                    isActive(item.to) ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-sm" : "hover:bg-[#315d51]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <button onClick={handleLogout} className="mt-8 text-xs underline text-[#dfeee7]">
              Logout
            </button>
          </aside>
        </div>
      )}

      <aside className="w-72 hidden md:flex bg-gradient-to-b from-[#255b4e] to-[#466f64] text-white px-6 py-8 flex-col justify-between">
        <div>
          <div className="relative mb-10 select-none cursor-default">
            <div className="w-44 h-12 bg-[#1e4940] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">MannSathi</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/15 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">🧑</div>
              <div>
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-[#d6ebe2]">{userEmail}</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-[#d6ebe2] flex items-center justify-between gap-2">
              <span>
                Mood: <span className="font-semibold text-white">{moodLoading ? "loading..." : todayMood?.mood || "not checked"}</span>
              </span>
              <Link to="/users/mood-check" className="underline text-[#dfeee7] hover:text-white">
                update
              </Link>
            </div>

            <Link
              to="/users/appointments/book"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white text-[#1f4e43] text-xs font-semibold px-4 py-2.5 shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:-translate-y-[1px] transition"
            >
              Book a session
            </Link>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition ${
                  isActive(item.to) ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-sm" : "hover:bg-[#315d51]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button onClick={handleLogout} className="text-xs underline text-[#dfeee7] text-left hover:text-white">
          Logout
        </button>
      </aside>

      <main className="flex-1 px-4 md:px-10 py-6 md:py-10 pt-24 md:pt-10 bg-gradient-to-br from-[#f8f6f0] via-[#faf9f7] to-[#f3f0eb]">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent">
                Welcome back, {userName} 👋
              </h1>
              <p className="mt-2 text-base text-[#666] font-medium">Your mental wellness journey starts here</p>
            </div>
            <div className="flex gap-3 flex-wrap md:flex-nowrap">
              <Link to="/users/mood-check" className="px-5 py-2 bg-white border border-[#e5e7eb] rounded-full text-sm font-medium hover:bg-[#f9fafb] transition shadow-sm">
                📊 Update mood
              </Link>
              <Link
                to="/users/appointments/book"
                className="px-5 py-2 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-full text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition shadow-md"
              >
                ➕ Book session
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-[#e5e7eb] shadow-sm hover:shadow-md transition">
              <div className="text-xs uppercase tracking-wider text-[#999] font-semibold">Today&apos;s Mood</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{moodLoading ? "..." : todayMood?.mood || "—"}</p>
              <p className="text-[11px] text-[#999] mt-1">Last checked today</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e5e7eb] shadow-sm hover:shadow-md transition">
              <div className="text-xs uppercase tracking-wider text-[#999] font-semibold">Upcoming Sessions</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{sessionsLoading ? "..." : upcoming.length}</p>
              <p className="text-[11px] text-[#999] mt-1">{upcoming.length === 1 ? "coming up" : "scheduled"}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e5e7eb] shadow-sm hover:shadow-md transition">
              <div className="text-xs uppercase tracking-wider text-[#999] font-semibold">Mood Track</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{moodLoading ? "..." : moodItems.length}</p>
              <p className="text-[11px] text-[#999] mt-1">entries this week</p>
            </div>

            <div className="bg-gradient-to-br from-[#f0f9f7] to-[#e8f4f1] rounded-2xl p-4 border border-[#d5e8e4] shadow-sm">
              <div className="text-xs uppercase tracking-wider text-[#1f4e43] font-semibold">Status</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{displaySession ? "Booked" : "Free"}</p>
              <p className="text-[11px] text-[#666] mt-1">{displaySession ? "Session scheduled" : "Book a session"}</p>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="bg-gradient-to-br from-white to-[#f9fafb] rounded-3xl border border-[#e5e7eb] shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-6 md:px-8 py-6 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Your Next Session</h2>
                  <p className="text-sm text-white/80">Upcoming counseling appointment</p>
                </div>
              </div>
            </div>

            <div className="px-6 md:px-8 py-8">
              {sessionLoading && sessionsLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                </div>
              ) : displaySession ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] flex items-center justify-center text-3xl flex-shrink-0">
                      👨‍⚕️
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#999] uppercase tracking-wider font-semibold">Counselor</p>
                      <p className="mt-1 text-xl md:text-2xl font-bold text-[#111827]">
                        {displaySession.counselor_name || "Counselor not assigned"}
                      </p>
                      <p className="mt-2 text-sm text-[#666]">
                        {displaySession.type === "video" ? "🎥 Video call" : "💬 Chat session"}
                      </p>
                    </div>
                    <span className={badgeClass(displaySession.status)}>{displaySession.status || "pending"}</span>
                  </div>

                  <div className="bg-[#f9fafb] rounded-2xl p-5 border border-[#e5e7eb]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[#999] uppercase tracking-wider font-semibold">Date</p>
                        <p className="mt-2 text-lg font-bold text-[#1f4e43]">{displaySession.date || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#999] uppercase tracking-wider font-semibold">Time</p>
                        <p className="mt-2 text-lg font-bold text-[#1f4e43]">{displaySession.time || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#999] uppercase tracking-wider font-semibold">Session Type</p>
                        <p className="mt-2 text-lg font-bold text-[#1f4e43] capitalize">
                          {displaySession.type === "video" ? "Video" : "Chat"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#999] uppercase tracking-wider font-semibold">Payment</p>
                        <p className="mt-2 text-lg font-bold text-[#1f4e43] capitalize">
                          {displaySession.payment_status || "paid"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!hasCounselorAssigned && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 flex gap-3">
                      <span className="text-xl flex-shrink-0">⏳</span>
                      <div>
                        <p className="font-semibold text-amber-900 text-sm">Waiting for counselor assignment</p>
                        <p className="text-xs text-amber-800 mt-1">Your counselor will be assigned shortly.</p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && !isSessionConfirmed && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 flex gap-3">
                      <span className="text-xl flex-shrink-0">ℹ️</span>
                      <div>
                        <p className="font-semibold text-blue-900 text-sm">Awaiting counselor confirmation</p>
                        <p className="text-xs text-blue-800 mt-1">
                          Chat will unlock only after confirmation and at the scheduled session time.
                        </p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && isSessionConfirmed && !isPaymentPaid && (
                    <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex gap-3">
                      <span className="text-xl flex-shrink-0">💳</span>
                      <div>
                        <p className="font-semibold text-red-900 text-sm">Payment pending</p>
                        <p className="text-xs text-red-800 mt-1">Chat will unlock after payment is confirmed.</p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && isSessionConfirmed && isPaymentPaid && isBeforeSession && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 flex gap-3">
                      <span className="text-xl flex-shrink-0">⏰</span>
                      <div>
                        <p className="font-semibold text-blue-900 text-sm">Session confirmed</p>
                        <p className="text-xs text-blue-800 mt-1">Chat will be available at {formatSessionTime(displaySession)}.</p>
                      </div>
                    </div>
                  )}

                  {chatUnlocked && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-lg p-4 flex gap-3">
                      <span className="text-xl flex-shrink-0">✅</span>
                      <div>
                        <p className="font-semibold text-emerald-900 text-sm">Session is live now</p>
                        <p className="text-xs text-emerald-800 mt-1">You can now start chatting with your counselor.</p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && isSessionConfirmed && isPaymentPaid && isAfterSession && (
                    <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 flex gap-3">
                      <span className="text-xl flex-shrink-0">⌛</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Session time has passed</p>
                        <p className="text-xs text-gray-700 mt-1">This session is no longer available.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-3 pt-4">
                    {chatUnlocked ? (
                      <>
                        <Link
                          to={`/chat/${displaySession?.id}`}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center gap-2 shadow-md"
                        >
                          💬 Start chat
                        </Link>

                        {displaySession?.meeting_link && (
                          <a
                            href={displaySession.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 px-6 py-3 bg-white border border-[#1f4e43] text-[#1f4e43] rounded-full font-semibold hover:bg-[#f0f9f7] transition flex items-center justify-center gap-2"
                          >
                            🎥 Join meeting
                          </a>
                        )}

                        <Link
                          to="/sessions"
                          className="flex-1 px-6 py-3 bg-white border border-[#e5e7eb] text-[#1f4e43] rounded-full font-semibold hover:bg-[#f9fafb] transition flex items-center justify-center gap-2"
                        >
                          📋 View all
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          disabled
                          className="flex-1 px-6 py-3 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed"
                        >
                          💬 Chat locked until session time
                        </button>

                        <Link
                          to="/sessions"
                          className="flex-1 px-6 py-3 bg-white border border-[#e5e7eb] text-[#1f4e43] rounded-full font-semibold hover:bg-[#f9fafb] transition flex items-center justify-center gap-2"
                        >
                          📋 View all
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-[#1f4e43] mb-2">No session booked yet</h3>
                  <p className="text-[#666] mb-6">Let&apos;s get you matched with a counselor for your first session</p>
                  <Link
                    to="/users/appointments/book"
                    className="inline-flex px-6 py-3 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md"
                  >
                    ✨ Book your first session
                  </Link>
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 py-4 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
              <div className="text-sm">
                <p className="font-semibold text-[#1f4e43]">Pro tip:</p>
                <p className="text-[#666] mt-1">
                  Keep your mood journal updated before sessions. This helps your counselor provide better guidance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-bold text-[#1f4e43] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...quickActions, chatAction].map((a) =>
              a.locked ? (
                <div
                  key={a.title}
                  className="bg-white rounded-2xl px-5 py-6 shadow-sm border border-[#e5e7eb] opacity-75 cursor-not-allowed"
                  title={a.desc}
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">{a.icon}</div>
                  <p className="mt-4 text-sm font-semibold text-[#111827] flex items-center gap-2">{a.title}</p>
                  <p className="text-xs text-[#666] mt-1">{a.desc}</p>
                  <div className="mt-3 inline-flex text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    🔒 Locked
                  </div>
                </div>
              ) : (
                <Link
                  key={a.title}
                  to={a.to}
                  className="group bg-white rounded-2xl px-5 py-6 shadow-sm border border-[#e5e7eb] hover:shadow-md hover:border-[#1f4e43]/20 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    {a.icon}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#111827] group-hover:text-[#1f4e43] transition">{a.title}</p>
                  <p className="text-xs text-[#666] mt-1">{a.desc}</p>
                  <div className="mt-4 inline-flex text-[10px] font-bold text-[#1f4e43] group-hover:gap-1 transition gap-0">
                    Explore <span>→</span>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>

        {moodItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1f4e43]">Your mood this week</h3>
              <Link to="/users/mood-check" className="text-sm text-[#1f4e43] hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moodItems.slice(0, 6).map((mood, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-[#e5e7eb] hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#999] uppercase tracking-wider font-semibold">
                        {new Date(mood.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{mood.mood}</p>
                    </div>
                    <span className="text-4xl opacity-75">{getMoodEmoji(mood.mood)}</span>
                  </div>
                  {mood.notes && <p className="mt-3 text-xs text-[#666] line-clamp-2 italic">&quot;{mood.notes}&quot;</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}