import React, { useMemo, useState } from "react";
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

  /* =====================
     MOCK DATA (SAFE)
  ===================== */
  const overview = useMemo(
    () => ({
      totalUsers: 2,
      counselorsApproved: 2,
      counselorsPending: 5,
      appointmentsWeek: 0,
      appointmentsMonth: 0,
      sessionsCompleted: 0,
      feedbackReports: 0,
    }),
    []
  );

  const bookingsByDay = [
    { day: "Mon", count: 9 },
    { day: "Tue", count: 12 },
    { day: "Wed", count: 7 },
    { day: "Thu", count: 14 },
    { day: "Fri", count: 10 },
    { day: "Sat", count: 6 },
    { day: "Sun", count: 4 },
  ];

  const sessionStatus = [
    { status: "Completed", count: 43 },
    { status: "Cancelled", count: 11 },
    { status: "No-show", count: 8 },
  ];

  const topCounselors = [
    { name: "Dr. Anil Joshi", sessions: 18 },
    { name: "Dr. Prerna Shah", sessions: 16 },
    { name: "Dr. Milan Karki", sessions: 13 },
  ];

  const menuItems = [
    "Dashboard",
    "Hospital Profile",
    "Hospital Admin Account",
    "Counselors",
    "Analytics",
    "Settings",
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-[#1c2b2d] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600&display=swap');
      `}</style>

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 border-r border-black/5 bg-[#fbfcfa] p-4 md:p-5 flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-4 h-24 w-24 rounded-full bg-[#dcece5] blur-2xl" />
          <div className="absolute bottom-8 right-3 h-24 w-24 rounded-full bg-[#f2e6d4] blur-2xl" />
        </div>

        <div className="relative z-10 rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0f2d2b] text-white flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0f2d2b]" style={{ fontFamily: "'Fraunces', serif" }}>
                MannSathi
              </h2>
              <p className="text-[10px] tracking-[0.24em] text-[#6f6e6a]">PLATFORM ADMIN</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-4 rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-3 shadow-sm">
          <div className="space-y-1.5">
            {menuItems.map((item, idx) => (
              <button
                key={item}
                onClick={() => setActiveMenu(item)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-3
                  ${
                    activeMenu === item
                      ? "bg-[#edf5f1] text-[#0f2d2b] ring-1 ring-[#d4e4dd] shadow-sm"
                      : "hover:bg-[#f3f6f4] text-[#56605c]"
                  }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full ${activeMenu === item ? "bg-[#2b5f5a]" : "bg-[#c3c9c6]"}`} />
                  <span className="truncate">{item}</span>
                </span>
                <span className="text-[10px] text-[#8a8e89]">0{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="relative z-10 mt-auto pt-4">
          <div className="rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-3 shadow-sm">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-[#0f2d2b] text-white hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-5 md:p-8 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-4 h-80 w-80 bg-[#dcece5] blur-3xl" />
          <div className="absolute bottom-0 left-6 h-72 w-72 bg-[#f0e8d8] blur-3xl" />
        </div>

        <div className="relative z-10">
          <section className="rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-6 md:p-7 shadow-sm mb-7">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e7e0] bg-[#f4faf7] px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2b5f5a]" />
                  <p className="text-[10px] tracking-[0.24em] text-[#6f6e6a]">PLATFORM OPERATIONS</p>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mt-3 text-[#0f2d2b]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {activeMenu}
                </h1>
                <p className="text-sm md:text-base text-[#5f6562] mt-2 max-w-2xl">
                  Monitor hospitals, counselor lifecycle, appointments, and quality signals from one central control room.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
                <div className="rounded-2xl border border-black/5 bg-[#fbfaf6] px-3 py-2 text-xs text-[#616966] shadow-sm">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
                <button className="rounded-2xl border border-black/5 bg-white px-4 py-2 text-sm font-semibold text-[#0f2d2b] shadow-sm hover:bg-[#f8faf8] transition">
                  Quick Action
                </button>
                <div className="rounded-2xl border border-black/5 bg-[#f8faf8] px-3 py-2 text-xs text-[#4f5855] shadow-sm">
                  Admin Mode
                </div>
              </div>
            </div>
          </section>

        {/* DASHBOARD */}
        {activeMenu === "Dashboard" && (
          <>
            <OverviewCards overview={overview} />

            <Card title="Activity Summary">
              <p className="text-sm text-[#5f6562]">
                This dashboard provides an overview of system usage, counselor
                activity, and appointment trends across the platform.
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-black/5 bg-[#f8faf8] p-4">
                  <p className="text-xs text-[#7c7b77]">Operational Health</p>
                  <p className="text-xl font-semibold mt-1 text-[#0f2d2b]">Stable</p>
                  <p className="text-xs text-[#6b6f6a] mt-2">Core workflows are performing normally.</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-[#f8faf8] p-4">
                  <p className="text-xs text-[#7c7b77]">Counselor Throughput</p>
                  <p className="text-xl font-semibold mt-1 text-[#0f2d2b]">On Track</p>
                  <p className="text-xs text-[#6b6f6a] mt-2">Approvals and bookings are aligned this week.</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-[#f8faf8] p-4">
                  <p className="text-xs text-[#7c7b77]">Client Experience</p>
                  <p className="text-xl font-semibold mt-1 text-[#0f2d2b]">Healthy</p>
                  <p className="text-xs text-[#6b6f6a] mt-2">No major feedback risks detected.</p>
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
                <span className="inline-flex rounded-full border border-[#dce9e2] bg-[#f4faf7] px-2.5 py-1 text-[10px] font-semibold text-[#2b5f5a]">
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
                <span className="inline-flex rounded-full border border-[#e7dfcf] bg-[#fbf7ef] px-2.5 py-1 text-[10px] font-semibold text-[#8d6a2f]">
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
                <span className="inline-flex rounded-full border border-[#dce9e2] bg-[#f4faf7] px-2.5 py-1 text-[10px] font-semibold text-[#2b5f5a]">
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
              <div className="rounded-2xl border border-black/5 bg-[#f8faf8] px-4 py-3 text-sm text-[#5f6562]">
                Topic categories configurable
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#f8faf8] px-4 py-3 text-sm text-[#5f6562]">
                Session types: Chat / Video / In-person
              </div>
              <div className="rounded-2xl border border-black/5 bg-[#f8faf8] px-4 py-3 text-sm text-[#5f6562]">
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
    <div className="bg-white/80 backdrop-blur border border-black/5 rounded-3xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold text-[#0f2d2b]" style={{ fontFamily: "'Fraunces', serif" }}>
          {title}
        </h3>
        <span className="h-2 w-2 rounded-full bg-[#2b5f5a]" />
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
          className="bg-gradient-to-br from-white to-[#fafcf9] backdrop-blur border border-black/5 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#7c7b77] uppercase tracking-wide">{label}</p>
            <span className={`h-2.5 w-2.5 rounded-full ${idx % 2 === 0 ? "bg-[#2b5f5a]" : "bg-[#f4b860]"}`} />
          </div>
          <p className="text-2xl font-semibold mt-2" style={{ fontFamily: "'Fraunces', serif" }}>
            {value}
          </p>
          <p className="text-xs text-[#6b6f6a] mt-2">{hint}</p>
        </div>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <table className="w-full text-sm border-separate border-spacing-y-2">
      <thead>
        <tr className="text-[#7c7b77]">
          {columns.map((col) => (
            <th key={col} className="text-left py-1 px-3 text-xs uppercase tracking-wide">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="bg-[#f9faf7]">
            {row.map((cell, j) => (
              <td key={j} className="py-2.5 px-3 border-y border-[#ece7db] first:border-l first:rounded-l-xl last:border-r last:rounded-r-xl">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
