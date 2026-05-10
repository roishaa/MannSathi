import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "./ChatPanel";
import api from "../../utils/api";

const SESSION_DURATION_MINUTES = 60;

export default function CounselorDashboard() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const [counselor, setCounselor] = useState(null);
  const [isLoadingCounselor, setIsLoadingCounselor] = useState(true);
  const [counselorError, setCounselorError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  const storedCounselor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("counselor_data")) || null;
    } catch {
      return null;
    }
  }, []);

  const [isOnline, setIsOnline] = useState(() => {
    try {
      const v = localStorage.getItem("counselor_online");
      return v === null ? true : JSON.parse(v);
    } catch {
      return true;
    }
  });

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const [personalNotes, setPersonalNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState("");

  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState("");

  const [sharedContent, setSharedContent] = useState([]);
  const [sharedContentLoading, setSharedContentLoading] = useState(true);
  const [sharedContentError, setSharedContentError] = useState("");

  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [profile, setProfile] = useState({
    bio: "",
    specialization: "",
    availableHours: "",
    payoutInfo: "",
  });

  const [summaryModal, setSummaryModal] = useState({
    open: false,
    sessionId: null,
    summary: "",
  });

  // ── Video state ──
  const [videoLoading, setVideoLoading] = useState({});
  const [videoError, setVideoError] = useState({});

  const counselorName = counselor?.name || counselor?.full_name || "";
  const counselorEmail = counselor?.email || "";
  const counselorSpecialization = counselor?.specialization || "";
  const counselorBio = counselor?.bio || "";
  const counselorAvailableHours = counselor?.available_hours || counselor?.availableHours || "";
  const counselorPayoutInfo = counselor?.payoutInfo || "";

  const counselorNameLabel = counselorName || storedCounselor?.name || storedCounselor?.full_name || "—";
  const counselorEmailLabel = counselorEmail || storedCounselor?.email || "—";
  const counselorSpecializationLabel = counselorSpecialization || storedCounselor?.specialization || "—";

  const pad2 = (v) => String(v).padStart(2, "0");
  const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

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
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) return str.slice(0, 5);
    const d = new Date(str);
    if (!isValidDate(d)) return null;
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const buildLocalDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const [hour, minute] = String(timeStr).slice(0, 5).split(":").map(Number);
    if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;
    const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
    return isValidDate(dt) ? dt : null;
  };

  const formatSessionDateLabel = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const d = new Date(year, month - 1, day);
    if (!isValidDate(d)) return dateStr;
    const today = new Date();
    const isSameDay =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
    if (isSameDay) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatSessionTimeLabel = (timeStr) => {
    if (!timeStr) return "";
    const [hourRaw, minuteRaw] = String(timeStr).slice(0, 5).split(":");
    let hour = Number(hourRaw);
    const minute = minuteRaw || "00";
    if (Number.isNaN(hour)) return String(timeStr);
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
  };

  const isSameCalendarDay = (a, b) => {
    if (!isValidDate(a) || !isValidDate(b)) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getComputedSessionStatus = (rawStatus, sessionStart, sessionEnd) => {
    const normalized = String(rawStatus || "").toLowerCase().trim();
    const now = new Date();
    if (["declined", "cancelled", "canceled"].includes(normalized)) return "Declined";
    if (normalized === "completed") return "Completed";
    if (!sessionStart || !sessionEnd) {
      if (normalized === "scheduled" || normalized === "confirmed") return "Scheduled";
      return rawStatus || "Pending";
    }
    if (now > sessionEnd) return "Completed";
    if (normalized === "scheduled" || normalized === "confirmed") return "Scheduled";
    if (normalized === "pending") return "Pending";
    return rawStatus || "Pending";
  };

  const getSessionPhase = (sessionStart, sessionEnd) => {
    const now = new Date();
    if (!sessionStart || !sessionEnd) return "unknown";
    if (now < sessionStart) return "upcoming";
    if (now >= sessionStart && now <= sessionEnd) return "live";
    return "past";
  };

  const selectedSession = useMemo(
    () => sessions.find((s) => String(s.id) === String(selectedSessionId)) || null,
    [sessions, selectedSessionId]
  );

  const todayDateLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }, []);

  const completedSessions = useMemo(() => sessions.filter((s) => s.computedStatus === "Completed"), [sessions]);
  const totalClients = useMemo(() => new Set(sessions.map((s) => s.patient).filter(Boolean)).size, [sessions]);
  const todaySessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((s) => s.sessionStart && isSameCalendarDay(s.sessionStart, now));
  }, [sessions]);
  const liveSessions = useMemo(() => sessions.filter((s) => s.phase === "live" && !["Declined", "Completed"].includes(s.computedStatus)), [sessions]);
  const upcomingSessions = useMemo(() => sessions.filter((s) => s.phase === "upcoming" && !["Declined", "Completed"].includes(s.computedStatus)), [sessions]);

  const groupedSessions = useMemo(() => {
    const now = new Date();
    const today = sessions.filter((s) => s.sessionStart && isSameCalendarDay(s.sessionStart, now));
    const other = sessions.filter((s) => !s.sessionStart || !isSameCalendarDay(s.sessionStart, now));
    return { today, other };
  }, [sessions]);

  const analytics = useMemo(() => {
    const pendingApprovals = sessions.filter((s) => s.computedStatus === "Pending").length;
    const rated = sessions.map((s) => s.rating).filter((v) => typeof v === "number");
    const avgRating = rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : "—";
    const quizSessions = sessions.filter((s) => s.quizShared && s.quiz);
    const avg = (key) => {
      if (!quizSessions.length) return 0;
      const sum = quizSessions.reduce((acc, s) => acc + Number(s.quiz?.[key] || 0), 0);
      return Math.round((sum / quizSessions.length) * 10);
    };
    return {
      todayTotal: todaySessions.length,
      pendingApprovals,
      upcomingAppointments: upcomingSessions.length,
      avgRating,
      moodTrends: [
        { label: "Stress", value: avg("stress") },
        { label: "Anxiety", value: avg("anxiety") },
        { label: "Sleep", value: avg("sleep") },
      ],
    };
  }, [sessions, todaySessions.length, upcomingSessions.length]);

  // ── Join Video as counselor ──
