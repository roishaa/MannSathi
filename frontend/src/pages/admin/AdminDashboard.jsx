import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
      ADMIN (from localStorage)
  ========================= */
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin")) || null;
    } catch {
      return null;
    }
  }, []);

  const adminName = admin?.name || admin?.full_name || "Admin";
  const adminEmail = admin?.email || "admin@mannsathi.com";

  /* =========================
      LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  /* =========================
      NAVIGATION
  ========================= */
  const navItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: "📊" },
    { label: "Users", to: "/admin/users", icon: "👤" },
    { label: "Counselors", to: "/admin/counselors", icon: "🧑‍⚕️" },
    { label: "Sessions", to: "/admin/sessions", icon: "📅" },
    { label: "Payments", to: "/admin/payments", icon: "💳" },
    { label: "Complaints", to: "/admin/complaints", icon: "🛡️" },
    { label: "Settings", to: "/admin/settings", icon: "⚙️" },
  ];

  const isActive = (to) => location.pathname === to;

  /* =========================
      DUMMY DATA (UI-ready)
      Later replace with API data
  ========================= */
  const [stats] = useState({
    totalUsers: 128,
    totalCounselors: 24,
    totalSessions: 310,
    pendingCounselors: 6,
    totalRevenue: 92500, // Rs
  });

  const [pendingCounselors, setPendingCounselors] = useState([
    {
      id: 1,
      name: "Dr. Anjana Shrestha",
      email: "anjana@example.com",
      specialization: "Anxiety",
      license_no: "LIC-23452",
      experience_years: 5,
    },
    {
      id: 2,
      name: "Mr. Kiran Gurung",
      email: "kiran@example.com",
      specialization: "Stress",
      license_no: "LIC-11490",
      experience_years: 3,
    },
    {
      id: 3,
      name: "Ms. Sita Lama",
      email: "sita@example.com",
      specialization: "Teen Counseling",
      license_no: "LIC-99812",
      experience_years: 4,
    },
  ]);

  const [recentUsers] = useState([
    { id: 1, name: "Roisha Maharjan", email: "roisha@gmail.com", status: "active" },
    { id: 2, name: "Aayush Shrestha", email: "aayush@gmail.com", status: "active" },
    { id: 3, name: "Nisha Lama", email: "nisha@gmail.com", status: "disabled" },
  ]);

  const [recentSessions] = useState([
    {
      id: 101,
      user: "Roisha Maharjan",
      counselor: "Dr. Anjana Shrestha",
      date: "2026-01-06 10:00",
      type: "online",
      status: "scheduled",
    },
    {
      id: 102,
      user: "Aayush Shrestha",
      counselor: "Mr. Kiran Gurung",
      date: "2026-01-05 14:00",
      type: "in_person",
      status: "completed",
    },
    {
      id: 103,
      user: "Nisha Lama",
      counselor: "Ms. Sita Lama",
      date: "2026-01-04 17:00",
      type: "video",
      status: "pending_payment",
    },
  ]);

  const [complaints] = useState([
    { id: 1, subject: "Rude behavior", from: "User: Nisha Lama", status: "open" },
    { id: 2, subject: "Payment failed", from: "User: Aayush Shrestha", status: "in_progress" },
    { id: 3, subject: "Late session start", from: "User: Roisha Maharjan", status: "resolved" },
  ]);

  /* =========================
      ACTIONS (UI only)
  ========================= */
  const approveCounselor = (id) => {
    setPendingCounselors((prev) => prev.filter((c) => c.id !== id));
  };

  const rejectCounselor = (id) => {
    setPendingCounselors((prev) => prev.filter((c) => c.id !== id));
  };

  const statusBadge = (status) => {
    const base = "text-xs rounded-full px-3 py-1 border";
    if (status === "active") return `${base} bg-green-50 border-green-200 text-green-700`;
    if (status === "disabled") return `${base} bg-red-50 border-red-200 text-red-700`;
    if (status === "open") return `${base} bg-yellow-50 border-yellow-200 text-yellow-700`;
    if (status === "in_progress") return `${base} bg-blue-50 border-blue-200 text-blue-700`;
    if (status === "resolved") return `${base} bg-green-50 border-green-200 text-green-700`;
    if (status === "scheduled") return `${base} bg-yellow-50 border-yellow-200 text-yellow-700`;
    if (status === "completed") return `${base} bg-green-50 border-green-200 text-green-700`;
    if (status === "pending_payment") return `${base} bg-red-50 border-red-200 text-red-700`;
    return `${base} bg-[#f9fafb] border-[#e5e7eb] text-[#374151]`;
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">
      {/* ============ SIDEBAR ============ */}
      <aside className="w-72 hidden md:flex bg-gradient-to-b from-[#255b4e] to-[#466f64] text-white px-6 py-8 flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="relative mb-10 select-none cursor-default">
            <div className="w-52 h-12 bg-[#1e4940] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi Admin
              </span>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/15 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                🛡️
              </div>
              <div>
                <p className="text-sm font-semibold">{adminName}</p>
                <p className="text-xs text-[#d6ebe2]">{adminEmail}</p>
              </div>
            </div>

            <Link
              to="/admin/settings"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white text-[#1f4e43] text-xs font-semibold px-4 py-2.5
                         shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:-translate-y-[1px] transition"
            >
              Manage settings
            </Link>
          </div>

          {/* Navigation */}
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

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 px-5 md:px-10 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-[#1e293b]">
            Welcome, {adminName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Monitor platform activity, approvals, sessions, payments & complaints.
          </p>
        </div>

        {/* STATS */}
        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: "👤" },
            { label: "Total Counselors", value: stats.totalCounselors, icon: "🧑‍⚕️" },
            { label: "Pending Approvals", value: stats.pendingCounselors, icon: "✅" },
            { label: "Total Sessions", value: stats.totalSessions, icon: "📅" },
            { label: "Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: "💰" },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#e5e7eb]
                         hover:-translate-y-[2px] hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#e3f3e6] flex items-center justify-center text-xl">
                {c.icon}
              </div>
              <p className="mt-4 text-xs text-[#6b7280]">{c.label}</p>
              <p className="text-lg font-semibold">{c.value}</p>
            </div>
          ))}
        </section>

        {/* GRID ROW */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-10">
          {/* Counselor Verification Queue */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Counselor verification queue</h2>
                <p className="text-xs text-[#6b7280]">Approve or reject new counselor applications.</p>
              </div>
              <Link
                to="/admin/counselors"
                className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {pendingCounselors.map((c) => (
                <div key={c.id} className="rounded-2xl border border-[#e5e7eb] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-[#6b7280]">
                      {c.specialization} • {c.experience_years} yrs • License: {c.license_no}
                    </p>
                    <p className="text-xs text-[#6b7280]">{c.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approveCounselor(c.id)}
                      className="text-xs rounded-full bg-[#1f4e43] text-white px-4 py-2 hover:opacity-95"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectCounselor(c.id)}
                      className="text-xs rounded-full border px-4 py-2 hover:bg-[#111827] hover:text-white transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              {!pendingCounselors.length && (
                <div className="text-sm text-[#6b7280] mt-3">
                  No pending counselor requests.
                </div>
              )}
            </div>
          </div>

          {/* Complaints */}
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Recent complaints</h2>
                <p className="text-xs text-[#6b7280]">Quick moderation list.</p>
              </div>
              <Link
                to="/admin/complaints"
                className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
              >
                Open
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {complaints.map((c) => (
                <div key={c.id} className="rounded-2xl border border-[#e5e7eb] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{c.subject}</p>
                    <span className={statusBadge(c.status)}>{c.status}</span>
                  </div>
                  <p className="text-xs text-[#6b7280] mt-1">{c.from}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USERS + SESSIONS */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Recent Users */}
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Recent users</h2>
                <p className="text-xs text-[#6b7280]">Newest signups & status.</p>
              </div>
              <Link
                to="/admin/users"
                className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
              >
                Manage
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f3f4f6] text-[#374151]">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={statusBadge(u.status)}>{u.status}</span>
                      </td>
                    </tr>
                  ))}
                  {!recentUsers.length && (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-[#6b7280]">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Recent sessions</h2>
                <p className="text-xs text-[#6b7280]">Latest bookings and statuses.</p>
              </div>
              <Link
                to="/admin/sessions"
                className="text-xs rounded-full border px-4 py-2 hover:bg-[#f3f4f6] transition"
              >
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f3f4f6] text-[#374151]">
                  <tr>
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3">Counselor</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3">{s.user}</td>
                      <td className="px-4 py-3">{s.counselor}</td>
                      <td className="px-4 py-3">{s.date}</td>
                      <td className="px-4 py-3">
                        <span className={statusBadge(s.status)}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                  {!recentSessions.length && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-[#6b7280]">
                        No sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
