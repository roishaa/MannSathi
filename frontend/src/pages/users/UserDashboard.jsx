import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * REAL-LIFE DASHBOARD BEHAVIOR (front-end only)
 * - Shows "Next session" as the main hero card
 * - Chat button is LOCKED unless session is Confirmed + counselor assigned
 * - Status chips are consistent: pending/confirmed/completed/cancelled
 * - Has Notifications feed (from localStorage) so it feels "real-time"
 * - Has empty-states + fallback demo data (only if localStorage empty)
 *
 * LocalStorage keys used:
 * - user: {name/full_name, email}
 * - moodHistory: [{ mood, note, date }]
 * - sessions: [{ id, counselor, counselorId, date, time, type, status, meetingLink }]
 * - notifications: [{ id, title, message, time, type }]
 */
export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // mobile sidebar toggle
  const [open, setOpen] = useState(false);

  // "real-time" refresh (poll localStorage every 3s)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 3000);
    return () => clearInterval(t);
  }, []);

  /* =========================
      USER (from localStorage)
  ========================= */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, [tick]);

  const userName = user?.name || user?.full_name || "Roisha Maharjan";
  const userEmail = user?.email || "user@email.com";

  /* =========================
      MOOD HISTORY
  ========================= */
  const moodHistory = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("moodHistory")) || [];
    } catch {
      return [];
    }
  }, [tick]);

  const todayMood = moodHistory?.[0];

  /* =========================
      SESSIONS (localStorage)
      Standard statuses:
      pending | confirmed | completed | cancelled
  ========================= */
  const sessions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sessions")) || [];
    } catch {
      return [];
    }
  }, [tick]);

  // Fallback demo sessions if empty (so UI isn't dead)
  const fallbackSessions = [
    {
      id: 1,
      counselor: "Dr. Anjana Shrestha",
      counselorId: "c-1001",
      date: "2026-01-21",
      time: "10:00 AM",
      type: "Online",
      status: "confirmed",
      meetingLink: "https://meet.example.com/demo",
    },
    {
      id: 2,
      counselor: "Mr. Kiran Gurung",
      counselorId: "c-1002",
      date: "2026-01-10",
      time: "03:00 PM",
      type: "In-person",
      status: "completed",
    },
  ];

  const allSessions = sessions.length ? sessions : fallbackSessions;

  // helpers
  const normalizeStatus = (status) => (status || "").toLowerCase().trim();

  const parseDateTime = (s) => {
    // date can be YYYY-MM-DD, time can be "10:00 AM"
    // We'll create a best-effort Date object.
    try {
      const dateStr = s?.date;
      const timeStr = s?.time || "12:00 PM";
      if (!dateStr) return null;

      // Convert "10:00 AM" -> 10:00
      const m = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      let hh = 12;
      let mm = 0;
      if (m) {
        hh = parseInt(m[1], 10);
        mm = parseInt(m[2], 10);
        const ap = m[3].toUpperCase();
        if (ap === "PM" && hh !== 12) hh += 12;
        if (ap === "AM" && hh === 12) hh = 0;
      }

      const d = new Date(`${dateStr}T00:00:00`);
      if (Number.isNaN(d.getTime())) return null;
      d.setHours(hh, mm, 0, 0);
      return d;
    } catch {
      return null;
    }
  };

  const now = new Date();

  const upcoming = allSessions
    .filter((s) => {
      const st = normalizeStatus(s.status);
      return st === "pending" || st === "confirmed" || st.includes("sched");
    })
    .sort((a, b) => {
      const da = parseDateTime(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = parseDateTime(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - db;
    });

  const past = allSessions
    .filter((s) => {
      const st = normalizeStatus(s.status);
      return st === "completed" || st === "cancelled" || st.includes("complete") || st.includes("cancel");
    })
    .sort((a, b) => {
      const da = parseDateTime(a)?.getTime() ?? 0;
      const db = parseDateTime(b)?.getTime() ?? 0;
      return db - da;
    });

  const nextSession = upcoming[0] || null;

  const nextSessionStatus = normalizeStatus(nextSession?.status);
  const hasCounselorAssigned = !!nextSession?.counselor && !!nextSession?.counselorId;
  const isSessionConfirmed =
    nextSessionStatus === "confirmed" || nextSessionStatus.includes("confirm");

  const chatUnlocked = Boolean(nextSession && hasCounselorAssigned && isSessionConfirmed);

  /* =========================
      NOTIFICATIONS (localStorage)
      helps feel real-time
  ========================= */
  const notifications = useMemo(() => {
    try {
      const n = JSON.parse(localStorage.getItem("notifications")) || [];
      return Array.isArray(n) ? n : [];
    } catch {
      return [];
    }
  }, [tick]);

  const fallbackNotifications = [
    {
      id: "n1",
      type: "info",
      title: "Welcome to MannSathi",
      message: "Book your first session when you’re ready.",
      time: "Just now",
    },
    {
      id: "n2",
      type: "success",
      title: "Mood check-in reminder",
      message: "Tracking moods helps your counselor understand you better.",
      time: "Today",
    },
  ];

  const feed = (notifications.length ? notifications : fallbackNotifications).slice(0, 4);

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
    { label: "Search Counselor", to: "/search-doctor", icon: "🧑‍⚕️" },
    { label: "Sessions", to: "/sessions", icon: "📅" },
    { label: "Payments", to: "/payments", icon: "💳" },
    { label: "Settings", to: "/settings", icon: "⚙️" },
  ];

  const isActive = (to) => location.pathname === to;

  const badgeClass = (status) => {
    const s = normalizeStatus(status);
    const base = "text-[11px] rounded-full px-3 py-1 border whitespace-nowrap";

    if (s === "confirmed" || s.includes("confirm"))
      return `${base} bg-emerald-50 border-emerald-200 text-emerald-700`;
    if (s === "pending" || s.includes("pending"))
      return `${base} bg-amber-50 border-amber-200 text-amber-700`;
    if (s === "completed" || s.includes("complete"))
      return `${base} bg-green-50 border-green-200 text-green-700`;
    if (s === "cancelled" || s.includes("cancel"))
      return `${base} bg-gray-50 border-gray-200 text-gray-700`;

    return `${base} bg-[#f9fafb] border-[#e5e7eb] text-[#374151]`;
  };

  const notifDot = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "success") return "bg-emerald-500";
    if (t === "warning") return "bg-amber-500";
    if (t === "danger") return "bg-rose-500";
    return "bg-slate-400";
  };

  const quickActions = [
    { title: "Book session", desc: "Find a counselor", to: "/users/BookAppointmentUser", icon: "📌" },
    { title: "My sessions", desc: "Upcoming & history", to: "/sessions", icon: "🗓️" },
    { title: "Mood check-in", desc: "Track emotions", to: "/users/mood-check", icon: "🙂" },
  ];

  // Chat action is dynamic (locked/unlocked)
  const chatAction = {
    title: "Chat",
    desc: chatUnlocked ? "Message your counselor" : "Unlocks after confirmation",
    to: chatUnlocked ? "/chat" : "#",
    icon: "💬",
    locked: !chatUnlocked,
  };

  const categories = [
    { icon: "💬", label: "Stress & Anxiety", chip: "Popular" },
    { icon: "🌙", label: "Sleep & Rest", chip: "New" },
    { icon: "🧠", label: "Self-esteem", chip: "Recommended" },
    { icon: "❤️", label: "Relationships", chip: "Trending" },
  ];

  const counselors = [
    { name: "Dr. Anjana Shrestha", tag: "Anxiety • Online", badge: "Available" },
    { name: "Mr. Kiran Gurung", tag: "Stress • In-person", badge: "New" },
    { name: "Ms. Sita Lama", tag: "Teens • Online", badge: "Top" },
  ];

  const formatRelative = (d) => {
    if (!d) return "";
    const ms = d.getTime() - now.getTime();
    const abs = Math.abs(ms);
    const mins = Math.round(abs / 60000);
    const hrs = Math.round(abs / 3600000);
    const days = Math.round(abs / 86400000);

    if (abs < 60000) return "now";
    if (abs < 3600000) return ms > 0 ? `in ${mins} min` : `${mins} min ago`;
    if (abs < 86400000) return ms > 0 ? `in ${hrs} hr` : `${hrs} hr ago`;
    return ms > 0 ? `in ${days} day` : `${days} day ago`;
  };

  const nextDateObj = nextSession ? parseDateTime(nextSession) : null;
  const nextWhen = nextDateObj ? formatRelative(nextDateObj) : "";

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-[#e5e7eb]">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
          >
            ☰
          </button>
          <div className="font-serif font-semibold text-[#1f4e43]">MannSathi</div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white font-semibold text-xl font-serif tracking-wide">MannSathi</div>
              <button onClick={() => setOpen(false)} className="text-white text-lg">
                ✕
              </button>
            </div>

            <div className="mt-6 bg-white/10 rounded-3xl p-5 border border-white/15">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-[#d6ebe2]">{userEmail}</p>
              <div className="mt-3 text-xs text-[#d6ebe2]">
                Mood today:{" "}
                <span className="font-semibold text-white">{todayMood?.mood || "not checked"}</span>
              </div>
            </div>

            <nav className="mt-6 space-y-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition
                    ${
                      isActive(item.to)
                        ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-sm"
                        : "hover:bg-[#315d51]"
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

      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 hidden md:flex bg-gradient-to-b from-[#255b4e] to-[#466f64] text-white px-6 py-8 flex-col justify-between">
        <div>
          <div className="relative mb-10 select-none cursor-default">
            <div className="w-44 h-12 bg-[#1e4940] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/15 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                🧑
              </div>
              <div>
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-[#d6ebe2]">{userEmail}</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-[#d6ebe2] flex items-center justify-between gap-2">
              <span>
                Mood:{" "}
                <span className="font-semibold text-white">{todayMood?.mood || "not checked"}</span>
              </span>
              <Link to="/users/mood-check" className="underline text-[#dfeee7] hover:text-white">
                update
              </Link>
            </div>

            <Link
              to="/users/BookAppointmentUser"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white text-[#1f4e43] text-xs font-semibold px-4 py-2.5
                         shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:-translate-y-[1px] transition"
            >
              Book a session
            </Link>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition
                  ${
                    isActive(item.to)
                      ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-sm"
                      : "hover:bg-[#315d51]"
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
          className="text-xs underline text-[#dfeee7] text-left hover:text-white"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-5 md:px-10 py-6 md:py-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-[#1e293b]">
            Hi, {userName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Your counseling dashboard — sessions, mood tracking, and support.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
              Mood: {todayMood?.mood || "not checked"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
              📅 {upcoming.length} upcoming
            </span>
            {nextSession && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
                Next: {nextWhen || "soon"}
              </span>
            )}
          </div>
        </div>

        {/* HERO: Next session */}
        <section className="mb-8">
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">Next session</h2>
                  {nextSession ? (
                    <span className={badgeClass(nextSession.status)}>{normalizeStatus(nextSession.status) || "pending"}</span>
                  ) : (
                    <span className="text-[11px] rounded-full px-3 py-1 border bg-gray-50 border-gray-200 text-gray-700">
                      none
                    </span>
                  )}
                </div>

                {nextSession ? (
                  <>
                    <p className="mt-2 text-sm text-[#111827] font-semibold">
                      {nextSession.counselor || "Counselor not assigned"}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-1">
                      {nextSession.date} • {nextSession.time} • {nextSession.type}
                      {nextWhen ? <span className="ml-2">• {nextWhen}</span> : null}
                    </p>

                    {!hasCounselorAssigned && (
                      <div className="mt-3 text-xs rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-2">
                        Counselor assignment is pending. Chat will unlock after confirmation.
                      </div>
                    )}

                    {hasCounselorAssigned && !isSessionConfirmed && (
                      <div className="mt-3 text-xs rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-2">
                        Your session is not confirmed yet. Chat will unlock after confirmation.
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[#6b7280]">
                    No session booked yet. Book a counselor to get started.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/users/BookAppointmentUser"
                  className="text-xs rounded-full bg-[#1f4e43] text-white px-4 py-2 hover:opacity-95"
                >
                  Book / Reschedule
                </Link>

                <Link
                  to="/sessions"
                  className="text-xs rounded-full border border-[#e5e7eb] bg-white px-4 py-2 hover:bg-[#f3f4f6] transition"
                >
                  View sessions
                </Link>

                {chatUnlocked ? (
                  <Link
                    to="/chat"
                    className="text-xs rounded-full bg-[#111827] text-white px-4 py-2 hover:opacity-95"
                  >
                    Chat now
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="text-xs rounded-full bg-[#111827]/20 text-[#111827] px-4 py-2 cursor-not-allowed"
                    title="Chat unlocks after session confirmation"
                    disabled
                  >
                    Chat locked
                  </button>
                )}

                {chatUnlocked && nextSession?.meetingLink ? (
                  <a
                    href={nextSession.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs rounded-full border border-[#e5e7eb] bg-white px-4 py-2 hover:bg-[#f3f4f6] transition"
                  >
                    Join meeting
                  </a>
                ) : null}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f9fafb] border-t border-[#e5e7eb] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-xs text-[#6b7280]">
                Tip: keep your mood updated before sessions for better guidance.
              </div>
              <Link
                to="/users/mood-check"
                className="text-xs underline text-[#1f4e43] hover:opacity-90"
              >
                Update mood check-in
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...quickActions, chatAction].map((a) =>
            a.locked ? (
              <div
                key={a.title}
                className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#e5e7eb] opacity-75"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#eef2f7] flex items-center justify-center text-xl">
                  {a.icon}
                </div>
                <p className="mt-4 text-sm font-semibold flex items-center gap-2">
                  {a.title} <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-50">Locked</span>
                </p>
                <p className="text-xs text-[#6b7280]">{a.desc}</p>
                <p className="mt-3 text-[11px] text-[#6b7280]">
                  Unlocks after your session is <span className="font-semibold">confirmed</span>.
                </p>
              </div>
            ) : (
              <Link
                key={a.title}
                to={a.to}
                className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#e5e7eb]
                         hover:-translate-y-[2px] hover:shadow-md transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#e3f3e6] flex items-center justify-center text-xl">
                  {a.icon}
                </div>
                <p className="mt-4 text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-[#6b7280]">{a.desc}</p>
              </Link>
            )
          )}
        </section>

        {/* Notifications + Topics */}
        <section className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Notifications */}
          <div className="bg-white rounded-3xl px-6 py-5 border border-[#e5e7eb] shadow-sm lg:col-span-1">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-base font-semibold">Updates</h2>
                <p className="text-xs text-[#6b7280]">Latest activity (simulated real-time)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  // quick clear for demo/testing
                  localStorage.removeItem("notifications");
                  setTick((x) => x + 1);
                }}
                className="text-xs underline text-[#1f4e43]"
              >
                Clear
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {feed.map((n) => (
                <div key={n.id} className="rounded-2xl border border-[#e5e7eb] p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 mt-1.5 rounded-full ${notifDot(n.type)}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">{n.title}</p>
                      <p className="text-xs text-[#6b7280] mt-1">{n.message}</p>
                      <p className="text-[11px] text-[#94a3b8] mt-2">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/sessions"
              className="mt-4 inline-flex text-xs rounded-full border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6] transition"
            >
              View activity
            </Link>
          </div>

          {/* Topics */}
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-base font-semibold">Topics</h2>
                <p className="text-xs text-[#6b7280]">Pick a topic to find matching counselors.</p>
              </div>
              <Link to="/search-doctor" className="text-xs underline text-[#1f4e43]">
                View all
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map((c) => (
                <Link
                  key={c.label}
                  to="/search-doctor"
                  className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#e5e7eb]
                         hover:-translate-y-[2px] hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#f7efe1] flex items-center justify-center text-xl">
                      {c.icon}
                    </div>
                    <span className="text-[11px] rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-[#374151]">
                      {c.chip}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold">{c.label}</p>
                  <p className="text-xs text-[#6b7280]">Find help for this topic</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Counselors */}
        <section className="mb-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-semibold">Recommended counselors</h2>
              <p className="text-xs text-[#6b7280]">Suggested profiles (demo data).</p>
            </div>
            <Link to="/search-doctor" className="text-xs underline text-[#1f4e43]">
              Browse
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
            {counselors.map((d) => (
              <div
                key={d.name}
                className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#e5e7eb]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{d.name}</p>
                    <p className="text-xs text-[#6b7280]">{d.tag}</p>
                  </div>
                  <span className="text-[11px] rounded-full border border-[#d5e4da] bg-[#e3f3e6] px-3 py-1 text-[#1f4e43]">
                    {d.badge}
                  </span>
                </div>

                <Link
                  to="/users/BookAppointmentUser"
                  className="mt-4 inline-flex text-xs rounded-full bg-[#1f4e43] text-white px-4 py-2 hover:opacity-95"
                >
                  Book a slot
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming & Past Sessions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Upcoming */}
          <div className="bg-white rounded-3xl px-6 py-5 border border-[#e5e7eb] shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-base font-semibold">Upcoming sessions</h2>
                <p className="text-xs text-[#6b7280]">Your next scheduled sessions.</p>
              </div>
              <Link to="/sessions" className="text-xs underline text-[#1f4e43]">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcoming.length ? (
                upcoming.slice(0, 4).map((s) => (
                  <div key={s.id} className="rounded-2xl border border-[#e5e7eb] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{s.counselor || "Counselor not assigned"}</p>
                        <p className="text-xs text-[#6b7280]">
                          {s.date} • {s.time} • {s.type}
                        </p>
                      </div>
                      <span className={badgeClass(s.status)}>{normalizeStatus(s.status) || "pending"}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to="/sessions"
                        className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
                      >
                        View details
                      </Link>

                      {chatUnlocked && nextSession?.id === s.id ? (
                        <Link
                          to="/chat"
                          className="text-xs rounded-full bg-[#111827] text-white px-4 py-2 hover:opacity-95"
                        >
                          Chat
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="text-xs rounded-full bg-[#111827]/15 text-[#111827] px-4 py-2 cursor-not-allowed"
                          disabled
                          title="Chat unlocks after confirmation"
                        >
                          Chat locked
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6b7280]">
                  No sessions booked yet.{" "}
                  <Link to="/users/BookAppointmentUser" className="underline text-[#1f4e43]">
                    Book your first session
                  </Link>
                  .
                </div>
              )}
            </div>
          </div>

          {/* Past */}
          <div className="bg-white rounded-3xl px-6 py-5 border border-[#e5e7eb] shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-base font-semibold">Past sessions</h2>
                <p className="text-xs text-[#6b7280]">Your recent counseling history.</p>
              </div>
              <Link to="/sessions" className="text-xs underline text-[#1f4e43]">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {past.length ? (
                past.slice(0, 4).map((s) => (
                  <div key={s.id} className="rounded-2xl border border-[#e5e7eb] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{s.counselor || "Counselor"}</p>
                        <p className="text-xs text-[#6b7280]">
                          {s.date} • {s.time} • {s.type}
                        </p>
                      </div>
                      <span className={badgeClass(s.status)}>{normalizeStatus(s.status) || "completed"}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to="/sessions"
                        className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
                      >
                        View details
                      </Link>
                      <Link
                        to="/payments"
                        className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
                      >
                        Invoice / Payment
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6b7280]">No past sessions yet.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
