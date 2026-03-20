import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatPanel from "./ChatPanel";
import api from "../../utils/api";

const API_BASE = import.meta.env.VITE_API_BASE;
if (API_BASE) {
  api.defaults.baseURL = API_BASE;
}

export default function CounselorDashboard() {
  const navigate = useNavigate();

  const [counselor, setCounselor] = useState(null);
  const [isLoadingCounselor, setIsLoadingCounselor] = useState(true);
  const [counselorError, setCounselorError] = useState("");

  // Tabs updated to match your requirement sections
  const [activeTab, setActiveTab] = useState("overview");

  // Availability toggle (Online/Offline)
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

  // Resources & Notes
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

  // Profile & Settings form
  const [profile, setProfile] = useState({
    bio: "",
    specialization: "",
    availableHours: "",
    payoutInfo: "",
  });

  // Secure summary modal after session ends
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    sessionId: null,
    summary: "",
  });

  const [sessionNotesForm, setSessionNotesForm] = useState({
    sessionSummary: "",
    clientCondition: "",
    recommendedPractice: "",
    nextSessionSuggestion: "",
  });

  const counselorName = counselor?.name || counselor?.full_name || "";
  const counselorEmail = counselor?.email || "";
  const counselorSpecialization = counselor?.specialization || "";
  const counselorBio = counselor?.bio || "";
  const counselorAvailableHours = counselor?.available_hours || counselor?.availableHours || "";
  const counselorPayoutInfo = counselor?.payoutInfo || "";
  const counselorNameLabel = counselorName || "—";
  const counselorEmailLabel = counselorEmail || "—";
  const counselorSpecializationLabel = counselorSpecialization || "—";

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  // Analytics (computed from live sessions)
  const analytics = useMemo(() => {
    const todayTotal = sessions.filter((s) => s.date === "Today").length;
    const pendingApprovals = sessions.filter((s) => s.status === "Pending").length;

    // Upcoming = anything scheduled/pending today
    const upcomingAppointments = sessions.filter((s) => ["Scheduled", "Pending"].includes(s.status))
      .length;

    const rated = sessions.map((s) => s.rating).filter((v) => typeof v === "number");
    const avgRating = rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : "—";

    // Mood trends from quiz
    const quizSessions = sessions.filter((s) => s.quizShared && s.quiz);
    const avg = (key) => {
      if (!quizSessions.length) return 0;
      const sum = quizSessions.reduce((acc, s) => acc + (s.quiz?.[key] || 0), 0);
      return Math.round((sum / quizSessions.length) * 10); // scale to %
    };

    return {
      todayTotal,
      pendingApprovals,
      upcomingAppointments,
      avgRating,
      weeklySessions: sessions.length,
      monthlySessions: sessions.length,
      moodTrends: [
        { label: "Stress", value: avg("stress") },
        { label: "Anxiety", value: avg("anxiety") },
        { label: "Sleep", value: avg("sleep") },
      ],
    };
  }, [sessions]);

  const dailyMessage = useMemo(() => {
    return isOnline
      ? "✅ You are Online. Keep responses timely and professional."
      : "⚠️ You are Offline. Clients cannot request new sessions right now.";
  }, [isOnline]);

  const completedSessions = useMemo(() => {
    return sessions.filter((s) => {
      const st = (s.status || "").toLowerCase().trim();
      return ["completed", "declined", "cancelled", "canceled"].includes(st);
    });
  }, [sessions]);

  const totalClients = useMemo(() => {
    return new Set(sessions.map((s) => s.patient).filter(Boolean)).size;
  }, [sessions]);

  const todayDateLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

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
        const normalized = raw.map((s) => ({
          id: s.id,
          patient: s.patient?.name || s.patient_name || s.client?.name || s.user?.name || s.patient || "—",
          time: s.time || s.start_time || "",
          date: s.date || s.day_label || "",
          type: s.type || s.mode || "",
          status: s.status || "",
          topic: s.topic || s.reason || "",
          notes: s.notes || "",
          feedback: s.feedback || "",
          rating: typeof s.rating === "number" ? s.rating : null,
          quizShared: Boolean(s.quiz_shared ?? s.quizShared),
          quiz: s.quiz || null,
          summary: s.summary || "",
        }));
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
  }, []);

  useEffect(() => {
    setProfile({
      bio: counselorBio,
      specialization: counselorSpecialization,
      availableHours: counselorAvailableHours,
      payoutInfo: counselorPayoutInfo,
    });
  }, [counselorBio, counselorSpecialization, counselorAvailableHours, counselorPayoutInfo]);

  // ---- Actions ----
  const handleLogout = () => {
    localStorage.removeItem("counselor");
    localStorage.removeItem("auth_token");
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
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Scheduled" } : s)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to accept session.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.post(`/counselor/sessions/${id}/decline`);
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Declined" } : s)));
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

  const saveSessionNotes = async () => {
    const composedNotes = [
      `Session Summary: ${sessionNotesForm.sessionSummary || "-"}`,
      `Client Condition: ${sessionNotesForm.clientCondition || "-"}`,
      `Recommended Practice: ${sessionNotesForm.recommendedPractice || "-"}`,
      `Next Session Suggestion: ${sessionNotesForm.nextSessionSuggestion || "-"}`,
    ].join("\n");

    setPersonalNotes(composedNotes);
    await savePersonalNotes(composedNotes);
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
    setSummaryModal({ open: true, sessionId, summary: "" });
  };

  const saveSecureSummary = async () => {
    if (!summaryModal.sessionId) return;
    try {
      await api.patch(`/counselor/sessions/${summaryModal.sessionId}`, {
        summary: summaryModal.summary,
      });
      setSummaryModal({ open: false, sessionId: null, summary: "" });
      alert("Session summary saved.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save summary.");
    }
  };

  // Calendar-like grouping (Today / Upcoming / Past)
  const groupedSessions = useMemo(() => {
    const today = sessions.filter((s) => s.date === "Today");
    const other = sessions.filter((s) => s.date !== "Today");
    return { today, other };
  }, [sessions]);

  const getDisplayStatus = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "scheduled") return "confirmed";
    if (s === "declined" || s === "canceled") return "cancelled";
    return s || "pending";
  };

  const upcomingSessions = useMemo(() => {
    return sessions.filter((s) => {
      const st = (s.status || "").toLowerCase().trim();
      return !["completed", "cancelled", "canceled", "declined"].includes(st);
    });
  }, [sessions]);

  return (
    <div
      className="min-h-screen bg-[#f4f1eb] text-[#1c2b2d]"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600&display=swap');
      `}</style>
      {/* Topbar */}
      <div className="sticky top-0 z-30 bg-[#f7f3eb]/90 backdrop-blur border-b border-[#e4ddd2]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0f2d2b] text-white flex items-center justify-center font-bold">
              M
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-[#1c2b2d]">MannSathi Counselor</div>
              <div className="text-xs text-[#6b6f6a]">{counselorSpecializationLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("interaction")}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm font-medium"
            >
              Client Interaction
            </button>

            <button
              onClick={handleToggleOnline}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold border",
                isOnline ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700",
              ].join(" ")}
              title="Toggle Online/Offline"
            >
              {isOnline ? "Online" : "Offline"}
            </button>

            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-gray-900">{counselorNameLabel}</div>
              <div className="text-xs text-gray-500">{counselorEmailLabel}</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-[#0f2d2b] text-white hover:opacity-95 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <div className="bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-[#ece5da] p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#f4b860]/20 flex items-center justify-center font-bold text-[#0f2d2b]">
                {counselorNameLabel?.slice(0, 1)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[#1c2b2d] truncate">{counselorNameLabel}</div>
                <div className="text-xs text-[#6b6f6a] truncate">{counselorEmailLabel}</div>
                {isLoadingCounselor && (
                  <div className="text-[11px] text-[#6b6f6a] mt-1">Loading profile...</div>
                )}
                {!isLoadingCounselor && counselorError && (
                  <div className="text-[11px] text-red-600 mt-1">{counselorError}</div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <SideBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                🏠 Dashboard
              </SideBtn>
              <SideBtn active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")}>
                📅 Upcoming Sessions
              </SideBtn>
              <SideBtn active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>
                ✅ Completed Sessions
              </SideBtn>
              <SideBtn active={activeTab === "resources"} onClick={() => setActiveTab("resources")}>
                📝 Session Notes
              </SideBtn>
              <SideBtn active={activeTab === "interaction"} onClick={() => setActiveTab("interaction")}>
                🕒 Availability / Schedule
              </SideBtn>
              <SideBtn active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
                ⚙️ Settings
              </SideBtn>

              <div className="pt-3 border-t mt-3">
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-[#5f6562] hover:bg-white/70"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-[#ece5da] p-4">
            <div className="text-sm font-semibold text-[#1c2b2d]">Daily Note</div>
            <p className="text-xs text-[#6b6f6a] mt-1">{dailyMessage}</p>
            <div className="mt-3 p-3 rounded-xl bg-white/70 border border-[#e4ddd2] text-xs text-[#5f6562]">
              💡 {pickMotivation()}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 space-y-6">
          <section className="bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-[#ece5da] p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-[#1c2b2d]" style={{ fontFamily: "'Fraunces', serif" }}>
                  Counselor Dashboard
                </h1>
                <p className="text-sm text-[#6b6f6a] mt-1">
                  Welcome back, {counselorNameLabel}. Here is your mental wellness practice overview.
                </p>
              </div>
              <div className="text-sm text-[#5f6562] rounded-xl border border-[#e4ddd2] bg-[#f9f7f2] px-4 py-2 shadow-sm">
                {todayDateLabel}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <SaasStatCard
                title="Today's Sessions"
                value={analytics.todayTotal}
                hint="Scheduled for today"
                dotClass="bg-[#215c4c]"
              />
              <SaasStatCard
                title="Upcoming Sessions"
                value={upcomingSessions.length}
                hint="Awaiting session time"
                dotClass="bg-[#4f7e71]"
              />
              <SaasStatCard
                title="Completed Sessions"
                value={completedSessions.length}
                hint="Finished appointments"
                dotClass="bg-[#6f8b64]"
              />
              <SaasStatCard
                title="Total Clients"
                value={totalClients}
                hint="Unique people helped"
                dotClass="bg-[#b38a57]"
              />
            </div>
          </section>

          {/* 1) Overview / Today’s Summary */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 xl:col-span-8 space-y-6">
                <div className="bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-[#ece5da] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-[#1c2b2d]" style={{ fontFamily: "'Fraunces', serif" }}>
                        Upcoming Sessions
                      </div>
                      <div className="text-sm text-[#6b6f6a]">Your next scheduled counseling sessions</div>
                    </div>
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="px-3.5 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-white/70 transition"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {sessionsLoading && <div className="text-sm text-[#6b6f6a]">Loading sessions...</div>}
                    {!sessionsLoading && sessionsError && <div className="text-sm text-red-600">{sessionsError}</div>}
                    {!sessionsLoading && !sessionsError && upcomingSessions.length === 0 && (
                      <div className="text-sm text-[#6b6f6a]">No upcoming sessions.</div>
                    )}

                    {!sessionsLoading && !sessionsError && upcomingSessions.map((s) => (
                      <div key={s.id} className="rounded-xl border border-[#e4ddd2] bg-white p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm flex-1">
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-[#7c7b77] font-semibold">User name</p>
                              <p className="mt-1 font-semibold text-[#1c2b2d] truncate">{s.patient || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-[#7c7b77] font-semibold">Date</p>
                              <p className="mt-1 text-[#1c2b2d] font-medium">{s.date || "Not set"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-[#7c7b77] font-semibold">Time</p>
                              <p className="mt-1 text-[#1c2b2d] font-medium">{s.time || "Not set"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-[#7c7b77] font-semibold">Session type</p>
                              <p className="mt-1 text-[#1c2b2d] font-medium capitalize">{s.type || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-[#7c7b77] font-semibold">Session status</p>
                              <p className="mt-1 text-[#1c2b2d] font-medium capitalize">{getDisplayStatus(s.status)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedSessionId(s.id);
                                setActiveTab("interaction");
                              }}
                              className="px-3 py-2 rounded-xl bg-[#0f2d2b] text-white text-xs font-semibold hover:opacity-95 transition"
                            >
                              View Session
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSessionId(s.id);
                                setSessionNotesForm((prev) => ({ ...prev, sessionSummary: s.summary || "" }));
                              }}
                              className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-[#f8f6f2] transition"
                            >
                              Write Notes
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-[#ece5da] p-5">
                  <div className="text-lg font-semibold text-[#1c2b2d]" style={{ fontFamily: "'Fraunces', serif" }}>
                    Completed Sessions
                  </div>
                  <div className="text-sm text-[#6b6f6a]">Review previous session outcomes and notes</div>

                  <div className="mt-4 space-y-3">
                    {sessionsLoading && <div className="text-sm text-[#6b6f6a]">Loading sessions...</div>}
                    {!sessionsLoading && sessionsError && <div className="text-sm text-red-600">{sessionsError}</div>}
                    {!sessionsLoading && !sessionsError && completedSessions.length === 0 && (
                      <div className="text-sm text-[#6b6f6a]">No sessions scheduled yet.</div>
                    )}

                    {!sessionsLoading && !sessionsError && completedSessions.map((s) => (
                      <div key={`completed-${s.id}`} className="rounded-xl border border-[#e4ddd2] bg-white p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1c2b2d]">{s.patient || "—"}</p>
                            <p className="text-xs text-[#6b6f6a] mt-1">{s.date || "Not set"}</p>
                            <p className="text-xs text-[#5f6562] mt-2 line-clamp-2">
                              {s.summary || s.notes || "No summary available yet."}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedSessionId(s.id);
                              openSummaryModal(s.id);
                            }}
                            className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-[#f8f6f2] transition"
                          >
                            View Notes
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-[#ece5da] p-5">
                  <div className="text-lg font-semibold text-[#1c2b2d]" style={{ fontFamily: "'Fraunces', serif" }}>
                    Session Notes
                  </div>
                  <div className="text-sm text-[#6b6f6a]">Document post-session notes in a structured format</div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <div className="text-xs text-[#5f6562] mb-1.5">Session Summary</div>
                      <textarea
                        value={sessionNotesForm.sessionSummary}
                        onChange={(e) =>
                          setSessionNotesForm((prev) => ({ ...prev, sessionSummary: e.target.value }))
                        }
                        className="w-full min-h-[90px] rounded-xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="Key discussion points and progress"
                      />
                    </label>

                    <label className="block">
                      <div className="text-xs text-[#5f6562] mb-1.5">Client Condition</div>
                      <textarea
                        value={sessionNotesForm.clientCondition}
                        onChange={(e) =>
                          setSessionNotesForm((prev) => ({ ...prev, clientCondition: e.target.value }))
                        }
                        className="w-full min-h-[90px] rounded-xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="Current mental and emotional state"
                      />
                    </label>

                    <label className="block">
                      <div className="text-xs text-[#5f6562] mb-1.5">Recommended Practice</div>
                      <textarea
                        value={sessionNotesForm.recommendedPractice}
                        onChange={(e) =>
                          setSessionNotesForm((prev) => ({ ...prev, recommendedPractice: e.target.value }))
                        }
                        className="w-full min-h-[90px] rounded-xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="Homework, breathing, journaling, etc."
                      />
                    </label>

                    <label className="block">
                      <div className="text-xs text-[#5f6562] mb-1.5">Next Session Suggestion</div>
                      <textarea
                        value={sessionNotesForm.nextSessionSuggestion}
                        onChange={(e) =>
                          setSessionNotesForm((prev) => ({ ...prev, nextSessionSuggestion: e.target.value }))
                        }
                        className="w-full min-h-[90px] rounded-xl border border-[#e4ddd2] bg-[#fffdf9] p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="Suggested agenda for the next session"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={saveSessionNotes}
                      className="px-4 py-2 rounded-xl bg-[#0f2d2b] text-white text-sm font-semibold hover:opacity-95 transition"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-4">
                <div className="bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-[#ece5da] p-5 sticky top-24">
                  <div className="text-lg font-semibold text-[#1c2b2d]" style={{ fontFamily: "'Fraunces', serif" }}>
                    Quick Actions
                  </div>
                  <div className="text-sm text-[#6b6f6a] mt-1">Frequently used counselor actions</div>

                  <div className="mt-4 space-y-2.5">
                    <button
                      onClick={() => setActiveTab("interaction")}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0f2d2b] text-white text-sm font-semibold hover:opacity-95 transition"
                    >
                      Start Session
                    </button>
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e4ddd2] text-sm font-semibold hover:bg-[#f8f6f2] transition"
                    >
                      View Schedule
                    </button>
                    <button
                      onClick={() => setActiveTab("resources")}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e4ddd2] text-sm font-semibold hover:bg-[#f8f6f2] transition"
                    >
                      Write Notes
                    </button>
                    <button
                      onClick={() => setActiveTab("analytics")}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e4ddd2] text-sm font-semibold hover:bg-[#f8f6f2] transition"
                    >
                      View Client History
                    </button>
                  </div>

                  <div className="mt-5 rounded-xl border border-[#e4ddd2] bg-[#f9f7f2] p-3 text-xs text-[#5f6562]">
                    {dailyMessage}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2) Session Management */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="text-lg font-semibold text-gray-900">Session Management</div>
                <div className="text-sm text-gray-500">
                  Calendar-like view + accept/decline + notes & feedback
                </div>

                {/* Calendar style sections */}
                <div className="mt-5 space-y-6">
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
                      title="Other"
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
              </div>
            </div>
          )}

          {/* 3) Client Interaction */}
          {activeTab === "interaction" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="text-lg font-semibold text-gray-900">Client Interaction</div>
                <div className="text-sm text-gray-500">
                  Real-time chat/video + quiz results (if shared) + secure summary
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Chat/video panel */}
                  <div className="lg:col-span-2 bg-[#FAFBFF] border rounded-2xl overflow-hidden">
                    <ChatPanel />
                  </div>

                  {/* Client snapshot */}
                  <div className="bg-white border rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-900">Client Snapshot</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Select a session in “Session Management” to view detailed info.
                    </div>

                    <div className="mt-4 space-y-3">
                      {sessionsLoading && (
                        <div className="text-xs text-[#6b6f6a]">Loading session details...</div>
                      )}
                      {!sessionsLoading && sessionsError && (
                        <div className="text-xs text-red-600">{sessionsError}</div>
                      )}
                      {!sessionsLoading && !sessionsError && !selectedSession && (
                        <div className="text-xs text-[#6b6f6a]">No session selected.</div>
                      )}
                      {!sessionsLoading && !sessionsError && selectedSession && (
                        <div className="p-3 rounded-xl border bg-[#FAFBFF]">
                          <div className="font-semibold text-sm text-gray-900">
                            {selectedSession.patient}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedSession.type} • {selectedSession.topic}
                          </div>

                          <div className="mt-2">
                            {selectedSession.quizShared && selectedSession.quiz ? (
                              <div className="text-xs">
                                <div className="font-semibold text-gray-700 mb-2">Quiz Results</div>
                                <QuizBar label="Stress" value={selectedSession.quiz.stress} />
                                <QuizBar label="Anxiety" value={selectedSession.quiz.anxiety} />
                                <QuizBar label="Sleep" value={selectedSession.quiz.sleep} />
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Quiz results not shared by client.
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => openSummaryModal(selectedSession.id)}
                              className="px-3 py-2 rounded-xl bg-[#0f2d2b] text-white text-xs font-semibold hover:opacity-95"
                            >
                              Secure Summary
                            </button>
                            <button
                              className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-white/70"
                            >
                              Video Room
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4) Analytics & Reports */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="text-lg font-semibold text-gray-900">Analytics & Reports</div>
                <div className="text-sm text-gray-500">
                  Sessions per week/month + satisfaction + mood trends
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Sessions This Week" value={analytics.weeklySessions} />
                  <StatCard label="Sessions This Month" value={analytics.monthlySessions} />
                  <StatCard label="Avg Satisfaction" value={analytics.avgRating} />
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-2xl p-4 bg-[#FAFBFF]">
                    <div className="text-sm font-semibold text-gray-900">Mood Trends</div>
                    <div className="text-xs text-gray-500 mb-3">
                      Based on shared client quizzes
                    </div>
                    <div className="space-y-3">
                      {analytics.moodTrends.map((t) => (
                        <TrendBar key={t.label} label={t.label} value={t.value} />
                      ))}
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4 bg-[#FAFBFF]">
                    <div className="text-sm font-semibold text-gray-900">Quick Notes</div>
                    <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Track improvements across sessions (ratings + notes).</li>
                      <li>Use mood trends to customize exercises & therapy materials.</li>
                      <li>Export reports later for hospital admin dashboards.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5) Resource & Note Management */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="text-lg font-semibold text-gray-900">Resources & Notes</div>
                <div className="text-sm text-gray-500">
                  Personal notes + upload materials + shared educational content
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Personal Notes */}
                  <div className="border rounded-2xl p-4 bg-[#FAFBFF]">
                    <div className="text-sm font-semibold text-gray-900">Personal Notes</div>
                    <div className="text-xs text-gray-500 mb-2">
                      Private notes
                    </div>
                    {notesLoading && (
                      <div className="text-xs text-[#6b6f6a] mb-2">Loading notes...</div>
                    )}
                    {!notesLoading && notesError && (
                      <div className="text-xs text-red-600 mb-2">{notesError}</div>
                    )}
                    <textarea
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      className="w-full min-h-[140px] rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                      placeholder="Write reminders, therapy plans, follow-up ideas..."
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={savePersonalNotes}
                        className="px-4 py-2 rounded-xl bg-[#0f2d2b] text-white text-sm font-semibold hover:opacity-95"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>

                  {/* Upload Materials */}
                  <div className="border rounded-2xl p-4 bg-[#FAFBFF]">
                    <div className="text-sm font-semibold text-gray-900">Therapy Materials</div>
                    <div className="text-xs text-gray-500 mb-2">
                      Upload worksheets, exercises, PDFs
                    </div>
                    {materialsLoading && (
                      <div className="text-xs text-[#6b6f6a] mb-2">Loading materials...</div>
                    )}
                    {!materialsLoading && materialsError && (
                      <div className="text-xs text-red-600 mb-2">{materialsError}</div>
                    )}

                    <label className="block">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadMaterial(e.target.files?.[0])}
                      />
                      <div className="cursor-pointer px-4 py-3 rounded-xl border bg-white text-sm font-semibold hover:bg-gray-50 text-center">
                        + Upload File
                      </div>
                    </label>

                    <div className="mt-3 space-y-2">
                      {!materialsLoading && !materialsError && materials.length === 0 && (
                        <div className="text-xs text-[#6b6f6a]">No materials uploaded yet.</div>
                      )}
                      {materials.map((m, idx) => (
                        <div
                          key={m.id || m.uuid || m._id || m.name || idx}
                          className="flex items-center justify-between p-3 rounded-xl border bg-white"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {m.title || m.name || "Untitled"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {m.type || m.file_type || "FILE"} • {m.uploadedAt || m.created_at || ""}
                            </div>
                          </div>
                          <button className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50">
                            Share
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shared Content */}
                <div className="mt-4 border rounded-2xl p-4 bg-[#FAFBFF]">
                  <div className="text-sm font-semibold text-gray-900">Shared Educational Content</div>
                  <div className="text-xs text-gray-500 mb-3">
                    Content available inside MannSathi for all counselors 
                  </div>
                  {sharedContentLoading && (
                    <div className="text-xs text-[#6b6f6a] mb-3">Loading content...</div>
                  )}
                  {!sharedContentLoading && sharedContentError && (
                    <div className="text-xs text-red-600 mb-3">{sharedContentError}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {!sharedContentLoading && !sharedContentError && sharedContent.length === 0 && (
                      <div className="text-xs text-[#6b6f6a]">No shared content available.</div>
                    )}
                    {sharedContent.map((c, idx) => (
                      <div key={c.id || c.uuid || c._id || c.title || idx} className="p-3 rounded-xl border bg-white">
                        <div className="text-sm font-semibold text-gray-900">{c.title || c.name}</div>
                        <div className="text-xs text-gray-500">{c.tag || c.category}</div>
                        <button className="mt-3 w-full px-3 py-2 rounded-xl bg-[#0f2d2b] text-white text-xs font-semibold hover:opacity-95">
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6) Profile & Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="text-lg font-semibold text-gray-900">Profile & Settings</div>
                <div className="text-sm text-gray-500">
                  Update bio/specialization/hours + availability + payment info
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-2xl p-4 bg-[#FAFBFF]">
                    <div className="text-sm font-semibold text-gray-900">Professional Info</div>

                    <label className="block mt-3">
                      <div className="text-xs text-gray-600 mb-1">Specialization</div>
                      <input
                        value={profile.specialization}
                        onChange={(e) => setProfile((p) => ({ ...p, specialization: e.target.value }))}
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="e.g., Clinical Psychologist, Anxiety Specialist"
                      />
                    </label>

                    <label className="block mt-3">
                      <div className="text-xs text-gray-600 mb-1">Available Hours</div>
                      <input
                        value={profile.availableHours}
                        onChange={(e) => setProfile((p) => ({ ...p, availableHours: e.target.value }))}
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="e.g., 10:00 AM - 5:00 PM"
                      />
                    </label>

                    <label className="block mt-3">
                      <div className="text-xs text-gray-600 mb-1">Bio</div>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                        className="w-full min-h-[120px] rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="Write your professional bio..."
                      />
                    </label>
                  </div>

                  <div className="border rounded-2xl p-4 bg-[#FAFBFF]">
                    <div className="text-sm font-semibold text-gray-900">Payments & Payouts</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Commission, payouts (connect to backend later)
                    </div>

                    <label className="block mt-3">
                      <div className="text-xs text-gray-600 mb-1">Payout Info</div>
                      <input
                        value={profile.payoutInfo}
                        onChange={(e) => setProfile((p) => ({ ...p, payoutInfo: e.target.value }))}
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                        placeholder="eSewa/Khalti/Bank details"
                      />
                    </label>

                    <div className="mt-4 p-3 rounded-xl border bg-white text-sm text-gray-700">
                      <div className="font-semibold">Availability</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Toggle Online/Offline from top bar. Current:{" "}
                        <span className="font-semibold">{isOnline ? "Online" : "Offline"}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={saveProfile}
                        className="px-4 py-2 rounded-xl bg-[#0f2d2b] text-white text-sm font-semibold hover:opacity-95"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Secure Summary Modal */}
      {summaryModal.open && (
        <Modal onClose={() => setSummaryModal({ open: false, sessionId: null, summary: "" })}>
          <div className="text-lg font-semibold text-gray-900">Secure Session Summary</div>
          <div className="text-sm text-gray-500 mt-1">
            Session ID: <span className="font-semibold">{summaryModal.sessionId}</span>
          </div>

          <div className="mt-4">
            <textarea
              value={summaryModal.summary}
              onChange={(e) => setSummaryModal((p) => ({ ...p, summary: e.target.value }))}
              className="w-full min-h-[160px] rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
              placeholder="Write a short professional summary (confidential)."
            />
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => setSummaryModal({ open: false, sessionId: null, summary: "" })}
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveSecureSummary}
              className="px-4 py-2 rounded-xl bg-[#0f2d2b] text-white text-sm font-semibold hover:opacity-95"
            >
              Save Summary
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* -------------------- Components / Helpers -------------------- */

function SideBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition",
        active ? "bg-[#0f2d2b] text-white" : "text-[#5f6562] hover:bg-white/70",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white/60 p-4">
      <div className="text-xs text-[#7c7b77]">{label}</div>
      <div className="text-2xl font-bold text-[#1c2b2d] mt-1" style={{ fontFamily: "'Fraunces', serif" }}>
        {value}
      </div>
    </div>
  );
}

function SaasStatCard({ title, value, hint, dotClass }) {
  return (
    <div className="rounded-xl border border-[#e4ddd2] bg-[#fffdf9] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-[#7c7b77] uppercase tracking-wide">{title}</div>
          <div className="text-2xl font-bold text-[#1c2b2d] mt-1" style={{ fontFamily: "'Fraunces', serif" }}>
            {value}
          </div>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full mt-1 ${dotClass}`} />
      </div>
      <div className="text-[11px] text-[#6b6f6a] mt-2">{hint}</div>
    </div>
  );
}

