import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatPanel from "../../components/chat/ChatPanel";

export default function CounselorDashboard() {
  const navigate = useNavigate();

  // Counselor (from localStorage)
  const counselor = useMemo(() => {
    try {
      const c = JSON.parse(localStorage.getItem("counselor"));
      return {
        name: c?.name || c?.full_name || "Counselor",
        email: c?.email || "counselor@email.com",
        specialization: c?.specialization || "Mental Health Counselor",
      };
    } catch {
      return {
        name: "Counselor",
        email: "counselor@email.com",
        specialization: "Mental Health Counselor",
      };
    }
  }, []);

  const [activeTab, setActiveTab] = useState("overview"); // overview | sessions | availability | chat | profile

  // Mock data (replace with backend later)
  const [todaySessions] = useState([
    {
      id: 1,
      patient: "Roisha Maharjan",
      time: "10:30 AM",
      type: "Chat",
      status: "Scheduled",
      topic: "Anxiety & stress",
    },
    {
      id: 2,
      patient: "Sujan Shrestha",
      time: "12:00 PM",
      type: "Video",
      status: "Pending",
      topic: "Relationship",
    },
    {
      id: 3,
      patient: "Anu Lama",
      time: "04:00 PM",
      type: "Chat",
      status: "Scheduled",
      topic: "Sleep issues",
    },
  ]);

  const stats = useMemo(() => {
    const scheduled = todaySessions.filter((s) => s.status === "Scheduled").length;
    const pending = todaySessions.filter((s) => s.status === "Pending").length;
    return {
      todayTotal: todaySessions.length,
      scheduled,
      pending,
      rating: 4.8,
      earningsThisMonth: "NPR 24,500",
    };
  }, [todaySessions]);

  const handleLogout = () => {
    localStorage.removeItem("counselor");
    localStorage.removeItem("token");
    navigate("/counselor/login");
  };

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
              onClick={() => setActiveTab("chat")}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm font-medium"
            >
              Open Chat
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
                Overview
              </SideBtn>
              <SideBtn active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")}>
                Sessions
              </SideBtn>
              <SideBtn
                active={activeTab === "availability"}
                onClick={() => setActiveTab("availability")}
              >
                Availability
              </SideBtn>
              <SideBtn active={activeTab === "chat"} onClick={() => setActiveTab("chat")}>
                Chat (Patients)
              </SideBtn>
              <SideBtn active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>
                Profile
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

          {/* Quick note */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm border p-4">
            <div className="text-sm font-semibold text-gray-900">Today</div>
            <p className="text-xs text-gray-500 mt-1">
              You have <span className="font-semibold">{stats.todayTotal}</span> sessions today.
              Keep your availability updated.
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Sessions Today" value={stats.todayTotal} />
                <StatCard label="Scheduled" value={stats.scheduled} />
                <StatCard label="Pending" value={stats.pending} />
                <StatCard label="Rating" value={stats.rating} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">Upcoming Sessions</div>
                      <div className="text-sm text-gray-500">Your schedule for today</div>
                    </div>
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {todaySessions.map((s) => (
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
                        <div className="flex items-center gap-2">
                          <Badge status={s.status} />
                          {s.type === "Chat" && (
                            <button
                              onClick={() => setActiveTab("chat")}
                              className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95"
                            >
                              Open Chat
                            </button>
                          )}
                          {s.type === "Video" && (
                            <button
                              className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
                              title="Later you can connect this to Jitsi"
                            >
                              Join Video
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earnings */}
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="text-lg font-semibold text-gray-900">Earnings</div>
                  <div className="text-sm text-gray-500 mt-1">This month</div>
                  <div className="mt-4 p-4 rounded-2xl bg-[#F7E7A6]">
                    <div className="text-xs text-gray-700">Total</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.earningsThisMonth}</div>
                    <div className="text-xs text-gray-700 mt-1">
                      Tip: add payment tracking after backend.
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold">18</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cancelled</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Refunds</span>
                      <span className="font-semibold">0</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("profile")}
                    className="mt-4 w-full px-4 py-3 rounded-2xl bg-white border font-semibold hover:bg-gray-50"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">All Sessions</div>
                  <div className="text-sm text-gray-500">Manage your appointments</div>
                </div>
                <button
                  onClick={() => setActiveTab("availability")}
                  className="px-4 py-2 rounded-xl bg-[#215C4C] text-white text-sm font-semibold hover:opacity-95"
                >
                  Set Availability
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-3">Patient</th>
                      <th className="py-3">Time</th>
                      <th className="py-3">Type</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySessions.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="py-3 font-medium text-gray-900">{s.patient}</td>
                        <td className="py-3 text-gray-700">{s.time}</td>
                        <td className="py-3 text-gray-700">{s.type}</td>
                        <td className="py-3">
                          <Badge status={s.status} />
                        </td>
                        <td className="py-3">
                          {s.type === "Chat" ? (
                            <button
                              onClick={() => setActiveTab("chat")}
                              className="px-3 py-2 rounded-xl bg-[#215C4C] text-white text-xs font-semibold hover:opacity-95"
                            >
                              Chat
                            </button>
                          ) : (
                            <button className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50">
                              Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "availability" && (
            <AvailabilityUI onDone={() => setActiveTab("overview")} />
          )}

          {activeTab === "chat" && (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <ChatPanel />
            </div>
          )}

          {activeTab === "profile" && <ProfileUI counselor={counselor} />}
        </main>
      </div>
    </div>
  );
}

/* -------------------- Small UI helpers -------------------- */

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
      : "bg-gray-100 text-gray-700";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
}

function AvailabilityUI({ onDone }) {
  const [days, setDays] = useState({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: false,
    Sun: false,
  });
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("17:00");

  const toggle = (d) => setDays((p) => ({ ...p, [d]: !p[d] }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <div className="text-lg font-semibold text-gray-900">Availability</div>
      <div className="text-sm text-gray-500 mt-1">Set when patients can book you</div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-gray-900">Working days</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(days).map((d) => (
              <button
                key={d}
                onClick={() => toggle(d)}
                className={[
                  "px-4 py-2 rounded-xl border text-sm font-semibold",
                  days[d] ? "bg-[#215C4C] text-white border-[#215C4C]" : "bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-900">Time</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">From</div>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
                type="time"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">To</div>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
                type="time"
              />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-[#FAFBFF] border">
            <div className="text-xs text-gray-500">Preview</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {Object.entries(days)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(", ") || "No days selected"}{" "}
              • {from} - {to}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          className="px-5 py-3 rounded-2xl bg-[#215C4C] text-white font-semibold hover:opacity-95"
          onClick={onDone}
        >
          Save
        </button>
        <button className="px-5 py-3 rounded-2xl border font-semibold hover:bg-gray-50" onClick={onDone}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ProfileUI({ counselor }) {
  const [form, setForm] = useState({
    name: counselor.name,
    email: counselor.email,
    specialization: counselor.specialization,
    bio: "I help with anxiety, stress, relationship issues, and life transitions.",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <div className="text-lg font-semibold text-gray-900">Profile</div>
      <div className="text-sm text-gray-500 mt-1">Update your details (UI only for now)</div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full px-3 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            className="w-full px-3 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
          />
        </Field>
        <Field label="Specialization">
          <input
            name="specialization"
            value={form.specialization}
            onChange={onChange}
            className="w-full px-3 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
          />
        </Field>
        <Field label="Bio">
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={4}
            className="w-full px-3 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-[#215C4C]"
          />
        </Field>
      </div>

      <button className="mt-5 px-5 py-3 rounded-2xl bg-[#215C4C] text-white font-semibold hover:opacity-95">
        Save Changes
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {children}
    </div>
  );
}
