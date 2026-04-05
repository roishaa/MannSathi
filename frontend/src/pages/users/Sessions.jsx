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
  const [now, setNow] = useState(new Date());

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_data")) || {};
    } catch {
      return {};
    }
  }, []);

  const userName = user?.pseudonym || user?.name || user?.full_name || "LotusMind 🌸";
  const userEmail = user?.email || "user@email.com";

  const normalizeStatus = (status) => {
    const s = String(status || "").toLowerCase().trim();
    if (s === "scheduled") return "confirmed";
    if (s === "canceled" || s === "declined") return "cancelled";
    return s || "pending";
  };

  const pad2 = (value) => String(value).padStart(2, "0");

  const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

  const buildLocalDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const safeTime = String(timeStr).slice(0, 5);
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const [hour, minute] = safeTime.split(":").map(Number);

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

  const normalizeDateOnly = (value) => {
    if (!value) return null;
    const str = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    const d = new Date(str);
    if (!isValidDate(d)) return null;

    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  const normalizeTimeOnly = (value) => {
    if (!value) return null;
    const str = String(value).trim();

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
      return str.slice(0, 5);
    }

    const d = new Date(str);
    if (!isValidDate(d)) return null;

    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Not set";

    const [year, month, day] = String(dateStr).split("-").map(Number);
    const d = new Date(year, month - 1, day);

    if (!isValidDate(d)) return dateStr;

    return d.toLocaleDateString("en-CA");
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "Not set";

    const [hourRaw, minuteRaw] = String(timeStr).slice(0, 5).split(":");
    let hour = Number(hourRaw);
    const minute = minuteRaw || "00";

    if (Number.isNaN(hour)) return timeStr;

    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minute} ${suffix}`;
  };

  const normalizeSession = (item) => {
    if (!item) return null;

    const normalizedDate = normalizeDateOnly(
      item.date || item.appointment_date || item.session_date || null
    );

    const normalizedTime = normalizeTimeOnly(
      item.time || item.appointment_time || item.session_time || null
    );

    const localStart = buildLocalDateTime(normalizedDate, normalizedTime);

    return {
      id: item.id,
      counselor_id: item.counselor_id || item.counselor?.id || null,
      counselor_name:
        item.counselor_name ||
        item.counselor?.name ||
        item.counsellor?.name ||
        "Counselor not assigned",
      date: normalizedDate,
      time: normalizedTime,
      displayDate: formatDisplayDate(normalizedDate),
      displayTime: formatDisplayTime(normalizedTime),
      type: String(item.type || item.session_type || "chat").toLowerCase(),
      status: normalizeStatus(item.status),
      payment_status: String(item.payment_status || "paid").toLowerCase(),
      meeting_link: item.meeting_link || item.meet_link || null,
      localStart,
      raw: item,
    };
  };

  const getSessionStart = (session) => session?.localStart || null;

  const getSessionEnd = (session) => {
    const start = getSessionStart(session);
    if (!start) return null;
    return new Date(start.getTime() + 45 * 60 * 1000);
  };

  const getSessionBucket = (session) => {
    const start = getSessionStart(session);
    const end = getSessionEnd(session);
    const status = normalizeStatus(session?.status);

    if (status === "cancelled") return "past";

    if (start && end) {
      if (now < start) return "upcoming";
      if (now >= start && now <= end) return "live";
      if (now > end) return "past";
    }

    if (status === "completed") return "past";
    if (status === "pending" || status === "confirmed") return "upcoming";

    return "upcoming";
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

      const normalized = (rawItems || [])
        .map(normalizeSession)
        .filter(Boolean)
        .sort((a, b) => {
          const aStart = getSessionStart(a);
          const bStart = getSessionStart(b);
          return (aStart?.getTime() || 0) - (bStart?.getTime() || 0);
        });

      setSessions(normalized);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const upcomingSessions = sessions.filter((s) => {
    const bucket = getSessionBucket(s);
    return bucket === "upcoming" || bucket === "live";
  });

  const pastSessions = sessions.filter((s) => getSessionBucket(s) === "past");

  const displaySessions = activeTab === "upcoming" ? upcomingSessions : pastSessions;

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", to: "/users/dashboard", icon: "🏠" },
    { label: "Search Counselor", to: "/search-doctor", icon: "🧑‍⚕️" },
    { label: "Sessions", to: "/sessions", icon: "📅" },
    { label: "Resources", to: "/resources", icon: "📚" },
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
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent">
              My Sessions
            </h1>
            <p className="mt-2 text-base text-[#5f6d68] font-medium">
              View your upcoming and past counseling sessions
            </p>
          </div>

          <Link
            to="/users/appointments/book"
            className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md w-fit"
          >
            ➕ Book session
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-3xl p-5 border border-[#e7e5de] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[#83918b] font-semibold">Total Sessions</p>
            <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{sessions.length}</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e7e5de] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[#83918b] font-semibold">Upcoming</p>
            <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{upcomingSessions.length}</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e7e5de] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[#83918b] font-semibold">Past</p>
            <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{pastSessions.length}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition ${
              activeTab === "upcoming"
                ? "bg-[#1f4e43] text-white border-[#1f4e43]"
                : "bg-white text-[#1f4e43] border-[#e5e7eb]"
            }`}
          >
            Upcoming Sessions
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition ${
              activeTab === "past"
                ? "bg-[#1f4e43] text-white border-[#1f4e43]"
                : "bg-white text-[#1f4e43] border-[#e5e7eb]"
            }`}
          >
            Past Sessions
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-[#e7e5de] shadow-sm p-5 md:p-6">
          {loading ? (
            <p className="text-[#666]">Loading sessions...</p>
          ) : displaySessions.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="text-xl font-bold text-[#1f4e43]">
                No {activeTab === "upcoming" ? "upcoming" : "past"} sessions
              </h3>
              <p className="text-[#666] mt-2">
                {activeTab === "upcoming"
                  ? "You do not have any upcoming sessions right now."
                  : "Your completed, cancelled, or expired sessions will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displaySessions.map((session) => {
                const bucket = getSessionBucket(session);
                const liveNow = bucket === "live";

                const canStartChat =
                  normalizeStatus(session.status) === "confirmed" &&
                  (session.payment_status || "").toLowerCase() === "paid" &&
                  liveNow;

                return (
                  <div
                    key={session.id}
                    className="rounded-3xl border border-[#e7e5de] bg-[#fbfbf9] p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wider text-[#8f9a95] font-semibold">Counselor</p>
                        <h3 className="text-xl font-bold text-[#1f4e43] mt-1">{session.counselor_name}</h3>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[#8f9a95] text-xs uppercase tracking-wider font-semibold">Date</p>
                            <p className="font-semibold text-[#111827] mt-1">{session.displayDate}</p>
                          </div>
                          <div>
                            <p className="text-[#8f9a95] text-xs uppercase tracking-wider font-semibold">Time</p>
                            <p className="font-semibold text-[#111827] mt-1">{session.displayTime}</p>
                          </div>
                          <div>
                            <p className="text-[#8f9a95] text-xs uppercase tracking-wider font-semibold">Type</p>
                            <p className="font-semibold text-[#111827] mt-1 capitalize">{session.type}</p>
                          </div>
                          <div>
                            <p className="text-[#8f9a95] text-xs uppercase tracking-wider font-semibold">Payment</p>
                            <p className="font-semibold text-[#111827] mt-1 capitalize">{session.payment_status}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className={badgeClass(session.status)}>{session.status}</span>

                        {liveNow && (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 border-blue-200 text-blue-700">
                            Live now
                          </span>
                        )}

                        {canStartChat ? (
                          <Link
                            to={`/chat/${session.id}`}
                            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#1f4e43] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                          >
                            Join chat
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                          >
                            Chat unavailable
                          </button>
                        )}
                      </div>
                    </div>
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