const handleJoinVideoAsCounselor = (sessionId) => {
  navigate(`/counselor/video-room/${sessionId}`);
};

  useEffect(() => {
    const loadCounselor = async () => {
      setCounselorError("");
      setIsLoadingCounselor(true);
      try {
        const { data } = await api.get("/counselor/me");
        setCounselor(data?.data || data || null);
      } catch (err) {
        setCounselorError(err?.response?.data?.message || "Failed to load counselor profile.");
        setCounselor(null);
      } finally {
        setIsLoadingCounselor(false);
      }
    };

    const loadSessions = async () => {
      setSessionsError("");
      setSessionsLoading(true);
      try {
        const { data } = await api.get("/counselor/sessions");
        const raw = Array.isArray(data) ? data : data?.data || [];
        const normalized = raw.map((s) => {
          const normalizedDate = normalizeDateOnly(s.raw_date || s.session_date || s.appointment_date || s.date || null);
          const normalizedTime = normalizeTimeOnly(s.raw_time || s.session_time || s.appointment_time || s.time || null);
          const sessionStart = buildLocalDateTime(normalizedDate, normalizedTime);
          const sessionEnd = sessionStart ? new Date(sessionStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000) : null;
          const patientName = s.patient?.name || s.patient_name || s.client?.name || s.user?.name || s.patient || s.guest_name || "—";
          const computedStatus = getComputedSessionStatus(s.status, sessionStart, sessionEnd);
          const phase = getSessionPhase(sessionStart, sessionEnd);
          return {
            id: s.id,
            patient: patientName,
            time: formatSessionTimeLabel(normalizedTime),
            date: formatSessionDateLabel(normalizedDate),
            type: String(s.type || s.mode || s.session_type || "").toLowerCase(),
            status: String(s.status || ""),
            computedStatus,
            phase,
            topic: s.topic || s.reason || "",
            notes: s.notes || "",
            feedback: s.feedback || "",
            rating: typeof s.rating === "number" ? s.rating : null,
            quizShared: Boolean(s.quiz_shared ?? s.quizShared),
            quiz: s.quiz || null,
            summary: s.summary || "",
            rawDate: normalizedDate,
            rawTime: normalizedTime,
            sessionStart,
            sessionEnd,
            rawDateTime: sessionStart && normalizedDate && normalizedTime ? `${normalizedDate} ${normalizedTime}:00` : null,
          };
        });
        normalized.sort((a, b) => {
          if (!a.sessionStart && !b.sessionStart) return 0;
          if (!a.sessionStart) return 1;
          if (!b.sessionStart) return -1;
          return a.sessionStart.getTime() - b.sessionStart.getTime();
        });
        setSessions(normalized);
      } catch (err) {
        setSessionsError(err?.response?.data?.message || "Failed to load sessions.");
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    const loadMaterials = async () => {
      setMaterialsError("");
      setMaterialsLoading(true);
      try {
        const { data } = await api.get("/counselor/materials");
        setMaterials(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        setMaterialsError(err?.response?.data?.message || "Failed to load materials.");
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };

    const loadNotes = async () => {
      setNotesError("");
      setNotesLoading(true);
      try {
        const { data } = await api.get("/counselor/notes");
        if (typeof data === "string") setPersonalNotes(data);
        else if (typeof data?.notes === "string") setPersonalNotes(data.notes);
        else setPersonalNotes("");
      } catch (err) {
        setNotesError(err?.response?.data?.message || "Failed to load notes.");
        setPersonalNotes("");
      } finally {
        setNotesLoading(false);
      }
    };

    const loadSharedContent = async () => {
      setSharedContentError("");
      setSharedContentLoading(true);
      try {
        const { data } = await api.get("/content/shared");
        setSharedContent(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        setSharedContentError(err?.response?.data?.message || "Failed to load shared content.");
        setSharedContent([]);
      } finally {
        setSharedContentLoading(false);
      }
    };

    loadCounselor();
    loadSessions();
    loadMaterials();
    loadNotes();
    loadSharedContent();

    const interval = setInterval(() => { loadSessions(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProfile({
      bio: counselorBio,
      specialization: counselorSpecialization,
      availableHours: counselorAvailableHours,
      payoutInfo: counselorPayoutInfo,
    });
  }, [counselorBio, counselorSpecialization, counselorAvailableHours, counselorPayoutInfo]);

  const handleLogout = () => {
    localStorage.removeItem("counselor_token");
    localStorage.removeItem("counselor_data");
    localStorage.removeItem("counselor_online");
    navigate("/counselor/login");
  };

  const handleToggleOnline = () => {
    setIsOnline((prev) => {
      const next = !prev;
      localStorage.setItem("counselor_online", JSON.stringify(next));
      return next;
    });
  };

  const handleAccept = async (id) => {
    try {
      await api.post(`/counselor/sessions/${id}/accept`);
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: "Scheduled", computedStatus: "Scheduled" } : s));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to accept session.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.post(`/counselor/sessions/${id}/decline`);
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: "Declined", computedStatus: "Declined" } : s));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to decline session.");
    }
  };

  const updateSessionField = (id, field, value) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const persistSessionField = async (id, field, value) => {
    try {
      await api.patch(`/counselor/sessions/${id}`, { [field]: value });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save session updates.");
    }
  };

  const savePersonalNotes = async (notesPayload = personalNotes) => {
    setNotesError("");
    try {
      await api.post("/counselor/notes", { notes: notesPayload });
    } catch (err) {
      setNotesError(err?.response?.data?.message || "Failed to save notes.");
    }
  };

  const handleUploadMaterial = async (file) => {
    if (!file) return;
    setMaterialsError("");
    setMaterialsLoading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      await api.post("/counselor/materials", payload, { headers: { "Content-Type": "multipart/form-data" } });
      const { data } = await api.get("/counselor/materials");
      setMaterials(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setMaterialsError(err?.response?.data?.message || "Failed to upload material.");
    } finally {
      setMaterialsLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const { data } = await api.patch("/counselor/me", profile);
      setCounselor(data?.data || data || counselor);
      alert("Profile saved.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save profile.");
    }
  };

  const openSummaryModal = (sessionId) => {
    const session = sessions.find((s) => String(s.id) === String(sessionId));
    setSummaryModal({ open: true, sessionId, summary: session?.summary || "" });
  };

  const saveSecureSummary = async () => {
    if (!summaryModal.sessionId) return;
    try {
      await api.patch(`/counselor/sessions/${summaryModal.sessionId}`, { summary: summaryModal.summary });
      setSessions((prev) => prev.map((s) => String(s.id) === String(summaryModal.sessionId) ? { ...s, summary: summaryModal.summary } : s));
      setSummaryModal({ open: false, sessionId: null, summary: "" });
      alert("Session summary saved.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save summary.");
    }
  };

  const tabs = [
    { key: "overview",   label: "Overview",         icon: "🏠" },
    { key: "sessions",   label: "Sessions",          icon: "📅" },
    { key: "interaction",label: "Client Chat",       icon: "💬" },
    { key: "analytics",  label: "Analytics",         icon: "📊" },
    { key: "resources",  label: "Notes & Resources", icon: "📝" },
    { key: "settings",   label: "Settings",          icon: "⚙️" },
  ];

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-[#e6e5df] bg-white/90 backdrop-blur-xl">
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <button onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dadbd3] bg-white text-[#1f4e43] shadow-sm transition hover:bg-[#f7f8f5]">☰</button>
          <p className="font-serif text-lg font-semibold tracking-wide text-[#1f4e43]">MannSathi</p>
          <button onClick={handleLogout} className="rounded-2xl border border-[#dadbd3] bg-white px-3.5 py-2 text-xs font-semibold text-[#27584d] shadow-sm transition hover:bg-[#f7f8f5]">Logout</button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[#1f4e43]/35 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#215c4c] via-[#2b6557] to-[#3f7164] text-white px-6 py-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="font-serif font-semibold text-xl tracking-wide">MannSathi</div>
                <button onClick={() => setOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg">✕</button>
              </div>
              <div className="mt-6 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center font-bold text-base">{counselorNameLabel?.slice(0, 1)?.toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{counselorNameLabel}</p>
                    <p className="text-xs text-[#d6ebe2] truncate">{counselorEmailLabel}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-white/15 bg-black/10 px-3 py-2 text-xs text-[#d6ebe2]">{counselorSpecializationLabel}</div>
                <button onClick={handleToggleOnline} className={`mt-3 w-full rounded-2xl border px-3 py-2 text-xs font-semibold transition ${isOnline ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-100" : "border-white/20 bg-white/10 text-white/70"}`}>
                  {isOnline ? "● Online" : "○ Offline"}
                </button>
              </div>
              <nav className="mt-7 space-y-2 text-sm">
                {tabs.map((tab) => (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${activeTab === tab.key ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_8px_24px_rgba(20,43,37,0.18)]" : "text-white/95 hover:bg-white/10"}`}>
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <button onClick={handleLogout} className="mt-8 inline-flex rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#e4efe9]">Logout</button>
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="w-80 hidden md:flex bg-gradient-to-b from-[#255b4e] via-[#2d6154] to-[#466f64] text-white px-7 py-8 flex-col justify-between">
        <div>
          <div className="mb-10 rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🌿</div>
              <div>
                <p className="font-serif text-2xl font-semibold tracking-wide">MannSathi</p>
                <p className="text-[11px] text-[#d6ebe2]">Counselor workspace</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center font-bold text-lg">{counselorNameLabel?.slice(0, 1)?.toUpperCase()}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{counselorNameLabel}</p>
                <p className="text-xs text-[#d6ebe2] truncate">{counselorEmailLabel}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/15 bg-black/10 px-3 py-2 text-xs text-[#d6ebe2]">{counselorSpecializationLabel}</div>
            <button onClick={handleToggleOnline} className={`mt-3 w-full rounded-2xl border px-3 py-2 text-xs font-semibold transition ${isOnline ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-100" : "border-white/20 bg-white/10 text-white/70"}`}>
              {isOnline ? "● Online" : "○ Offline"}
            </button>
          </div>
          <nav className="space-y-2 text-sm">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${activeTab === tab.key ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]" : "text-white/95 hover:bg-white/10"}`}>
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="text-xs font-semibold rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-left text-[#e2efe8] hover:text-white">Logout</button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 px-4 md:px-10 xl:px-14 py-6 md:py-10 pt-24 md:pt-10 bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)] overflow-y-auto">

        {/* Welcome header */}
        <div className="mb-8 rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">Counselor Dashboard</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Welcome back, {counselorNameLabel} 👋
              </h1>
              <p className="mt-3 text-sm md:text-base text-[#5f6d68] font-medium">{todayDateLabel}</p>
            </div>
          </div>
          {isLoadingCounselor && <p className="mt-3 text-xs text-[#6b7280]">Loading profile...</p>}
          {!isLoadingCounselor && counselorError && <p className="mt-3 text-xs text-red-600">{counselorError}</p>}
          <div className="mt-7 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="Today's Sessions" value={analytics.todayTotal} hint="Scheduled for today" icon="📅" />
            <StatCard title="Upcoming" value={upcomingSessions.length} hint="Awaiting session time" icon="⏳" />
            <StatCard title="Completed" value={completedSessions.length} hint="Finished appointments" icon="✅" />
            <StatCard title="Total Clients" value={totalClients} hint="Unique people helped" icon="🤝" />
          </div>
        </div>

        {/* ── Overview tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {liveSessions.length > 0 && (
              <PanelCard title="Live Sessions" subtitle="Sessions that are active right now">
                <div className="space-y-3">
                  {liveSessions.map((s) => (
                    <SessionPreviewCard
                      key={`live-${s.id}`}
                      session={s}
                      onPrimary={() => { setSelectedSessionId(s.id); setActiveTab("interaction"); }}
                      onSecondary={() => { setSelectedSessionId(s.id); setActiveTab("resources"); }}
                      onJoinVideo={handleJoinVideoAsCounselor}  
                    />
                  ))}
                </div>
              </PanelCard>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <PanelCard title="Upcoming Sessions" subtitle="Your next scheduled counseling sessions"
                  action={<button onClick={() => setActiveTab("sessions")} className="px-3.5 py-2 rounded-xl border border-[#d7d9d0] text-xs font-semibold text-[#1f4e43] hover:bg-[#f7f8f5] transition">View all</button>}
                >
                  {sessionsLoading && <p className="text-sm text-[#6b7280]">Loading sessions...</p>}
                  {!sessionsLoading && sessionsError && <p className="text-sm text-red-600">{sessionsError}</p>}
                  {!sessionsLoading && !sessionsError && upcomingSessions.length === 0 && (
                    <div className="text-center py-10 rounded-2xl border border-dashed border-[#d6dbd2] bg-[#fbfcfa]">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-sm text-[#6b7280]">No upcoming sessions.</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {!sessionsLoading && !sessionsError && upcomingSessions.map((s) => (
                      <SessionPreviewCard key={s.id} session={s}
                        onPrimary={() => { setSelectedSessionId(s.id); setActiveTab("interaction"); }}
                        onSecondary={() => { setSelectedSessionId(s.id); setActiveTab("resources"); }}
                        onJoinVideo={handleJoinVideoAsCounselor}
                      />
                    ))}
                  </div>
                </PanelCard>

                <PanelCard title="Completed Sessions" subtitle="Review previous client outcomes">
                  {sessionsLoading && <p className="text-sm text-[#6b7280]">Loading sessions...</p>}
                  {!sessionsLoading && completedSessions.length === 0 && <p className="text-sm text-[#6b7280]">No completed sessions yet.</p>}
                  <div className="space-y-3">
                    {!sessionsLoading && completedSessions.map((s) => (
                      <CompletedSessionCard key={`completed-${s.id}`} session={s} onOpen={() => { setSelectedSessionId(s.id); openSummaryModal(s.id); }} />
                    ))}
                  </div>
                </PanelCard>
              </div>

              <div className="space-y-6">
                <PanelCard title="Quick Actions" subtitle="Counselor tools">
                  <div className="space-y-2.5">
                    <QuickActionBtn onClick={() => setActiveTab("interaction")}>💬 Start Session Chat</QuickActionBtn>
                    <QuickActionBtn secondary onClick={() => setActiveTab("sessions")}>📅 View Sessions</QuickActionBtn>
                    <QuickActionBtn secondary onClick={() => setActiveTab("resources")}>📝 Notes & Resources</QuickActionBtn>
                    <QuickActionBtn secondary onClick={() => setActiveTab("analytics")}>📊 View Analytics</QuickActionBtn>
                  </div>
                </PanelCard>

                <PanelCard title="Snapshot" subtitle="Quick activity overview">
                  <div className="space-y-3">
                    <MiniInfoRow label="Online Status" value={isOnline ? "Online" : "Offline"} />
                    <MiniInfoRow label="Live Sessions" value={String(liveSessions.length)} />
                    <MiniInfoRow label="Clients Supported" value={String(totalClients)} />
                    <MiniInfoRow label="Average Rating" value={String(analytics.avgRating)} />
                  </div>
                </PanelCard>
              </div>
            </div>
          </div>
        )}

        {/* ── Sessions tab ── */}
        {activeTab === "sessions" && (
          <PanelCard title="Session Management" subtitle="Handle approvals, notes, and session summaries">
            <div className="space-y-6">
              {sessionsLoading && <p className="text-sm text-[#6b7280]">Loading sessions...</p>}
              {!sessionsLoading && sessionsError && <p className="text-sm text-red-600">{sessionsError}</p>}
              <SessionGroup
                title="Today"
                items={groupedSessions.today}
                counselorName={counselorNameLabel}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onOpenChat={() => setActiveTab("interaction")}
                onOpenSummary={openSummaryModal}
                updateSessionField={updateSessionField}
                onSelect={setSelectedSessionId}
                onPersistField={persistSessionField}
                onJoinVideo={handleJoinVideoAsCounselor}
                videoLoading={videoLoading}
                videoError={videoError}
              />
              {groupedSessions.other.length > 0 && (
                <SessionGroup
                  title="Other Sessions"
                  items={groupedSessions.other}
                  counselorName={counselorNameLabel}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onOpenChat={() => setActiveTab("interaction")}
                  onOpenSummary={openSummaryModal}
                  updateSessionField={updateSessionField}
                  onSelect={setSelectedSessionId}
                  onPersistField={persistSessionField}
                  onJoinVideo={handleJoinVideoAsCounselor}
                  videoLoading={videoLoading}
                  videoError={videoError}
                />
              )}
            </div>
          </PanelCard>
        )}

        {/* ── Interaction tab ── */}
        {activeTab === "interaction" && (
          <PanelCard title="Client Chat" subtitle="Private communication connected to the selected session"
            action={selectedSession && (
              <div className="rounded-2xl border border-[#e7e5de] bg-[#f9faf8] px-4 py-2 text-sm text-[#5f6d68]">
                <span className="font-semibold text-[#1c2522]">{selectedSession.patient}</span>
                {" · "}{selectedSession.date || "Not set"}
                {" · "}{selectedSession.time || "Not set"}
              </div>
            )}
          >
            {!selectedSession && (
              <div className="text-center py-10 rounded-2xl border border-dashed border-[#d6dbd2] bg-[#fbfcfa]">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-semibold text-[#1f4e43]">No session selected</p>
                <p className="text-xs text-[#6b7280] mt-1">Go to Sessions and open a session first.</p>
              </div>
            )}
            <ChatPanel selectedSession={selectedSession} />
          </PanelCard>
        )}

        {/* ── Analytics tab ── */}
        {activeTab === "analytics" && (
          <PanelCard title="Analytics" subtitle="Track practice activity and client outcome trends">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Completed" value={completedSessions.length} hint="Finished sessions" icon="✅" />
              <StatCard title="Pending Approvals" value={analytics.pendingApprovals} hint="Awaiting response" icon="⏳" />
              <StatCard title="Upcoming" value={analytics.upcomingAppointments} hint="Booked ahead" icon="📅" />
              <StatCard title="Avg Rating" value={analytics.avgRating} hint="Client feedback" icon="⭐" />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.moodTrends.map((m) => (
                <div key={m.label} className="rounded-2xl border border-[#e7e5de] bg-white p-4">
                  <div className="text-sm font-semibold text-[#1c2522]">{m.label}</div>
                  <div className="mt-3 h-3 rounded-full bg-[#e9ece6] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e]" style={{ width: `${Math.min(m.value, 100)}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-[#6b7280]">{m.value}% trend level</div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {completedSessions.length === 0 && <p className="text-sm text-[#6b7280]">No completed sessions yet.</p>}
              {completedSessions.map((s) => (
                <div key={`history-${s.id}`} className="rounded-2xl border border-[#e7e5de] bg-white p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#1c2522]">{s.patient}</div>
                      <div className="text-xs text-[#6b7280] mt-1">{s.date || "Not set"} · {s.time || "Not set"} · {s.type || "—"}</div>
                      <div className="text-sm text-[#5f6d68] mt-2">{s.summary || s.notes || "No notes saved yet."}</div>
                    </div>
                    <button onClick={() => openSummaryModal(s.id)} className="px-4 py-2 rounded-xl border border-[#e7e5de] text-xs font-semibold hover:bg-[#f7f8f5] transition self-start">Open Summary</button>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        )}

        {/* ── Notes & Resources tab ── */}
        {activeTab === "resources" && (
          <PanelCard title="Session Notes & Resources" subtitle="Keep private counselor notes and upload support materials">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-[#e7e5de] p-5 bg-white">
                <div className="text-sm font-semibold text-[#1c2522]">Private Notes</div>
                <div className="text-xs text-[#6b7280] mt-1">Only visible to you</div>
                {notesLoading && <p className="mt-3 text-sm text-[#6b7280]">Loading notes...</p>}
                {!notesLoading && notesError && <p className="mt-3 text-sm text-red-600">{notesError}</p>}
                <textarea value={personalNotes} onChange={(e) => setPersonalNotes(e.target.value)}
                  className="mt-4 w-full min-h-[220px] rounded-2xl border border-[#e7e5de] bg-[#f9faf8] p-3 text-sm outline-none focus:ring-2 focus:ring-[#1f4e43]/20"
                  placeholder="Write your private counselor notes..." />
                <div className="mt-4 flex justify-end">
                  <button onClick={() => savePersonalNotes()} className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md">Save Notes</button>
                </div>
              </div>
              <div className="rounded-3xl border border-[#e7e5de] p-5 bg-white">
                <div className="text-sm font-semibold text-[#1c2522]">Upload Materials</div>
                <div className="text-xs text-[#6b7280] mt-1">PDFs, worksheets, guides, or self-help resources</div>
                {materialsError && <p className="mt-3 text-sm text-red-600">{materialsError}</p>}
                <label className="mt-4 block rounded-2xl border border-dashed border-[#c9ddd6] bg-[#eef7f3] p-5 cursor-pointer hover:bg-[#e4f1ed] transition">
                  <input type="file" className="hidden" onChange={(e) => handleUploadMaterial(e.target.files?.[0])} />
                  <div className="text-sm font-medium text-[#1f4e43]">{materialsLoading ? "Uploading..." : "Click to choose a file"}</div>
                  <div className="text-xs text-[#6b7280] mt-1">PDFs, docs, images accepted</div>
                </label>
                <div className="mt-4 space-y-2">
                  {materials.length === 0 && !materialsLoading && <p className="text-sm text-[#6b7280]">No materials uploaded yet.</p>}
                  {materials.map((item, idx) => (
                    <div key={item.id || idx} className="rounded-2xl border border-[#e7e5de] bg-[#f9faf8] px-3 py-3 text-sm text-[#1c2522]">
                      {item.title || item.name || item.file_name || `Material ${idx + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-[#e7e5de] p-5 bg-white">
              <div className="text-sm font-semibold text-[#1c2522]">Shared Platform Content</div>
              <div className="text-xs text-[#6b7280] mt-1">Content shared across the platform</div>
              {sharedContentLoading && <p className="mt-3 text-sm text-[#6b7280]">Loading content...</p>}
              {!sharedContentLoading && sharedContentError && <p className="mt-3 text-sm text-red-600">{sharedContentError}</p>}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {!sharedContentLoading && !sharedContentError && sharedContent.length === 0 && <p className="text-sm text-[#6b7280]">No shared content available.</p>}
                {sharedContent.map((item, idx) => (
                  <div key={item.id || idx} className="rounded-2xl border border-[#e7e5de] bg-[#f9faf8] p-3">
                    <div className="font-medium text-[#1c2522]">{item.title || item.name || `Content ${idx + 1}`}</div>
                    <div className="text-xs text-[#6b7280] mt-1">{item.description || "Shared platform content"}</div>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>
        )}

        {/* ── Settings tab ── */}
        {activeTab === "settings" && (
          <PanelCard title="Counselor Settings" subtitle="Update your professional details and availability">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Specialization" value={profile.specialization} onChange={(v) => setProfile((prev) => ({ ...prev, specialization: v }))} placeholder="Anxiety, Stress, Relationships" />
              <Field label="Available Hours" value={profile.availableHours} onChange={(v) => setProfile((prev) => ({ ...prev, availableHours: v }))} placeholder="Sun-Fri, 10 AM - 5 PM" />
              <div className="md:col-span-2">
                <Field label="Bio" textarea value={profile.bio} onChange={(v) => setProfile((prev) => ({ ...prev, bio: v }))} placeholder="Write your professional bio" />
              </div>
              <div className="md:col-span-2">
                <Field label="Payout Information" textarea value={profile.payoutInfo} onChange={(v) => setProfile((prev) => ({ ...prev, payoutInfo: v }))} placeholder="Optional payment / bank / wallet details" />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={saveProfile} className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md">Save Settings</button>
            </div>
          </PanelCard>
        )}
      </main>

      {/* ── Summary modal ── */}
      {summaryModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#e7e5de] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-[#1f4e43]">Secure Summary</div>
                <div className="text-sm text-[#6b7280]">Save a private summary for this session</div>
              </div>
              <button onClick={() => setSummaryModal({ open: false, sessionId: null, summary: "" })} className="px-3 py-2 rounded-xl border border-[#e7e5de] text-sm hover:bg-[#f7f8f5] transition">✕</button>
            </div>
            <textarea value={summaryModal.summary} onChange={(e) => setSummaryModal((prev) => ({ ...prev, summary: e.target.value }))}
              className="mt-4 w-full min-h-[220px] rounded-2xl border border-[#e7e5de] bg-[#f9faf8] p-3 text-sm outline-none focus:ring-2 focus:ring-[#1f4e43]/20"
              placeholder="Write secure session summary..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSummaryModal({ open: false, sessionId: null, summary: "" })} className="px-4 py-2 rounded-xl border border-[#e7e5de] text-sm font-semibold hover:bg-[#f7f8f5] transition">Cancel</button>
              <button onClick={saveSecureSummary} className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition shadow-md">Save Summary</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== SUB-COMPONENTS ===================== */

function PanelCard({ title, subtitle, action, children }) {
  return (
    <div className="mb-6 rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-6 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#1f4e43]">{title}</h2>
          {subtitle && <p className="text-sm text-[#6b7280] mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatCard({ title, value, hint, icon }) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-[#e7e5de] shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">{title}</div>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-[#1f4e43]">{value}</p>
      <p className="text-[11px] text-[#95a19b] mt-1">{hint}</p>
    </div>
  );
}

function MiniInfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#e7e5de] bg-[#f9faf8] px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#1c2522]">{value}</div>
    </div>
  );
}

function QuickActionBtn({ children, secondary = false, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold transition text-left ${secondary ? "border border-[#d7d9d0] text-[#1f4e43] hover:bg-[#f7f8f5]" : "bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white hover:shadow-lg hover:-translate-y-0.5 shadow-md"}`}>
      {children}
    </button>
  );
}

function Badge({ status = "pending" }) {
  const normalized = (status || "").toLowerCase().trim();
  const base = "text-[11px] rounded-full px-3 py-1 border whitespace-nowrap capitalize font-semibold";
  const cls =
    normalized === "confirmed" || normalized === "scheduled" ? `${base} bg-emerald-50 border-emerald-200 text-emerald-700`
    : normalized === "completed" ? `${base} bg-green-50 border-green-200 text-green-700`
    : normalized === "live" ? `${base} bg-emerald-50 border-emerald-300 text-emerald-800`
    : normalized === "cancelled" || normalized === "declined" ? `${base} bg-gray-50 border-gray-200 text-gray-600`
    : `${base} bg-amber-50 border-amber-200 text-amber-700`;
  return <span className={cls}>{normalized || "pending"}</span>;
}

function SessionPreviewCard({ session, onPrimary, onSecondary, onJoinVideo }) {
  const isVideo = session.type === "video";
  const isLive = session.phase === "live";

  return (
    <div className="rounded-2xl border border-[#e7e5de] bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm flex-1">
          <InfoCell label="Patient" value={session.patient || "—"} />
          <InfoCell label="Date" value={session.date || "Not set"} />
          <InfoCell label="Time" value={session.time || "Not set"} />
          <InfoCell label="Type" value={isVideo ? "🎥 Video" : "💬 Chat"} capitalize />
          <InfoCell label="Status" value={getStatusLabel(session.computedStatus)} capitalize />
        </div>
        <div className="flex gap-2">
          {isVideo && isLive ? (
            <button
              onClick={() => onJoinVideo?.(session.id)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white text-xs font-semibold hover:shadow-md transition"
            >
              🎥 Join Video
            </button>
          ) : (
            <button
              onClick={onPrimary}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white text-xs font-semibold hover:shadow-md transition"
            >
              💬 Open Chat
            </button>
          )}
          <button onClick={onSecondary} className="px-4 py-2 rounded-xl border border-[#d7d9d0] text-xs font-semibold text-[#1f4e43] hover:bg-[#f7f8f5] transition">Write Notes</button>
        </div>
      </div>
    </div>
  );
}

function CompletedSessionCard({ session, onOpen }) {
  return (
    <div className="rounded-2xl border border-[#e7e5de] bg-white p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1c2522]">{session.patient || "—"}</p>
          <p className="text-xs text-[#6b7280] mt-1">{session.date || "Not set"} · {session.time || "Not set"}</p>
          <p className="text-xs text-[#5f6d68] mt-2 line-clamp-2">{session.summary || session.notes || "No summary available yet."}</p>
        </div>
        <button onClick={onOpen} className="px-4 py-2 rounded-xl border border-[#d7d9d0] text-xs font-semibold text-[#1f4e43] hover:bg-[#f7f8f5] transition self-start">View Notes</button>
      </div>
    </div>
  );
}

function InfoCell({ label, value, capitalize = false }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">{label}</p>
      <p className={`mt-1 font-medium text-[#1c2522] text-sm ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", textarea = false }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-[#1c2522] mb-2">{label}</div>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full min-h-[120px] rounded-2xl border border-[#e7e5de] bg-[#f9faf8] p-3 text-sm outline-none focus:ring-2 focus:ring-[#1f4e43]/20" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-2xl border border-[#e7e5de] bg-[#f9faf8] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1f4e43]/20" />
      )}
    </label>
  );
}

function SessionGroup({ title, items = [], counselorName, onAccept, onDecline, onOpenChat, onOpenSummary, updateSessionField, onSelect, onPersistField, onJoinVideo, videoLoading = {}, videoError = {} }) {
  return (
    <div>
      <div className="text-sm font-bold text-[#1f4e43] mb-3">{title}</div>
      {items.length === 0 ? (
        <p className="text-sm text-[#6b7280]">No sessions.</p>
      ) : (
        <div className="space-y-4">
          {items.map((s) => {
            const displayBadge =
              s.phase === "live" && s.computedStatus === "Scheduled" ? "live"
              : s.computedStatus === "Scheduled" ? "confirmed"
              : s.computedStatus === "Completed" ? "completed"
              : s.computedStatus === "Declined" ? "cancelled"
              : s.computedStatus;

            const isVideo = s.type === "video";
            const isChat  = s.type === "chat" || s.type === "Chat" || (!isVideo && s.type !== "video");

            const canJoinChat =
              isChat &&
              s.phase === "live" &&
              !["Declined", "Completed"].includes(s.computedStatus);

            const canJoinVideo =
              isVideo &&
              s.phase === "live" &&
              !["Declined", "Completed"].includes(s.computedStatus);

            const isVideoJoining = videoLoading[s.id] || false;
            const videoErr = videoError[s.id] || "";

            return (
              <div key={s.id} className="p-5 rounded-2xl border border-[#e7e5de] bg-white shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#1c2522]">{s.patient}</div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6b7280]">
                      <span>Counselor: <span className="font-semibold text-[#1c2522]">{counselorName || "—"}</span></span>
                      <span>Date: <span className="font-semibold text-[#1c2522]">{s.date || "Not set"}</span></span>
                      <span>Time: <span className="font-semibold text-[#1c2522]">{s.time || "Not set"}</span></span>
                      <span>Type: <span className="font-semibold text-[#1c2522] capitalize">{isVideo ? "🎥 Video" : "💬 Chat"}</span></span>
                      <span>Phase: <span className="font-semibold text-[#1c2522] capitalize">{s.phase || "—"}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Badge status={displayBadge} />

                    {s.computedStatus === "Pending" && (
                      <>
                        <button onClick={() => onAccept(s.id)} className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white text-xs font-semibold hover:shadow-md transition">Accept</button>
                        <button onClick={() => onDecline(s.id)} className="px-3 py-2 rounded-xl border border-[#d7d9d0] text-xs font-semibold text-[#1f4e43] hover:bg-[#f7f8f5] transition">Decline</button>
                      </>
                    )}

                    {/* ── Chat join button ── */}
                    {canJoinChat && (
                      <button onClick={() => { onSelect?.(s.id); onOpenChat?.(); }}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white text-xs font-semibold hover:shadow-md transition">
                        💬 Join Chat
                      </button>
                    )}

                    {/* ── Video join button ── */}
                    {canJoinVideo && (
                      <button
                        onClick={() => onJoinVideo?.(s.id)}
                        disabled={isVideoJoining}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          isVideoJoining
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white hover:shadow-md"
                        }`}
                      >
                        {isVideoJoining ? (
                          <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Starting...</>
                        ) : <>🎥 Join Video</>}
                      </button>
                    )}

                    {/* ── Video error ── */}
                    {videoErr && (
                      <p className="text-xs text-red-500 w-full text-right">{videoErr}</p>
                    )}

                    <button onClick={() => { onSelect?.(s.id); onOpenSummary?.(s.id); }}
                      className="px-3 py-2 rounded-xl border border-[#d7d9d0] text-xs font-semibold text-[#1f4e43] hover:bg-[#f7f8f5] transition">
                      📋 Session Notes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status) {
  const s = (status || "").toLowerCase().trim();
  if (s === "scheduled") return "confirmed";
  if (s === "declined" || s === "canceled" || s === "cancelled") return "cancelled";
  if (s === "completed") return "completed";
  return s || "pending";
}