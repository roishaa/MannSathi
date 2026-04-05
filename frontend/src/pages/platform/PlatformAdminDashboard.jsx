import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PlatformAdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const navigate = useNavigate();

  /* =====================
     LOGOUT HANDLER
  ===================== */
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("admin_info");
    localStorage.removeItem("token"); // fallback
    localStorage.removeItem("admin"); // fallback

    navigate("/admin/login", { replace: true });
  };

  const [overview, setOverview] = useState({
    totalUsers: null,
    counselorsApproved: null,
    counselorsPending: null,
    appointmentsWeek: null,
    appointmentsMonth: null,
    sessionsCompleted: null,
    feedbackReports: null,
  });

  const [bookingsByDay, setBookingsByDay] = useState([]);
  const [sessionStatus, setSessionStatus] = useState([]);
  const [topCounselors, setTopCounselors] = useState([]);

  const menuItems = [
    "Dashboard",
    "Hospital Profile",
    "Hospital Admin Account",
    "Counselors",
    "Analytics",
    "Settings",
  ];

  // Reserved for upcoming backend wiring.
  void setOverview;
  void setBookingsByDay;
  void setSessionStatus;
  void setTopCounselors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/50 text-slate-800 flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 border-r border-slate-200 bg-white p-4 md:p-5 flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-4 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />
          <div className="absolute bottom-8 right-3 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl" />
        </div>

        <div className="relative z-10 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                MannSathi
              </h2>
              <p className="text-[10px] tracking-[0.24em] text-slate-500">PLATFORM ADMIN</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-4 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-3 shadow-sm">
          <div className="space-y-1.5">
            {menuItems.map((item, idx) => (
              <button
                key={item}
                onClick={() => setActiveMenu(item)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-3
                  ${
                    activeMenu === item
                      ? "bg-blue-100 text-blue-600 shadow-sm"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{item}</span>
                </span>
                <span className="text-[10px] text-slate-400">0{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="relative z-10 mt-auto pt-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-3 shadow-sm">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-slate-100 text-slate-700 hover:shadow-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-5 md:p-8 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-4 h-80 w-80 bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-6 h-72 w-72 bg-emerald-200/30 blur-3xl" />
        </div>

        <div className="relative z-10">
          <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-5 md:p-6 shadow-sm mb-7">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <p className="text-[10px] tracking-[0.24em] text-slate-500">PLATFORM OPERATIONS</p>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mt-3 text-slate-900">
                  {activeMenu}
                </h1>
                <p className="text-sm md:text-base text-slate-500 mt-2 max-w-2xl">
                  Monitor hospitals, counselor lifecycle, appointments, and quality signals from one central control room.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
                <div className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600 shadow-sm">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
                <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md transition">
                  Quick Action
                </button>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600 shadow-sm">
                  Admin Mode
                </div>
              </div>
            </div>
          </section>

        {/* DASHBOARD */}
        {activeMenu === "Dashboard" && (
          <>
            <OverviewCards overview={overview} />

            {bookingsByDay.length === 0 && sessionStatus.length === 0 && topCounselors.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm mb-6">
                No analytics data available yet
              </div>
            ) : null}

            <Card title="Activity Summary">
              <p className="text-sm text-slate-500">
                This dashboard provides an overview of system usage, counselor
                activity, and appointment trends across the platform.
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Operational Health</p>
                  <p className="text-xl font-semibold mt-1 text-slate-900">Stable</p>
                  <p className="text-xs text-slate-500 mt-2">Core workflows are performing normally.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Counselor Throughput</p>
                  <p className="text-xl font-semibold mt-1 text-slate-900">On Track</p>
                  <p className="text-xs text-slate-500 mt-2">Approvals and bookings are aligned this week.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Client Experience</p>
                  <p className="text-xl font-semibold mt-1 text-slate-900">Healthy</p>
                  <p className="text-xs text-slate-500 mt-2">No major feedback risks detected.</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ANALYTICS */}
        {activeMenu === "Analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Bookings by Day (Week)">
              <div className="mb-3">
                <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                  Weekly Trend
                </span>
              </div>
              <SimpleTable
                columns={["Day", "Bookings"]}
                rows={bookingsByDay.map((b) => [b.day, b.count])}
              />
            </Card>

            <Card title="Session Status">
              <div className="mb-3">
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
                  Distribution
                </span>
              </div>
              <SimpleTable
                columns={["Status", "Count"]}
                rows={sessionStatus.map((s) => [s.status, s.count])}
              />
            </Card>

            <Card title="Top Counselors">
              <div className="mb-3">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                  Performance
                </span>
              </div>
              <SimpleTable
                columns={["Counselor", "Sessions"]}
                rows={topCounselors.map((c) => [c.name, c.sessions])}
              />
            </Card>
          </div>
        )}

        {/* SETTINGS */}
        {activeMenu === "Settings" && (
          <Card title="Platform Settings">
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                Topic categories configurable
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                Session types: Chat / Video / In-person
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                Platform announcement banner
              </div>
            </div>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
}

/* =====================
   REUSABLE COMPONENTS
===================== */

function Card({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>
        <span className="h-2 w-2 rounded-full bg-slate-300" />
      </div>
      {children}
    </div>
  );
}

function OverviewCards({ overview }) {
  const items = [
    ["Total Users", overview.totalUsers, "System members"],
    ["Approved Counselors", overview.counselorsApproved, "Verified and active"],
    ["Pending Counselors", overview.counselorsPending, "Need platform review"],
    ["Appointments (Week)", overview.appointmentsWeek, "Current week"],
    ["Appointments (Month)", overview.appointmentsMonth, "Current month"],
    ["Sessions Completed", overview.sessionsCompleted, "Delivered successfully"],
    ["Feedback / Reports", overview.feedbackReports, "Open escalations"],
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {items.map(([label, value, hint], idx) => (
        <div
          key={label}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
            <span className={`h-9 w-9 rounded-xl ${idx % 4 === 0 ? "bg-blue-100 text-blue-600" : idx % 4 === 1 ? "bg-emerald-100 text-emerald-600" : idx % 4 === 2 ? "bg-violet-100 text-violet-600" : "bg-amber-100 text-amber-600"} shadow-sm`} />
          </div>
          <p className="text-2xl font-semibold mt-2 text-slate-900">
            {value ?? "—"}
          </p>
          <p className="text-xs text-slate-500 mt-2">{hint}</p>
        </div>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <table className="w-full text-sm border-separate border-spacing-y-2">
      <thead>
        <tr className="text-slate-500">
          {columns.map((col) => (
            <th key={col} className="text-left py-1 px-3 text-xs uppercase tracking-wide">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan="2" className="text-center py-4 text-slate-400">
              No data available
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i} className="bg-white hover:bg-slate-50 transition-all duration-200">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 px-3 border-y border-slate-200 first:border-l first:rounded-l-xl last:border-r last:rounded-r-xl">
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
