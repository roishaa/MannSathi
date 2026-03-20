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

  const displayStatusLabel = (status) => {
    const s = normalizeStatus(status);
    if (s === "scheduled") return "confirmed";
    if (s === "declined" || s === "canceled") return "cancelled";
    return s || "pending";
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-[#e6e5df] bg-white/90 backdrop-blur-xl">
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dadbd3] bg-white text-[#1f4e43] shadow-sm transition hover:bg-[#f7f8f5]"
          >
            ☰
          </button>
          <div className="text-center">
            <p className="font-serif text-lg font-semibold tracking-wide text-[#1f4e43]">MannSathi</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-[#dadbd3] bg-white px-3.5 py-2 text-xs font-semibold text-[#27584d] shadow-sm transition hover:bg-[#f7f8f5]"
          >
            Logout
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[#1f4e43]/35 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#215c4c] via-[#2b6557] to-[#3f7164] text-white px-6 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="font-serif font-semibold text-xl tracking-wide">MannSathi</div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="mt-1 text-xs text-[#d6ebe2]">{userEmail}</p>
              <div className="mt-4 rounded-2xl border border-white/15 bg-black/10 px-3 py-2 text-xs text-[#d6ebe2]">
                Mood: <span className="font-semibold text-white">{moodLoading ? "loading..." : todayMood?.mood || "not checked"}</span>
              </div>
            </div>

            <nav className="mt-7 space-y-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive(item.to)
                      ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_8px_24px_rgba(20,43,37,0.18)]"
                      : "text-white/95 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-8 inline-flex rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#e4efe9]"
            >
              Logout
            </button>
          </aside>
        </div>
      )}

      <aside className="w-80 hidden md:flex bg-gradient-to-b from-[#255b4e] via-[#2d6154] to-[#466f64] text-white px-7 py-8 flex-col justify-between">
        <div>
          <div className="mb-10 rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🌿</div>
              <div>
                <p className="font-serif text-2xl font-semibold tracking-wide">MannSathi</p>
                <p className="text-[11px] text-[#d6ebe2]">Mental wellness space</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">🧑</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-[#d6ebe2] truncate">{userEmail}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/15 bg-black/10 px-3 py-2.5 text-xs text-[#d6ebe2] flex items-center justify-between gap-2">
              <span>
                Mood: <span className="font-semibold text-white">{moodLoading ? "loading..." : todayMood?.mood || "not checked"}</span>
              </span>
              <Link to="/users/mood-check" className="underline text-[#dfeee7] hover:text-white">
                update
              </Link>
            </div>

            <Link
              to="/users/appointments/book"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white text-[#1f4e43] text-xs font-semibold px-4 py-2.5 shadow-[0_6px_20px_rgba(16,30,26,0.2)] transition hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(16,30,26,0.24)]"
            >
              Book a session
            </Link>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive(item.to)
                    ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]"
                    : "text-white/95 hover:bg-white/10"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-left text-[#e2efe8] hover:text-white"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 px-4 md:px-10 xl:px-14 py-6 md:py-10 pt-24 md:pt-10 bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)]">
        <div className="mb-8 rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">Wellness Dashboard</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Welcome back, {userName} 👋
              </h1>
              <p className="mt-3 text-sm md:text-base text-[#5f6d68] font-medium">Your mental wellness journey starts here</p>
            </div>
            <div className="flex gap-3 flex-wrap md:flex-nowrap">
              <Link
                to="/users/mood-check"
                className="px-5 py-2.5 bg-white border border-[#d7d9d0] rounded-2xl text-sm font-semibold text-[#27584d] hover:bg-[#f7f8f5] transition shadow-sm"
              >
                📊 Update mood
              </Link>
              <Link
                to="/users/appointments/book"
                className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md"
              >
                ➕ Book session
              </Link>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white rounded-3xl p-4 border border-[#e7e5de] shadow-sm hover:shadow-md transition">
              <div className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">Today&apos;s Mood</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{moodLoading ? "..." : todayMood?.mood || "—"}</p>
              <p className="text-[11px] text-[#95a19b] mt-1">Last checked today</p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#e7e5de] shadow-sm hover:shadow-md transition">
              <div className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">Upcoming Sessions</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{sessionsLoading ? "..." : upcoming.length}</p>
              <p className="text-[11px] text-[#95a19b] mt-1">{upcoming.length === 1 ? "coming up" : "scheduled"}</p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#e7e5de] shadow-sm hover:shadow-md transition">
              <div className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">Mood Track</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{moodLoading ? "..." : moodItems.length}</p>
              <p className="text-[11px] text-[#95a19b] mt-1">entries this week</p>
            </div>

            <div className="bg-gradient-to-br from-[#f0f9f7] to-[#e8f4f1] rounded-3xl p-4 border border-[#d5e8e4] shadow-sm hover:shadow-md transition">
              <div className="text-[11px] uppercase tracking-wider text-[#1f4e43] font-semibold">Status</div>
              <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{displaySession ? "Booked" : "Free"}</p>
              <p className="text-[11px] text-[#6a7772] mt-1">{displaySession ? "Session scheduled" : "Book a session"}</p>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="rounded-3xl border border-[#e7e5de] bg-gradient-to-b from-white to-[#fbfbf9] shadow-[0_18px_44px_rgba(24,45,38,0.09)] overflow-hidden">
            <div className="bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-6 md:px-8 py-6 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Your Next Session</h2>
                  <p className="text-sm text-white/80">Upcoming counseling appointment</p>
                </div>
              </div>
            </div>

            <div className="px-5 md:px-8 py-7 md:py-8">
              {sessionLoading && sessionsLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-[#e9ece6] rounded-xl w-48 animate-pulse"></div>
                  <div className="h-4 bg-[#e9ece6] rounded-xl w-32 animate-pulse"></div>
                </div>
              ) : displaySession ? (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] flex items-center justify-center text-3xl flex-shrink-0">
                        👨‍⚕️
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#8f9a95] uppercase tracking-[0.16em] font-semibold">Counselor</p>
                        <p className="mt-2 text-xl md:text-2xl font-bold text-[#1c2522]">
                          {displaySession.counselor_name || "Counselor not assigned"}
                        </p>
                        <p className="mt-2 text-sm text-[#5f6d68]">
                          {displaySession.type === "video" ? "🎥 Video call" : "💬 Chat session"}
                        </p>
                      </div>
                      <span className={badgeClass(displaySession.status)}>{displaySession.status || "pending"}</span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#e7e5de] bg-[#f9faf8] p-4 md:p-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[11px] text-[#8f9a95] uppercase tracking-wider font-semibold">Date</p>
                          <p className="mt-2 text-lg font-bold text-[#1f4e43]">{displaySession.date || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#8f9a95] uppercase tracking-wider font-semibold">Time</p>
                          <p className="mt-2 text-lg font-bold text-[#1f4e43]">{displaySession.time || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#8f9a95] uppercase tracking-wider font-semibold">Session Type</p>
                          <p className="mt-2 text-lg font-bold text-[#1f4e43] capitalize">
                            {displaySession.type === "video" ? "Video" : "Chat"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#8f9a95] uppercase tracking-wider font-semibold">Payment</p>
                          <p className="mt-2 text-lg font-bold text-[#1f4e43] capitalize">
                            {displaySession.payment_status || "paid"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!hasCounselorAssigned && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex gap-3">
                      <span className="text-xl flex-shrink-0">⏳</span>
                      <div>
                        <p className="font-semibold text-amber-900 text-sm">Waiting for counselor assignment</p>
                        <p className="text-xs text-amber-800 mt-1">Your counselor will be assigned shortly.</p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && !isSessionConfirmed && (
                    <div className="rounded-2xl border border-[#c9ddd6] bg-[#eef7f3] px-4 py-3.5 flex gap-3">
                      <span className="text-xl flex-shrink-0">ℹ️</span>
                      <div>
                        <p className="font-semibold text-[#27584d] text-sm">Awaiting counselor confirmation</p>
                        <p className="text-xs text-[#3f5e56] mt-1">
                          Chat will unlock only after confirmation and at the scheduled session time.
                        </p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && isSessionConfirmed && !isPaymentPaid && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 flex gap-3">
                      <span className="text-xl flex-shrink-0">💳</span>
                      <div>
                        <p className="font-semibold text-red-900 text-sm">Payment pending</p>
                        <p className="text-xs text-red-800 mt-1">Chat will unlock after payment is confirmed.</p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && isSessionConfirmed && isPaymentPaid && isBeforeSession && (
                    <div className="rounded-2xl border border-[#c9ddd6] bg-[#eef7f3] px-4 py-3.5 flex gap-3">
                      <span className="text-xl flex-shrink-0">⏰</span>
                      <div>
                        <p className="font-semibold text-[#27584d] text-sm">Session confirmed</p>
                        <p className="text-xs text-[#3f5e56] mt-1">Chat will be available at {formatSessionTime(displaySession)}.</p>
                      </div>
                    </div>
                  )}

                  {chatUnlocked && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex gap-3">
                      <span className="text-xl flex-shrink-0">✅</span>
                      <div>
                        <p className="font-semibold text-emerald-900 text-sm">Session is live now</p>
                        <p className="text-xs text-emerald-800 mt-1">You can now start chatting with your counselor.</p>
                      </div>
                    </div>
                  )}

                  {hasCounselorAssigned && isSessionConfirmed && isPaymentPaid && isAfterSession && (
                    <div className="rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3.5 flex gap-3">
                      <span className="text-xl flex-shrink-0">⌛</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Session time has passed</p>
                        <p className="text-xs text-gray-700 mt-1">This session is no longer available.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {chatUnlocked ? (
                      <>
                        <Link
                          to={`/chat/${displaySession?.id}`}
                          className="px-6 py-3 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center gap-2 shadow-md"
                        >
                          💬 Start chat
                        </Link>

                        {displaySession?.meeting_link && (
                          <a
                            href={displaySession.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3 bg-white border border-[#1f4e43] text-[#1f4e43] rounded-2xl font-semibold hover:bg-[#f0f9f7] transition flex items-center justify-center gap-2"
                          >
                            🎥 Join meeting
                          </a>
                        )}

                        <Link
                          to="/sessions"
                          className="px-6 py-3 bg-white border border-[#d7d9d0] text-[#1f4e43] rounded-2xl font-semibold hover:bg-[#f7f8f5] transition flex items-center justify-center gap-2"
                        >
                          📋 View all
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          disabled
                          className="md:col-span-2 px-6 py-3 bg-gray-200 text-gray-500 rounded-2xl font-semibold cursor-not-allowed"
                        >
                          💬 Chat locked until session time
                        </button>

                        <Link
                          to="/sessions"
                          className="px-6 py-3 bg-white border border-[#d7d9d0] text-[#1f4e43] rounded-2xl font-semibold hover:bg-[#f7f8f5] transition flex items-center justify-center gap-2"
                        >
                          📋 View all
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 md:py-14 rounded-3xl border border-dashed border-[#d6dbd2] bg-[#fbfcfa]">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-[#1f4e43] mb-2">No session booked yet</h3>
                  <p className="text-[#666] mb-6">Let&apos;s get you matched with a counselor for your first session</p>
                  <Link
                    to="/users/appointments/book"
                    className="inline-flex px-6 py-3 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md"
                  >
                    ✨ Book your first session
                  </Link>
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 py-4 bg-[#f6f7f3] border-t border-[#e7e5de] flex items-start gap-3">
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
          <div className="rounded-2xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#1f4e43]">My Sessions</h3>
                <p className="text-sm text-[#6a7772]">All booked and completed appointments</p>
              </div>
              <Link
                to="/sessions"
                className="px-3.5 py-2 rounded-xl border border-[#d7d9d0] text-xs font-semibold text-[#1f4e43] hover:bg-[#f7f8f5] transition"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {sessionsLoading ? (
                <div className="text-sm text-[#6b7772]">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="text-sm text-[#6b7772]">No sessions booked yet.</div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-[#e8e6df] bg-[#fbfbf9] p-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-[#8a948f] font-semibold">User Name</p>
                        <p className="text-sm font-semibold text-[#1f2f2a] truncate">{userName}</p>
                      </div>
                      <span className={badgeClass(displayStatusLabel(s.status))}>{displayStatusLabel(s.status)}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#8a948f] font-semibold">Counselor</p>
                        <p className="mt-1 text-[#1f4e43] font-medium truncate">{s.counselor_name || "Counselor not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#8a948f] font-semibold">Date</p>
                        <p className="mt-1 text-[#1f4e43] font-medium">{s.date || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#8a948f] font-semibold">Time</p>
                        <p className="mt-1 text-[#1f4e43] font-medium">{s.time || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#8a948f] font-semibold">Type</p>
                        <p className="mt-1 text-[#1f4e43] font-medium capitalize">{s.type === "video" ? "Video" : "Chat"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#8a948f] font-semibold">Status</p>
                        <p className="mt-1 text-[#1f4e43] font-medium capitalize">{displayStatusLabel(s.status)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1f4e43]">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...quickActions, chatAction].map((a) =>
              a.locked ? (
                <div
                  key={a.title}
                  className="bg-white rounded-3xl px-5 py-6 border border-[#e7e5de] shadow-sm opacity-80 cursor-not-allowed"
                  title={a.desc}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#f0f1ec] flex items-center justify-center text-2xl">{a.icon}</div>
                  <p className="mt-4 text-sm font-semibold text-[#1c2522] flex items-center gap-2">{a.title}</p>
                  <p className="text-xs text-[#66706b] mt-1.5">{a.desc}</p>
                  <div className="mt-3 inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#eff1ec] text-gray-600">
                    🔒 Locked
                  </div>
                </div>
              ) : (
                <Link
                  key={a.title}
                  to={a.to}
                  className="group bg-white rounded-3xl px-5 py-6 border border-[#e7e5de] shadow-sm hover:shadow-md hover:border-[#c8d8d2] transition"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] flex items-center justify-center text-2xl transition group-hover:scale-110">
                    {a.icon}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#1c2522] transition group-hover:text-[#1f4e43]">{a.title}</p>
                  <p className="text-xs text-[#66706b] mt-1.5">{a.desc}</p>
                  <div className="mt-4 inline-flex text-[10px] font-bold text-[#1f4e43] tracking-wide">
                    Explore <span className="ml-1 transition group-hover:translate-x-0.5">→</span>
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
              <Link
                to="/users/mood-check"
                className="text-sm font-semibold text-[#1f4e43] rounded-2xl px-3 py-1.5 hover:bg-white/70 transition"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {moodItems.slice(0, 6).map((mood, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-[#e7e5de] shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-[#8f9a95] uppercase tracking-wider font-semibold">
                        {new Date(mood.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#1f4e43] leading-tight">{mood.mood}</p>
                    </div>
                    <span className="text-4xl opacity-80">{getMoodEmoji(mood.mood)}</span>
                  </div>
                  {mood.notes && (
                    <p className="mt-4 text-xs text-[#66706b] leading-relaxed rounded-2xl bg-[#f8faf7] border border-[#edf0e8] px-3 py-2.5 line-clamp-2 italic">
                      &quot;{mood.notes}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}