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
    <div className="min-h-screen bg-[#f4f1eb] text-[#1c2b2d] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600&display=swap');
      `}</style>

      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#0f2d2b] text-white p-6 flex flex-col relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#f4b860]/20" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#2b5f5a]/40" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                MannSathi
              </h2>
              <p className="text-xs tracking-[0.2em] text-white/60">PLATFORM ADMIN</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveMenu(item)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition
                  ${
                    activeMenu === item
                      ? "bg-white/10 text-white"
                      : "hover:bg-white/10 text-white/80"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#f4b860] text-[#0f2d2b] hover:opacity-90"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-8 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-72 w-72 bg-[#f4b860]/25 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 bg-[#2b5f5a]/25 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.35em] text-[#7c7b77]">SYSTEM OVERVIEW</p>
              <h1 className="text-3xl font-bold mt-2" style={{ fontFamily: "'Fraunces', serif" }}>
                {activeMenu}
              </h1>
            </div>
          </div>

        {/* DASHBOARD */}
        {activeMenu === "Dashboard" && (
          <>
            <OverviewCards overview={overview} />

            <Card title="Activity Summary">
              <p className="text-sm text-[#5f6562]">
                This dashboard provides an overview of system usage, counselor
                activity, and appointment trends across the platform.
              </p>
            </Card>
          </>
        )}

        {/* ANALYTICS */}
        {activeMenu === "Analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Bookings by Day (Week)">
              <SimpleTable
                columns={["Day", "Bookings"]}
                rows={bookingsByDay.map((b) => [b.day, b.count])}
              />
            </Card>

            <Card title="Session Status">
              <SimpleTable
                columns={["Status", "Count"]}
                rows={sessionStatus.map((s) => [s.status, s.count])}
              />
            </Card>

            <Card title="Top Counselors">
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
            <ul className="text-sm text-[#5f6562] space-y-2">
              <li>• Topic categories configurable</li>
              <li>• Session types: Chat / Video / In-person</li>
              <li>• Platform announcement banner</li>
            </ul>
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
    <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-5 shadow-sm mb-6">
      <h3 className="font-semibold mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function OverviewCards({ overview }) {
  const items = [
    ["Total Users", overview.totalUsers],
    ["Approved Counselors", overview.counselorsApproved],
    ["Pending Counselors", overview.counselorsPending],
    ["Appointments (Week)", overview.appointmentsWeek],
    ["Appointments (Month)", overview.appointmentsMonth],
    ["Sessions Completed", overview.sessionsCompleted],
    ["Feedback / Reports", overview.feedbackReports],
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      {items.map(([label, value]) => (
        <div key={label} className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-4">
          <p className="text-xs text-[#7c7b77]">{label}</p>
          <p className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[#7c7b77]">
          {columns.map((col) => (
            <th key={col} className="text-left py-2">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-[#e4ddd2]">
            {row.map((cell, j) => (
              <td key={j} className="py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
