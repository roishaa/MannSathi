import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
      USER (from localStorage)
  ========================= */
  const userName = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.name || u?.full_name || "Roisha Maharjan";
    } catch {
      return "Roisha Maharjan";
    }
  }, []);

  const userEmail = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.email || "user@email.com";
    } catch {
      return "user@email.com";
    }
  }, []);

  /* =========================
      MOOD HISTORY
  ========================= */
  const moodHistory = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("moodHistory")) || [];
    } catch {
      return [];
    }
  }, []);
  const todayMood = moodHistory?.[0];

  /* =========================
      SESSIONS (localStorage)
      Save structure:
      [
        { id, counselor, date, time, type, status }
      ]
  ========================= */
  const sessions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sessions")) || [];
    } catch {
      return [];
    }
  }, []);

  // If no sessions exist yet, show some nice dummy so dashboard doesn't look empty
  const fallbackSessions = [
    {
      id: 1,
      counselor: "Dr. Anjana Shrestha",
      date: "2026-01-06",
      time: "10:00 AM",
      type: "Online",
      status: "Scheduled",
    },
    {
      id: 2,
      counselor: "Mr. Kiran Gurung",
      date: "2025-12-28",
      time: "03:00 PM",
      type: "In-person",
      status: "Completed",
    },
  ];

  const allSessions = sessions.length ? sessions : fallbackSessions;

  const upcoming = allSessions.filter((s) =>
    (s.status || "").toLowerCase().includes("sched") || (s.status || "").toLowerCase().includes("pending")
  );

  const past = allSessions.filter((s) =>
    (s.status || "").toLowerCase().includes("complete") || (s.status || "").toLowerCase().includes("cancel")
  );

  /* =========================
      LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("authToken");
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

  const quickActions = [
    { title: "Book session", desc: "Find a counselor", to: "/users/BookAppointmentUser", icon: "📌" },
    { title: "My sessions", desc: "Upcoming & history", to: "/sessions", icon: "🗓️" },
    { title: "Mood check-in", desc: "Track emotions", to: "/users/mood-check", icon: "🙂" },
    { title: "Chat support", desc: "Talk now", to: "/chat", icon: "💬" },
  ];

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

  const isActive = (to) => location.pathname === to;

  const badgeClass = (status) => {
    const s = (status || "").toLowerCase();
    const base = "text-[11px] rounded-full px-3 py-1 border";
    if (s.includes("sched")) return `${base} bg-yellow-50 border-yellow-200 text-yellow-700`;
    if (s.includes("pending")) return `${base} bg-red-50 border-red-200 text-red-700`;
    if (s.includes("complete")) return `${base} bg-green-50 border-green-200 text-green-700`;
    if (s.includes("cancel")) return `${base} bg-gray-50 border-gray-200 text-gray-700`;
    return `${base} bg-[#f9fafb] border-[#e5e7eb] text-[#374151]`;
  };

  // mobile sidebar toggle
  const [open, setOpen] = useState(false);

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
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#255b4e] to-[#466f64] text-white px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="font-serif font-semibold text-lg">MannSathi</div>
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
                    ${isActive(item.to) ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-sm" : "hover:bg-[#315d51]"}`}
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

            <div className="mt-4 text-xs text-[#d6ebe2]">
              Mood today:{" "}
              <span className="font-semibold text-white">{todayMood?.mood || "not checked"}</span>
            </div>

            <Link
              to="/users/mood-check"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white text-[#1f4e43] text-xs font-semibold px-4 py-2.5
                         shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:-translate-y-[1px] transition"
            >
              Open mood check-in
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

        <button onClick={handleLogout} className="text-xs underline text-[#dfeee7] text-left hover:text-white">
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-5 md:px-10 py-6 md:py-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-[#1e293b]">
            Hi, {userName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Your space for counseling, sessions and emotional tracking.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
              Mood: {todayMood?.mood || "not checked"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
              📅 {upcoming.length} upcoming sessions
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {quickActions.map((a) => (
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
          ))}
        </section>

        {/* Categories */}
        <section className="mb-10">
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
        </section>

        {/* Recommended Counselors */}
        <section className="mb-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-semibold">Recommended counselors</h2>
              <p className="text-xs text-[#6b7280]">Based on popular topics and availability.</p>
            </div>
            <Link to="/search-doctor" className="text-xs underline text-[#1f4e43]">
              Browse
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
            {counselors.map((d) => (
              <div key={d.name} className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#e5e7eb]">
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
                        <p className="text-sm font-semibold">{s.counselor}</p>
                        <p className="text-xs text-[#6b7280]">
                          {s.date} • {s.time} • {s.type}
                        </p>
                      </div>
                      <span className={badgeClass(s.status)}>{s.status}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/sessions"
                        className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
                      >
                        View details
                      </Link>
                      <Link
                        to="/chat"
                        className="text-xs rounded-full bg-[#1f4e43] text-white px-4 py-2 hover:opacity-95"
                      >
                        Join / Chat
                      </Link>
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
                        <p className="text-sm font-semibold">{s.counselor}</p>
                        <p className="text-xs text-[#6b7280]">
                          {s.date} • {s.time} • {s.type}
                        </p>
                      </div>
                      <span className={badgeClass(s.status)}>{s.status}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
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
                <div className="text-sm text-[#6b7280]">
                  No past sessions yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
