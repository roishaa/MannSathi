// src/pages/platform/PlatformAdminDashboard.jsx
import React, { useMemo, useState } from "react";

export default function PlatformAdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  /* =====================
     MOCK DATA (SAFE)
  ===================== */
  const overview = useMemo(() => ({
    totalUsers: 1284,
    counselorsApproved: 24,
    counselorsPending: 5,
    appointmentsWeek: 62,
    appointmentsMonth: 218,
    sessionsCompleted: 173,
    feedbackReports: 11,
  }), []);

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r p-5">
        <h2 className="text-xl font-bold">MannSathi</h2>
        <p className="text-sm text-slate-500">Platform Admin</p>

        <div className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`w-full text-left px-4 py-2 rounded-xl text-sm
                ${activeMenu === item
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100 text-slate-700"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">{activeMenu}</h1>

        {/* DASHBOARD */}
        {activeMenu === "Dashboard" && (
          <>
            <OverviewCards overview={overview} />

            <Card title="Activity Summary">
              <p className="text-sm text-slate-600">
                This dashboard provides an overview of system usage,
                counselor activity, and appointment trends across the platform.
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
                rows={bookingsByDay.map(b => [b.day, b.count])}
              />
            </Card>

            <Card title="Session Status">
              <SimpleTable
                columns={["Status", "Count"]}
                rows={sessionStatus.map(s => [s.status, s.count])}
              />
            </Card>

            <Card title="Top Counselors">
              <SimpleTable
                columns={["Counselor", "Sessions"]}
                rows={topCounselors.map(c => [c.name, c.sessions])}
              />
            </Card>
          </div>
        )}

        {/* SETTINGS */}
        {activeMenu === "Settings" && (
          <Card title="Platform Settings">
            <ul className="text-sm text-slate-700 space-y-2">
              <li>• Topic categories configurable</li>
              <li>• Session types: Chat / Video / In-person</li>
              <li>• Platform announcement banner</li>
            </ul>
          </Card>
        )}
      </main>
    </div>
  );
}

/* =====================
   REUSABLE COMPONENTS
===================== */

function Card({ title, children }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">
      <h3 className="font-semibold mb-3">{title}</h3>
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
        <div key={label} className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-slate-500">
          {columns.map(col => (
            <th key={col} className="text-left py-2">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t">
            {row.map((cell, j) => (
              <td key={j} className="py-2">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