function Badge({ status }) {
  const normalized = (status || "").toLowerCase().trim();
  const cls =
    normalized === "scheduled" || normalized === "confirmed"
      ? "bg-green-100 text-green-700"
      : normalized === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : normalized === "declined" || normalized === "cancelled" || normalized === "canceled"
      ? "bg-red-100 text-red-700"
      : normalized === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-gray-100 text-gray-700";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>{status}</span>;
}

function SessionGroup({
  title,
  items,
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
      <div className="text-sm font-semibold text-[#1c2b2d]">{title}</div>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-[#6b6f6a]">No sessions.</div>
        ) : (
          items.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-[#e4ddd2] bg-white shadow-sm"
              onClick={() => onSelect?.(s.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-[#1c2b2d]">{s.patient}</div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-[#6b6f6a]">
                    <span>User: <span className="font-semibold text-[#1c2b2d]">{s.patient || "—"}</span></span>
                    <span>Counselor: <span className="font-semibold text-[#1c2b2d]">{counselorName || "—"}</span></span>
                    <span>Date: <span className="font-semibold text-[#1c2b2d]">{s.date || "Not set"}</span></span>
                    <span>Time: <span className="font-semibold text-[#1c2b2d]">{s.time || "Not set"}</span></span>
                    <span>Type: <span className="font-semibold text-[#1c2b2d]">{s.type || "—"}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge status={s.status === "Scheduled" ? "confirmed" : s.status === "Declined" ? "cancelled" : s.status} />

                  {s.status === "Pending" && (
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

                  {s.status !== "Declined" && s.type === "Chat" && (
                    <button
                      onClick={() => {
                        onSelect?.(s.id);
                        onOpenChat();
                      }}
                      className="px-3 py-2 rounded-xl bg-[#0f2d2b] text-white text-xs font-semibold hover:opacity-95"
                    >
                      Join Chat
                    </button>
                  )}

                
                  <button
                    onClick={() => {
                      onSelect?.(s.id);
                      onOpenSummary(s.id);
                    }}
                    className="px-3 py-2 rounded-xl border border-[#e4ddd2] text-xs font-semibold hover:bg-white/70"
                  >
                    Secure Summary
                  </button>
                </div>
              </div>

              {/* Notes + Feedback */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Session Notes</div>
                  <textarea
                    value={s.notes || ""}
                    onChange={(e) => updateSessionField(s.id, "notes", e.target.value)}
                    onBlur={(e) => onPersistField?.(s.id, "notes", e.target.value)}
                    className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                    placeholder="Write session notes..."
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Feedback</div>
                  <textarea
                    value={s.feedback || ""}
                    onChange={(e) => updateSessionField(s.id, "feedback", e.target.value)}
                    onBlur={(e) => onPersistField?.(s.id, "feedback", e.target.value)}
                    className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#0f2d2b]/20"
                    placeholder="Write feedback / next steps..."
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuizBar({ label, value }) {
  const pct = Math.max(0, Math.min(10, value)) * 10;
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-[11px] text-gray-600">
        <span>{label}</span>
        <span className="font-semibold">{value}/10</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-[#0f2d2b]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TrendBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-[#0f2d2b]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-lg border border-[#e4ddd2] p-5">
        {children}
      </div>
    </div>
  );
}

function pickMotivation() {
  return "No announcements yet.";
}
