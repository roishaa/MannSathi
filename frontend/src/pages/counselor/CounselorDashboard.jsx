import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatPanel from "./ChatPanel";

export default function CounselorDashboard() {
  const navigate = useNavigate();

  const counselor = useMemo(() => {
    try {
      const c = JSON.parse(localStorage.getItem("counselor"));
      return {
        name: c?.name || c?.full_name || "Counselor",
        email: c?.email || "counselor@email.com",
        specialization: c?.specialization || "Mental Health Counselor",
        bio: c?.bio || "",
        availableHours: c?.availableHours || "10:00 AM - 5:00 PM",
        payoutInfo: c?.payoutInfo || "",
      };
    } catch {
      return {
        name: "Counselor",
        email: "counselor@email.com",
        specialization: "Mental Health Counselor",
        bio: "",
        availableHours: "10:00 AM - 5:00 PM",
        payoutInfo: "",
      };
    }
  }, []);

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

  // Sessions (dummy data -> later replace with API)
  const [sessions, setSessions] = useState([
    {
      id: 1,
      patient: "Roisha Maharjan",
      time: "10:30 AM",
      date: "Today",
      type: "Chat",
      status: "Scheduled",
      topic: "Anxiety & stress",
      notes: "",
      feedback: "",
      rating: null,
      quizShared: true,
      quiz: { stress: 7, anxiety: 6, sleep: 4 },
    },
    {
      id: 2,
      patient: "Sujan Shrestha",
      time: "12:00 PM",
      date: "Today",
      type: "Video",
      status: "Pending",
      topic: "Relationship",
      notes: "",
      feedback: "",
      rating: null,
      quizShared: false,
      quiz: null,
    },
    {
      id: 3,
      patient: "Anu Lama",
      time: "04:00 PM",
      date: "Today",
      type: "Chat",
      status: "Scheduled",
      topic: "Sleep issues",
      notes: "",
      feedback: "",
      rating: 5,
      quizShared: true,
      quiz: { stress: 5, anxiety: 3, sleep: 8 },
    },
  ]);

  // Resources & Notes
  const [personalNotes, setPersonalNotes] = useState(() => {
    try {
      return localStorage.getItem("counselor_personal_notes") || "";
    } catch {
      return "";
    }
  });

  const [materials, setMaterials] = useState([
    { id: "m1", title: "Breathing Exercise (PDF)", type: "PDF", uploadedAt: "Jan 10" },
    { id: "m2", title: "Sleep Hygiene Checklist", type: "DOC", uploadedAt: "Jan 14" },
  ]);

  const sharedContent = useMemo(
    () => [
      { id: "s1", title: "What is Anxiety?", tag: "Education" },
      { id: "s2", title: "Grounding Techniques", tag: "Exercise" },
      { id: "s3", title: "Stress Management Tips", tag: "Education" },
    ],
    []
  );

  // Profile & Settings form
  const [profile, setProfile] = useState({
    bio: counselor.bio,
    specialization: counselor.specialization,
    availableHours: counselor.availableHours,
    payoutInfo: counselor.payoutInfo,
  });

  // Secure summary modal after session ends
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    sessionId: null,
    summary: "",
  });

  // Analytics (simple local computed demo)
  const analytics = useMemo(() => {
    const todayTotal = sessions.filter((s) => s.date === "Today").length;
    const pendingApprovals = sessions.filter((s) => s.status === "Pending").length;

    // Upcoming = anything scheduled/pending today (demo)
    const upcomingAppointments = sessions.filter((s) => ["Scheduled", "Pending"].includes(s.status))
      .length;

    const rated = sessions.map((s) => s.rating).filter((v) => typeof v === "number");
    const avgRating = rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : "—";

    // Mood trends from quiz (demo)
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
      weeklySessions: 12,
      monthlySessions: 46,
      moodTrends: [
        { label: "Stress", value: avg("stress") },
        { label: "Anxiety", value: avg("anxiety") },
        { label: "Sleep", value: avg("sleep") },
      ],
    };
  }, [sessions]);

  const dailyMessage = useMemo(() => {
    // You can swap this for system alerts from backend
    return isOnline
      ? "✅ You are Online. Keep responses timely and professional."
      : "⚠️ You are Offline. Clients cannot request new sessions right now.";
  }, [isOnline]);

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

  const handleAccept = (id) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Scheduled" } : s)));
  };

  const handleDecline = (id) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Declined" } : s)));
  };

  const updateSessionField = (id, field, value) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const savePersonalNotes = () => {
    localStorage.setItem("counselor_personal_notes", personalNotes);
  };

  const handleUploadMaterial = (file) => {
    if (!file) return;
    setMaterials((prev) => [
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        title: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        uploadedAt: "Today",
      },
      ...prev,
    ]);
  };

  const saveProfile = () => {
    // UI only: store locally now; later call API
    const updated = {
      ...counselor,
      specialization: profile.specialization,
      bio: profile.bio,
      availableHours: profile.availableHours,
      payoutInfo: profile.payoutInfo,
    };
    localStorage.setItem("counselor", JSON.stringify(updated));
    alert("Profile saved (local only).");
  };

  const openSummaryModal = (sessionId) => {
    setSummaryModal({ open: true, sessionId, summary: "" });
  };

  const saveSecureSummary = () => {
    // UI-only: you’ll later send this to backend with proper encryption/access control
    setSummaryModal({ open: false, sessionId: null, summary: "" });
    alert("Session summary saved (demo).");
  };

  // Calendar-like grouping (Today / Upcoming / Past) - simple demo logic
  const groupedSessions = useMemo(() => {
    const today = sessions.filter((s) => s.date === "Today");
    const other = sessions.filter((s) => s.date !== "Today");
    return { today, other };
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* Topbar */}
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#215C4C] text-white flex items-center justify-center font-bold">
              M
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-gray-900">MannSathi — Counselor</div>
              <div className="text-xs text-gray-500">{counselor.specialization}</div>
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
              <div className="text-sm font-semibold text-gray-900">{counselor.name}</div>
              <div className="text-xs text-gray-500">{counselor.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-[#215C4C] text-white hover:opacity-95 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#F7D8DD] flex items-center justify-center font-bold text-[#215C4C]">
                {counselor.name?.slice(0, 1)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{counselor.name}</div>
                <div className="text-xs text-gray-500 truncate">{counselor.email}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <SideBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                Overview / Today
              </SideBtn>
              <SideBtn active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")}>
                Session Management
              </SideBtn>
              <SideBtn
                active={activeTab === "interaction"}
                onClick={() => setActiveTab("interaction")}
              >
                Client Interaction
              </SideBtn>
              <SideBtn
                active={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
              >
                Analytics & Reports
              </SideBtn>
              <SideBtn
                active={activeTab === "resources"}
                onClick={() => setActiveTab("resources")}
              >
                Resources & Notes
              </SideBtn>
              <SideBtn active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
                Profile & Settings
              </SideBtn>

              <div className="pt-3 border-t mt-3">
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-sm border p-4">
            <div className="text-sm font-semibold text-gray-900">Daily Note</div>
            <p className="text-xs text-gray-600 mt-1">{dailyMessage}</p>
            <div className="mt-3 p-3 rounded-xl bg-[#FAFBFF] border text-xs text-gray-600">
              💡 {pickMotivation()}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          {/* 1) Overview / Today’s Summary */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Sessions Today" value={analytics.todayTotal} />
                <StatCard label="Pending Approvals" value={analytics.pendingApprovals} />
                <StatCard label="Upcoming Appointments" value={analytics.upcomingAppointments} />
                <StatCard label="Avg Rating" value={analytics.avgRating} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Today’s Sessions</div>
                    <div className="text-sm text-gray-500">Quick view of today’s schedule</div>
                  </div>
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50"
                  >
                    Manage Sessions
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {groupedSessions.today.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl border bg-[#FAFBFF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{s.patient}</div>
                        <div className="text-xs text-gray-500">
                          {s.time} • {s.type} • {s.topic}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Badge status={s.status} />
                        {s.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleAccept(s.id)}
                              className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(s.id)}
                              className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {s.type === "Chat" && s.status !== "Declined" && (
                          <button
                            onClick={() => setActiveTab("interaction")}
                            className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95"
                          >
                            Join Chat
                          </button>
                        )}

                        {s.type === "Video" && s.status !== "Declined" && (
                          <button
                            className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
                            title="Later connect this to Jitsi"
                          >
                            Join Video
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
                  <SessionGroup
                    title="Today"
                    items={groupedSessions.today}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onOpenChat={() => setActiveTab("interaction")}
                    onOpenSummary={openSummaryModal}
                    updateSessionField={updateSessionField}
                  />

                  {groupedSessions.other.length > 0 && (
                    <SessionGroup
                      title="Other"
                      items={groupedSessions.other}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      onOpenChat={() => setActiveTab("interaction")}
                      onOpenSummary={openSummaryModal}
                      updateSessionField={updateSessionField}
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
                      Select a session in “Session Management” to view detailed info (demo).
                    </div>

                    <div className="mt-4 space-y-3">
                      {sessions.slice(0, 3).map((s) => (
                        <div key={s.id} className="p-3 rounded-xl border bg-[#FAFBFF]">
                          <div className="font-semibold text-sm text-gray-900">{s.patient}</div>
                          <div className="text-xs text-gray-500">
                            {s.type} • {s.topic}
                          </div>

                          <div className="mt-2">
                            {s.quizShared && s.quiz ? (
                              <div className="text-xs">
                                <div className="font-semibold text-gray-700 mb-2">Quiz Results</div>
                                <QuizBar label="Stress" value={s.quiz.stress} />
                                <QuizBar label="Anxiety" value={s.quiz.anxiety} />
                                <QuizBar label="Sleep" value={s.quiz.sleep} />
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Quiz results not shared by client.
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => openSummaryModal(s.id)}
                              className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95"
                            >
                              Secure Summary
                            </button>
                            <button
                              className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
                              title="Later connect to video room (Jitsi)"
                            >
                              Video Room
                            </button>
                          </div>
                        </div>
                      ))}
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
                      Based on shared client quizzes (demo)
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
                      Private notes (saved in localStorage for now)
                    </div>
                    <textarea
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      className="w-full min-h-[140px] rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
                      placeholder="Write reminders, therapy plans, follow-up ideas..."
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={savePersonalNotes}
                        className="px-4 py-2 rounded-xl bg-[#215C4C] text-white text-sm font-semibold hover:opacity-95"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>

                  {/* Upload Materials */}
                  <div className="border rounded-2xl p-4 bg-[#FAFBFF]">
                    <div className="text-sm font-semibold text-gray-900">Therapy Materials</div>
                    <div className="text-xs text-gray-500 mb-2">
                      Upload worksheets, exercises, PDFs (UI only)
                    </div>

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
                      {materials.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3 rounded-xl border bg-white"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {m.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {m.type} • {m.uploadedAt}
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
                    Content available inside MannSathi for all counselors (demo)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {sharedContent.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border bg-white">
                        <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-500">{c.tag}</div>
                        <button className="mt-3 w-full px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95">
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
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
                        placeholder="e.g., Clinical Psychologist, Anxiety Specialist"
                      />
                    </label>

                    <label className="block mt-3">
                      <div className="text-xs text-gray-600 mb-1">Available Hours</div>
                      <input
                        value={profile.availableHours}
                        onChange={(e) => setProfile((p) => ({ ...p, availableHours: e.target.value }))}
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
                        placeholder="e.g., 10:00 AM - 5:00 PM"
                      />
                    </label>

                    <label className="block mt-3">
                      <div className="text-xs text-gray-600 mb-1">Bio</div>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                        className="w-full min-h-[120px] rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
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
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
                        placeholder="eSewa/Khalti/Bank details (demo)"
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
                        className="px-4 py-2 rounded-xl bg-[#215C4C] text-white text-sm font-semibold hover:opacity-95"
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
              className="w-full min-h-[160px] rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
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
              className="px-4 py-2 rounded-xl bg-[#215C4C] text-white text-sm font-semibold hover:opacity-95"
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
        active ? "bg-[#215C4C] text-white" : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function Badge({ status }) {
  const cls =
    status === "Scheduled"
      ? "bg-green-100 text-green-700"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : status === "Declined"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
}

function SessionGroup({ title, items, onAccept, onDecline, onOpenChat, onOpenSummary, updateSessionField }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">No sessions.</div>
        ) : (
          items.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl border bg-[#FAFBFF]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{s.patient}</div>
                  <div className="text-xs text-gray-500">
                    {s.time} • {s.type} • {s.topic}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge status={s.status} />

                  {s.status === "Pending" && (
                    <>
                      <button
                        onClick={() => onAccept(s.id)}
                        className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onDecline(s.id)}
                        className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {s.status !== "Declined" && s.type === "Chat" && (
                    <button
                      onClick={onOpenChat}
                      className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95"
                    >
                      Join Chat
                    </button>
                  )}

                  {s.status !== "Declined" && s.type === "Video" && (
                    <button
                      className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
                      title="Later connect to Jitsi"
                    >
                      Join Video
                    </button>
                  )}

                  <button
                    onClick={() => onOpenSummary(s.id)}
                    className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
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
                    className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
                    placeholder="Write session notes..."
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Feedback</div>
                  <textarea
                    value={s.feedback || ""}
                    onChange={(e) => updateSessionField(s.id, "feedback", e.target.value)}
                    className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#215C4C]/20"
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
        <div className="h-full bg-[#215C4C]" style={{ width: `${pct}%` }} />
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
        <div className="h-full bg-[#215C4C]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-lg border p-5">
        {children}
      </div>
    </div>
  );
}

function pickMotivation() {
  const list = [
    "Be present. A calm counselor creates a calm client.",
    "Progress is not linear — keep showing up.",
    "Small support today can change someone’s life tomorrow.",
    "Listen more than you speak. People heal when they feel heard.",
  ];
  return list[Math.floor(Math.random() * list.length)];
}
