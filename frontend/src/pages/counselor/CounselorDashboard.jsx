import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPanel from "./ChatPanel";
import api from "../../utils/api";

const API_BASE = import.meta.env.VITE_API_BASE;
const SESSION_DURATION_MINUTES = 60;

if (API_BASE) {
  api.defaults.baseURL = API_BASE;
}

export default function CounselorDashboard() {
  const navigate = useNavigate();

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

  const counselorName = counselor?.name || counselor?.full_name || "";
  const counselorEmail = counselor?.email || "";
  const counselorSpecialization = counselor?.specialization || "";
  const counselorBio = counselor?.bio || "";
  const counselorAvailableHours =
    counselor?.available_hours || counselor?.availableHours || "";
  const counselorPayoutInfo = counselor?.payoutInfo || "";

  const counselorNameLabel =
    counselorName || storedCounselor?.name || storedCounselor?.full_name || "—";

  const counselorEmailLabel = counselorEmail || storedCounselor?.email || "—";

  const counselorSpecializationLabel =
    counselorSpecialization || storedCounselor?.specialization || "—";

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

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
      return str.slice(0, 5);
    }

    const d = new Date(str);
    if (!isValidDate(d)) return null;

    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

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

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

    if (["declined", "cancelled", "canceled"].includes(normalized)) {
      return "Declined";
    }

    if (normalized === "completed") {
      return "Completed";
    }

    if (!sessionStart || !sessionEnd) {
      if (normalized === "scheduled" || normalized === "confirmed") {
        return "Scheduled";
      }
      return rawStatus || "Pending";
    }

    if (now > sessionEnd) {
      return "Completed";
    }

    if (normalized === "scheduled" || normalized === "confirmed") {
      return "Scheduled";
    }

    if (normalized === "pending") {
      return "Pending";
    }

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
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const completedSessions = useMemo(() => {
    return sessions.filter((s) => s.computedStatus === "Completed");
  }, [sessions]);

  const totalClients = useMemo(() => {
    return new Set(sessions.map((s) => s.patient).filter(Boolean)).size;
  }, [sessions]);

  const todaySessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((s) => s.sessionStart && isSameCalendarDay(s.sessionStart, now));
  }, [sessions]);

  const liveSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.phase === "live" &&
        !["Declined", "Completed"].includes(s.computedStatus)
    );
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.phase === "upcoming" &&
        !["Declined", "Completed"].includes(s.computedStatus)
    );
  }, [sessions]);

  const groupedSessions = useMemo(() => {
    const now = new Date();
    const today = sessions.filter((s) => s.sessionStart && isSameCalendarDay(s.sessionStart, now));
    const other = sessions.filter(
      (s) => !s.sessionStart || !isSameCalendarDay(s.sessionStart, now)
    );
    return { today, other };
  }, [sessions]);

  const analytics = useMemo(() => {
    const pendingApprovals = sessions.filter((s) => s.computedStatus === "Pending").length;
    const rated = sessions
      .map((s) => s.rating)
      .filter((v) => typeof v === "number");

    const avgRating = rated.length
      ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1)
      : "—";

    const quizSessions = sessions.filter((s) => s.quizShared && s.quiz);

    const avg = (key) => {
      if (!quizSessions.length) return 0;
      const sum = quizSessions.reduce(
        (acc, s) => acc + Number(s.quiz?.[key] || 0),
        0
      );
      return Math.round((sum / quizSessions.length) * 10);
    };

    return {
      todayTotal: todaySessions.length,
      pendingApprovals,
      upcomingAppointments: upcomingSessions.length,
      avgRating,
      weeklySessions: sessions.length,
      monthlySessions: sessions.length,
      moodTrends: [
        { label: "Stress", value: avg("stress") },
        { label: "Anxiety", value: avg("anxiety") },
        { label: "Sleep", value: avg("sleep") },
      ],
    };
  }, [sessions, todaySessions.length, upcomingSessions.length]);

  const dailyMessage = useMemo(() => {
    return isOnline
      ? "You are online and available for active counseling support."
      : "You are offline. New client requests should pause until you return.";
  }, [isOnline]);

  useEffect(() => {
    const loadCounselor = async () => {
      setCounselorError("");
      setIsLoadingCounselor(true);
      try {
        const { data } = await api.get("/counselor/me");
        setCounselor(data?.data || data || null);
      } catch (err) {
        setCounselorError(
          err?.response?.data?.message || "Failed to load counselor profile."
        );
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
          const normalizedDate = normalizeDateOnly(
            s.raw_date ||
              s.session_date ||
              s.appointment_date ||
              s.date ||
              null
          );

          const normalizedTime = normalizeTimeOnly(
            s.raw_time ||
              s.session_time ||
              s.appointment_time ||
              s.time ||
              null
          );

          const sessionStart = buildLocalDateTime(normalizedDate, normalizedTime);
          const sessionEnd = sessionStart
            ? new Date(sessionStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000)
            : null;

          const patientName =
            s.patient?.name ||
            s.patient_name ||
            s.client?.name ||
            s.user?.name ||
            s.patient ||
            s.guest_name ||
            "—";

          const computedStatus = getComputedSessionStatus(
            s.status,
            sessionStart,
            sessionEnd
          );

          const phase = getSessionPhase(sessionStart, sessionEnd);

          return {
            id: s.id,
            patient: patientName,
            time: formatSessionTimeLabel(normalizedTime),
            date: formatSessionDateLabel(normalizedDate),
            type: s.type || s.mode || s.session_type || "",
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
            rawDateTime:
              sessionStart && normalizedDate && normalizedTime
                ? `${normalizedDate} ${normalizedTime}:00`
                : null,
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
        const raw = Array.isArray(data) ? data : data?.data || [];
        setMaterials(raw);
      } catch (err) {
        setMaterialsError(
          err?.response?.data?.message || "Failed to load materials."
        );
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
        if (typeof data === "string") {
          setPersonalNotes(data);
        } else if (typeof data?.notes === "string") {
          setPersonalNotes(data.notes);
        } else {
          setPersonalNotes("");
        }
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
        const raw = Array.isArray(data) ? data : data?.data || [];
        setSharedContent(raw);
      } catch (err) {
        setSharedContentError(
          err?.response?.data?.message || "Failed to load shared content."
        );
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

    const interval = setInterval(() => {
      loadSessions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProfile({
      bio: counselorBio,
      specialization: counselorSpecialization,
      availableHours: counselorAvailableHours,
      payoutInfo: counselorPayoutInfo,
    });
  }, [
    counselorBio,
    counselorSpecialization,
    counselorAvailableHours,
    counselorPayoutInfo,
  ]);

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
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "Scheduled", computedStatus: "Scheduled" }
            : s
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to accept session.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.post(`/counselor/sessions/${id}/decline`);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "Declined", computedStatus: "Declined" }
            : s
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to decline session.");
    }
  };

  const updateSessionField = (id, field, value) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
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

      await api.post("/counselor/materials", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { data } = await api.get("/counselor/materials");
      const raw = Array.isArray(data) ? data : data?.data || [];
      setMaterials(raw);
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
    setSummaryModal({
      open: true,
      sessionId,
      summary: session?.summary || "",
    });
  };

  const saveSecureSummary = async () => {
    if (!summaryModal.sessionId) return;

    try {
      await api.patch(`/counselor/sessions/${summaryModal.sessionId}`, {
        summary: summaryModal.summary,
      });

      setSessions((prev) =>
        prev.map((s) =>
          String(s.id) === String(summaryModal.sessionId)
            ? { ...s, summary: summaryModal.summary }
            : s
        )
      );

      setSummaryModal({ open: false, sessionId: null, summary: "" });
      alert("Session summary saved.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save summary.");
    }
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "sessions", label: "Sessions", icon: "📅" },
    { key: "interaction", label: "Client Interaction", icon: "💬" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "resources", label: "Notes & Resources", icon: "📝" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#fdfcf9_0%,_#f6f2eb_45%,_#efe8dd_100%)] text-[#1c2b2d]">
      <div className="sticky top-0 z-30 border-b border-[#e7dfd2] bg-white/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#1f4e43] to-[#2a6b5e] text-white flex items-center justify-center font-bold shadow-md">
              M
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[#1c2b2d] truncate">MannSathi Counselor</div>
              <div className="text-xs text-[#6b6f6a] truncate">{counselorSpecializationLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOnline}
              className={[
                "px-4 py-2 rounded-2xl text-sm font-semibold border transition",
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-50 text-gray-700 border-gray-200",
              ].join(" ")}
            >
              {isOnline ? "Online" : "Offline"}
            </button>

            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-[#1c2b2d] truncate">{counselorNameLabel}</div>
              <div className="text-xs text-[#6b6f6a] truncate">{counselorEmailLabel}</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-2xl bg-[#0f2d2b] text-white hover:opacity-95 text-sm font-semibold shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <div className="bg-white/85 backdrop-blur rounded-3xl shadow-sm border border-[#ece5da] p-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] flex items-center justify-center font-bold text-[#1f4e43] text-lg">
                {counselorNameLabel?.slice(0, 1)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[#1c2b2d] truncate">{counselorNameLabel}</div>
                <div className="text-xs text-[#6b6f6a] truncate">{counselorEmailLabel}</div>
                <div className="mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold border border-[#e3e6de] bg-[#fafbf8] text-[#5f6562]">
                  {counselorSpecializationLabel}
                </div>
              </div>
            </div>

            {isLoadingCounselor && (
              <div className="mt-3 text-xs text-[#6b6f6a]">Loading profile...</div>
            )}
            {!isLoadingCounselor && counselorError && (
              <div className="mt-3 text-xs text-red-600">{counselorError}</div>
            )}

            <div className="mt-5 space-y-2">
              {tabs.map((tab) => (
                <SideBtn
                  key={tab.key}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </SideBtn>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-white/85 backdrop-blur rounded-3xl shadow-sm border border-[#ece5da] p-5">
            <div className="text-sm font-semibold text-[#1c2b2d]">Daily Focus</div>
            <p className="text-xs text-[#6b6f6a] mt-1">{dailyMessage}</p>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#f8fbf8] to-[#f5f1e8] border border-[#e8e2d7] p-4">
              <p className="text-xs uppercase tracking-wider text-[#7c7b77] font-semibold">Mindful Reminder</p>
              <p className="mt-2 text-sm text-[#485452] leading-relaxed">💡 {pickMotivation()}</p>
            </div>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9 space-y-6">
          <section className="bg-white/85 backdrop-blur rounded-3xl shadow-sm border border-[#ece5da] p-5 md:p-6">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#7a8c84] font-semibold">
                  Counselor Workspace
                </p>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent">
                  Welcome back, {counselorNameLabel}
                </h1>
                <p className="mt-3 text-sm md:text-base text-[#5f6d68] font-medium">
                  Manage sessions, connect with clients, and organize your counseling workflow.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4ddd2] bg-[#f9f7f2] px-4 py-3 text-sm text-[#5f6562] shadow-sm">
                {todayDateLabel}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Today's Sessions"
                value={analytics.todayTotal}
                hint="Scheduled for today"
                icon="📅"
              />
              <StatCard
                title="Upcoming Sessions"
                value={upcomingSessions.length}
                hint="Awaiting session time"
                icon="⏳"
              />
              <StatCard
                title="Completed Sessions"
                value={completedSessions.length}
                hint="Finished appointments"
                icon="✅"
              />
              <StatCard
                title="Total Clients"
                value={totalClients}
                hint="Unique people helped"
                icon="🤝"
              />
            </div>
          </section>

          {activeTab === "overview" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 xl:col-span-8 space-y-6">
                {liveSessions.length > 0 && (
                  <PanelCard
                    title="Live Sessions"
                    subtitle="Sessions that are active right now"
                  >
                    <div className="space-y-3">
                      {liveSessions.map((s) => (
                        <SessionPreviewCard
                          key={`live-${s.id}`}
                          session={s}
                          onPrimary={() => {
                            setSelectedSessionId(s.id);
                            setActiveTab("interaction");
                          }}
                          onSecondary={() => {
                            setSelectedSessionId(s.id);
                            setActiveTab("resources");
                          }}
                        />
                      ))}
                    </div>
                  </PanelCard>
                )}

                <PanelCard
                  title="Upcoming Sessions"
                  subtitle="Your next scheduled counseling sessions"
                  action={
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="px-3.5 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-[#f8f6f2] transition"
                    >
                      View all
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {sessionsLoading && (
                      <div className="text-sm text-[#6b6f6a]">Loading sessions...</div>
                    )}
                    {!sessionsLoading && sessionsError && (
                      <div className="text-sm text-red-600">{sessionsError}</div>
                    )}
                    {!sessionsLoading && !sessionsError && upcomingSessions.length === 0 && (
                      <div className="text-sm text-[#6b6f6a]">No upcoming sessions.</div>
                    )}

                    {!sessionsLoading &&
                      !sessionsError &&
                      upcomingSessions.map((s) => (
                        <SessionPreviewCard
                          key={s.id}
                          session={s}
                          onPrimary={() => {
                            setSelectedSessionId(s.id);
                            setActiveTab("interaction");
                          }}
                          onSecondary={() => {
                            setSelectedSessionId(s.id);
                            setActiveTab("resources");
                          }}
                        />
                      ))}
                  </div>
                </PanelCard>

                <PanelCard
                  title="Completed Sessions"
                  subtitle="Review previous client outcomes and secure notes"
                >
                  <div className="space-y-3">
                    {sessionsLoading && (
                      <div className="text-sm text-[#6b6f6a]">Loading sessions...</div>
                    )}
                    {!sessionsLoading && sessionsError && (
                      <div className="text-sm text-red-600">{sessionsError}</div>
                    )}
                    {!sessionsLoading && !sessionsError && completedSessions.length === 0 && (
                      <div className="text-sm text-[#6b6f6a]">No completed sessions yet.</div>
                    )}

                    {!sessionsLoading &&
                      !sessionsError &&
                      completedSessions.map((s) => (
                        <CompletedSessionCard
                          key={`completed-${s.id}`}
                          session={s}
                          onOpen={() => {
                            setSelectedSessionId(s.id);
                            openSummaryModal(s.id);
                          }}
                        />
                      ))}
                  </div>
                </PanelCard>
              </div>

              <div className="col-span-12 xl:col-span-4">
                <div className="sticky top-24 space-y-6">
                  <PanelCard title="Quick Actions" subtitle="Frequently used counselor tools">
                    <div className="space-y-2.5">
                      <QuickActionBtn onClick={() => setActiveTab("interaction")}>
                        Start Session
                      </QuickActionBtn>
                      <QuickActionBtn secondary onClick={() => setActiveTab("sessions")}>
                        View Schedule
                      </QuickActionBtn>
                      <QuickActionBtn secondary onClick={() => setActiveTab("resources")}>
                        Notes & Resources
                      </QuickActionBtn>
                      <QuickActionBtn secondary onClick={() => setActiveTab("analytics")}>
                        View Analytics
                      </QuickActionBtn>
                    </div>
                  </PanelCard>

                  <PanelCard title="Practice Snapshot" subtitle="A quick overview of your activity">
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

          {activeTab === "sessions" && (
            <PanelCard
              title="Session Management"
              subtitle="Handle approvals, notes, live chat, and secure summaries"
            >
              <div className="space-y-6">
                {sessionsLoading && (
                  <div className="text-sm text-[#6b6f6a]">Loading sessions...</div>
                )}
                {!sessionsLoading && sessionsError && (
                  <div className="text-sm text-red-600">{sessionsError}</div>
                )}

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
                  />
                )}
              </div>
            </PanelCard>
          )}

          {activeTab === "interaction" && (
            <PanelCard
              title="Client Interaction"
              subtitle="Private communication space connected to the selected session"
              action={
                selectedSession && (
                  <div className="rounded-2xl border border-[#e4ddd2] bg-[#faf8f3] px-4 py-2 text-sm text-[#5f6562]">
                    Selected:{" "}
                    <span className="font-semibold text-[#1c2b2d]">{selectedSession.patient}</span>
                    {" · "}
                    {selectedSession.date || "Not set"}
                    {" · "}
                    {selectedSession.time || "Not set"}
                    {" · "}
                    <span className="capitalize">{selectedSession.phase}</span>
                  </div>
                )
              }
            >
              <ChatPanel selectedSession={selectedSession} />
            </PanelCard>
          )}

          {activeTab === "analytics" && (
            <PanelCard
              title="Completed Sessions & Analytics"
              subtitle="Track practice activity and client outcome trends"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard label="Completed Sessions" value={completedSessions.length} />
                <MetricCard label="Pending Approvals" value={analytics.pendingApprovals} />
                <MetricCard label="Upcoming Appointments" value={analytics.upcomingAppointments} />
                <MetricCard label="Average Rating" value={analytics.avgRating} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.moodTrends.map((m) => (
                  <div key={m.label} className="rounded-2xl border border-[#e4ddd2] bg-[#fcfbf8] p-4">
                    <div className="text-sm font-semibold text-[#1c2b2d]">{m.label}</div>
                    <div className="mt-3 h-3 rounded-full bg-[#ece7dd] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#215c4c] to-[#4f7e71]"
                        style={{ width: `${Math.min(m.value, 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-[#6b6f6a]">{m.value}% trend level</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {completedSessions.length === 0 && (
                  <div className="text-sm text-[#6b6f6a]">No completed sessions yet.</div>
                )}

                {completedSessions.map((s) => (
                  <div
                    key={`history-${s.id}`}
                    className="rounded-2xl border border-[#e4ddd2] bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#1c2b2d]">{s.patient}</div>
                        <div className="text-xs text-[#6b6f6a] mt-1">
                          {s.date || "Not set"} · {s.time || "Not set"} · {s.type || "—"}
                        </div>
                        <div className="text-sm text-[#5f6562] mt-2">
                          {s.summary || s.notes || "No notes saved yet."}
                        </div>
                      </div>

                      <button
                        onClick={() => openSummaryModal(s.id)}
                        className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-[#f8f6f2]"
                      >
                        Open Summary
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </PanelCard>
          )}

          {activeTab === "resources" && (
            <PanelCard
              title="Session Notes & Resources"
              subtitle="Keep private counselor notes and upload support materials"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-[#e4ddd2] p-4 bg-[#fffdfa]">
                  <div className="text-sm font-semibold text-[#1c2b2d]">Private Notes</div>
                  <div className="text-xs text-[#6b6f6a] mt-1">
                    Notes only visible to the counselor
                  </div>

                  {notesLoading && (
                    <div className="mt-3 text-sm text-[#6b6f6a]">Loading notes...</div>
                  )}
                  {!notesLoading && notesError && (
                    <div className="mt-3 text-sm text-red-600">{notesError}</div>
                  )}

                  <textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    className="mt-4 w-full min-h-[220px] rounded-2xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                    placeholder="Write your private counselor notes..."
                  />

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => savePersonalNotes()}
                      className="px-4 py-2 rounded-2xl bg-[#0f2d2b] text-white text-sm font-semibold hover:opacity-95"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#e4ddd2] p-4 bg-[#fffdfa]">
                  <div className="text-sm font-semibold text-[#1c2b2d]">Upload Materials</div>
                  <div className="text-xs text-[#6b6f6a] mt-1">
                    PDFs, worksheets, guides, or self-help resources
                  </div>

                  {materialsError && (
                    <div className="mt-3 text-sm text-red-600">{materialsError}</div>
                  )}

                  <label className="mt-4 block rounded-2xl border border-dashed border-[#cfe2da] bg-[#fcfdfa] p-5 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleUploadMaterial(e.target.files?.[0])}
                    />
                    <div className="text-sm font-medium text-[#305b39]">
                      {materialsLoading ? "Uploading..." : "Choose file to upload"}
                    </div>
                    <div className="text-xs text-[#6b6f6a] mt-1">
                      Click here and select your file
                    </div>
                  </label>

                  <div className="mt-4 space-y-2">
                    {materials.length === 0 && !materialsLoading && (
                      <div className="text-sm text-[#6b6f6a]">No materials uploaded yet.</div>
                    )}

                    {materials.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="rounded-2xl border border-[#e4ddd2] bg-[#faf8f3] px-3 py-3 text-sm"
                      >
                        {item.title || item.name || item.file_name || `Material ${idx + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[#e4ddd2] p-4 bg-[#fffdfa]">
                <div className="text-sm font-semibold text-[#1c2b2d]">Shared Platform Content</div>
                <div className="text-xs text-[#6b6f6a] mt-1">
                  Content shared across the platform
                </div>

                {sharedContentLoading && (
                  <div className="mt-3 text-sm text-[#6b6f6a]">Loading content...</div>
                )}
                {!sharedContentLoading && sharedContentError && (
                  <div className="mt-3 text-sm text-red-600">{sharedContentError}</div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sharedContent.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl border border-[#e4ddd2] bg-[#fcfbf8] p-3"
                    >
                      <div className="font-medium text-[#1c2b2d]">
                        {item.title || item.name || `Content ${idx + 1}`}
                      </div>
                      <div className="text-xs text-[#6b6f6a] mt-1">
                        {item.description || "Shared platform content"}
                      </div>
                    </div>
                  ))}

                  {!sharedContentLoading && !sharedContentError && sharedContent.length === 0 && (
                    <div className="text-sm text-[#6b6f6a]">
                      No shared content available.
                    </div>
                  )}
                </div>
              </div>
            </PanelCard>
          )}

          {activeTab === "settings" && (
            <PanelCard
              title="Counselor Settings"
              subtitle="Update your professional details and availability"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Specialization"
                  value={profile.specialization}
                  onChange={(v) => setProfile((prev) => ({ ...prev, specialization: v }))}
                  placeholder="Anxiety, Stress, Relationships"
                />

                <Field
                  label="Available Hours"
                  value={profile.availableHours}
                  onChange={(v) => setProfile((prev) => ({ ...prev, availableHours: v }))}
                  placeholder="Sun-Fri, 10 AM - 5 PM"
                />

                <div className="md:col-span-2">
                  <Field
                    label="Bio"
                    textarea
                    value={profile.bio}
                    onChange={(v) => setProfile((prev) => ({ ...prev, bio: v }))}
                    placeholder="Write your professional bio"
                  />
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Payout Information"
                    textarea
                    value={profile.payoutInfo}
                    onChange={(v) => setProfile((prev) => ({ ...prev, payoutInfo: v }))}
                    placeholder="Optional payment / bank / wallet details"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 rounded-2xl bg-[#0f2d2b] text-white text-sm font-semibold hover:opacity-95"
                >
                  Save Settings
                </button>
              </div>
            </PanelCard>
          )}
        </main>
      </div>

      {summaryModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#e4ddd2] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-[#1c2b2d]">Secure Summary</div>
                <div className="text-sm text-[#6b6f6a]">
                  Save a private summary for this session
                </div>
              </div>

              <button
                onClick={() =>
                  setSummaryModal({ open: false, sessionId: null, summary: "" })
                }
                className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-sm"
              >
                Close
              </button>
            </div>

            <textarea
              value={summaryModal.summary}
              onChange={(e) =>
                setSummaryModal((prev) => ({ ...prev, summary: e.target.value }))
              }
              className="mt-4 w-full min-h-[220px] rounded-2xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
              placeholder="Write secure session summary..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() =>
                  setSummaryModal({ open: false, sessionId: null, summary: "" })
                }
                className="px-4 py-2 rounded-xl border border-[#e4ddd2] text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveSecureSummary}
                className="px-4 py-2 rounded-xl bg-[#0f2d2b] text-white text-sm font-semibold"
              >
                Save Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PanelCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white/85 backdrop-blur rounded-3xl shadow-sm border border-[#ece5da] p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-[#1c2b2d]">{title}</div>
          {subtitle && <div className="text-sm text-[#6b6f6a] mt-1">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function SideBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition",
        active
          ? "bg-[#0f2d2b] text-white shadow-sm"
          : "text-[#5f6562] hover:bg-[#faf8f4]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, hint, icon }) {
  return (
    <div className="rounded-3xl border border-[#e4ddd2] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#7c7b77]">
          {title}
        </div>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold text-[#1c2b2d]">{value}</div>
      <div className="mt-1 text-xs text-[#6b6f6a]">{hint}</div>
    </div>
  );
}

function QuickActionBtn({ children, secondary = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full px-4 py-3 rounded-2xl text-sm font-semibold transition",
        secondary
          ? "border border-[#e4ddd2] text-[#1c2b2d] hover:bg-[#f8f6f2]"
          : "bg-[#0f2d2b] text-white hover:opacity-95",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function MiniInfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#ece5da] bg-[#fcfbf8] px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-[#7c7b77] font-semibold">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#1c2b2d]">{value}</div>
    </div>
  );
}

function SessionPreviewCard({ session, onPrimary, onSecondary }) {
  return (
    <div className="rounded-2xl border border-[#e4ddd2] bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm flex-1">
          <InfoCell label="User name" value={session.patient || "—"} />
          <InfoCell label="Date" value={session.date || "Not set"} />
          <InfoCell label="Time" value={session.time || "Not set"} />
          <InfoCell label="Session type" value={session.type || "—"} capitalize />
          <InfoCell label="Status" value={getStatusLabel(session.computedStatus)} capitalize />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrimary}
            className="px-3 py-2 rounded-xl bg-[#0f2d2b] text-white text-xs font-semibold hover:opacity-95 transition"
          >
            Open Session
          </button>
          <button
            onClick={onSecondary}
            className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-[#f8f6f2] transition"
          >
            Write Notes
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletedSessionCard({ session, onOpen }) {
  return (
    <div className="rounded-2xl border border-[#e4ddd2] bg-white p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1c2b2d]">{session.patient || "—"}</p>
          <p className="text-xs text-[#6b6f6a] mt-1">{session.date || "Not set"}</p>
          <p className="text-xs text-[#5f6562] mt-2 line-clamp-2">
            {session.summary || session.notes || "No summary available yet."}
          </p>
        </div>

        <button
          onClick={onOpen}
          className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-[#f8f6f2] transition"
        >
          View Notes
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#e4ddd2] bg-[#fcfbf8] p-4">
      <div className="text-xs uppercase tracking-wide text-[#7c7b77] font-semibold">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-[#1c2b2d]">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  textarea = false,
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-[#1c2b2d] mb-2">{label}</div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[120px] rounded-2xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[#e4ddd2] bg-[#fffdf9] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
        />
      )}
    </label>
  );
}

function InfoCell({ label, value, capitalize = false }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-[#7c7b77] font-semibold">
        {label}
      </p>
      <p className={`mt-1 font-medium text-[#1c2b2d] ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Badge({ status = "pending" }) {
  const normalized = (status || "").toLowerCase().trim();

  const classes =
    normalized === "confirmed"
      ? "bg-green-50 text-green-700 border-green-200"
      : normalized === "completed"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : normalized === "live"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : normalized === "cancelled"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-yellow-50 text-yellow-700 border-yellow-200";

  return (
    <span
      className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${classes}`}
    >
      {normalized || "pending"}
    </span>
  );
}

function SessionGroup({
  title,
  items = [],
  counselorName,
  onAccept,
  onDecline,
  onOpenChat,
  onOpenSummary,
  updateSessionField,
  onSelect,
  onPersistField,
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-[#1c2b2d] mb-3">{title}</div>

      {items.length === 0 ? (
        <div className="text-sm text-[#6b6f6a]">No sessions.</div>
      ) : (
        <div className="space-y-4">
          {items.map((s) => {
            const displayBadge =
              s.phase === "live" && s.computedStatus === "Scheduled"
                ? "live"
                : s.computedStatus === "Scheduled"
                ? "confirmed"
                : s.computedStatus === "Completed"
                ? "completed"
                : s.computedStatus === "Declined"
                ? "cancelled"
                : s.computedStatus;

            const canJoinChat =
              s.type === "Chat" &&
              s.phase === "live" &&
              !["Declined", "Completed"].includes(s.computedStatus);

            return (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-[#e4ddd2] bg-white shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#1c2b2d]">{s.patient}</div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-2 text-xs text-[#6b6f6a]">
                      <span>
                        User:{" "}
                        <span className="font-semibold text-[#1c2b2d]">
                          {s.patient || "—"}
                        </span>
                      </span>
                      <span>
                        Counselor:{" "}
                        <span className="font-semibold text-[#1c2b2d]">
                          {counselorName || "—"}
                        </span>
                      </span>
                      <span>
                        Date:{" "}
                        <span className="font-semibold text-[#1c2b2d]">
                          {s.date || "Not set"}
                        </span>
                      </span>
                      <span>
                        Time:{" "}
                        <span className="font-semibold text-[#1c2b2d]">
                          {s.time || "Not set"}
                        </span>
                      </span>
                      <span>
                        Type:{" "}
                        <span className="font-semibold text-[#1c2b2d]">
                          {s.type || "—"}
                        </span>
                      </span>
                      <span>
                        Phase:{" "}
                        <span className="font-semibold text-[#1c2b2d] capitalize">
                          {s.phase || "—"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Badge status={displayBadge} />

                    {s.computedStatus === "Pending" && (
                      <>
                        <button
                          onClick={() => onAccept(s.id)}
                          className="px-3 py-2 rounded-xl bg-[#0f2d2b] text-white text-xs font-semibold hover:opacity-95"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => onDecline(s.id)}
                          className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-white/70"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {canJoinChat && (
                      <button
                        onClick={() => {
                          onSelect?.(s.id);
                          onOpenChat?.();
                        }}
                        className="px-3 py-2 rounded-xl bg-[#0f2d2b] text-white text-xs font-semibold hover:opacity-95"
                      >
                        Join Chat
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelect?.(s.id);
                        onOpenSummary?.(s.id);
                      }}
                      className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-white/70"
                    >
                      Secure Summary
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Session Notes
                    </div>
                    <textarea
                      value={s.notes || ""}
                      onChange={(e) => updateSessionField(s.id, "notes", e.target.value)}
                      onBlur={(e) => onPersistField?.(s.id, "notes", e.target.value)}
                      className="w-full min-h-[90px] rounded-2xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                      placeholder="Write session notes..."
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Counselor Feedback
                    </div>
                    <textarea
                      value={s.feedback || ""}
                      onChange={(e) => updateSessionField(s.id, "feedback", e.target.value)}
                      onBlur={(e) => onPersistField?.(s.id, "feedback", e.target.value)}
                      className="w-full min-h-[90px] rounded-2xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                      placeholder="Write feedback..."
                    />
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

function pickMotivation() {
  const notes = [
    "Consistency builds trust with clients.",
    "Small support can create big healing.",
    "A calm counselor creates a calm session.",
    "Every session is a chance to help someone feel seen.",
    "Good listening is part of treatment.",
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

function getStatusLabel(status) {
  const s = (status || "").toLowerCase().trim();
  if (s === "scheduled") return "confirmed";
  if (s === "declined" || s === "canceled" || s === "cancelled") return "cancelled";
  if (s === "completed") return "completed";
  return s || "pending";
}