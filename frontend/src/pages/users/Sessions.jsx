import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Sessions() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const userName = user?.pseudonym || user?.name || user?.full_name || "LotusMind 🌸";
  const userEmail = user?.email || "user@email.com";

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

  const loadSessions = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
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

  const upcomingSessions = sessions.filter((s) => {
    const st = normalizeStatus(s.status);
    return (st === "pending" || st === "confirmed") && !isPastByTime(s);
  });

  const pastSessions = sessions.filter((s) => {
    const st = normalizeStatus(s.status);
    return st === "completed" || st === "cancelled" || isPastByTime(s);
  });

  const displaySessions = activeTab === "upcoming" ? upcomingSessions : pastSessions;

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/");
  };

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
          <div className="relative mb-10">
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

      <main className="flex-1 px-4 md:px-10 py-6 md:py-10 pt-24 md:pt-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1f4e43]">My Sessions</h1>
            <p className="mt-2 text-base text-[#666] font-medium">View your upcoming and past counseling sessions</p>
          </div>

          <Link
            to="/users/appointments/book"
            className="px-5 py-2 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-full text-sm font-medium hover:shadow-lg transition shadow-md w-fit"
          >
            ➕ Book session
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[#999] font-semibold">Total Sessions</p>
            <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{sessions.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[#999] font-semibold">Upcoming</p>
            <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{upcomingSessions.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[#999] font-semibold">Past</p>
            <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{pastSessions.length}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition ${
              activeTab === "upcoming" ? "bg-[#1f4e43] text-white border-[#1f4e43]" : "bg-white text-[#1f4e43] border-[#e5e7eb]"
            }`}
          >
            Upcoming Sessions
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition ${
              activeTab === "past" ? "bg-[#1f4e43] text-white border-[#1f4e43]" : "bg-white text-[#1f4e43] border-[#e5e7eb]"
            }`}
          >
            Past Sessions
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-5 md:p-6">
          {loading ? (
            <p className="text-[#666]">Loading sessions...</p>
          ) : displaySessions.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="text-xl font-bold text-[#1f4e43]">No {activeTab === "upcoming" ? "upcoming" : "past"} sessions</h3>
              <p className="text-[#666] mt-2">
                {activeTab === "upcoming"
                  ? "You do not have any upcoming sessions right now."
                  : "Your completed, cancelled, or expired sessions will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displaySessions.map((session) => {
                const liveNow = isLiveByTime(session);
                const canStartChat =
                  normalizeStatus(session.status) === "confirmed" &&
                  (session.payment_status || "").toLowerCase() === "paid" &&
                  liveNow;

                return (
                  <div key={session.id} className="border border-[#e5e7eb] rounded-2xl p-5 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#999] font-semibold">Counselor</p>
                        <h3 className="text-xl font-bold text-[#1f4e43] mt-1">{session.counselor_name}</h3>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-[#999] text-xs uppercase tracking-wider">Date</p>
                            <p className="font-semibold text-[#111827] mt-1">{session.date || "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-[#999] text-xs uppercase tracking-wider">Time</p>
                            <p className="font-semibold text-[#111827] mt-1">{session.time || "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-[#999] text-xs uppercase tracking-wider">Type</p>
                            <p className="font-semibold text-[#111827] mt-1 capitalize">{session.type}</p>
                          </div>
                          <div>
                            <p className="text-[#999] text-xs uppercase tracking-wider">Payment</p>
                            <p className="font-semibold text-[#111827] mt-1 capitalize">{session.payment_status}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className={badgeClass(session.status)}>{session.status}</span>
                        {liveNow && (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Live now
                          </span>
                        )}
                      </div>
                    </div>

                    {canStartChat && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          to={`/chat/${session.id}`}
                          className="px-5 py-2 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-full text-sm font-semibold"
                        >
                          💬 Start Chat
                        </Link>

                        {session.meeting_link && (
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-5 py-2 bg-white border border-[#1f4e43] text-[#1f4e43] rounded-full text-sm font-semibold"
                          >
                            🎥 Join Meeting
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}