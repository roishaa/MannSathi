import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAdminInfo, logout } from "../../utils/adminAuth";
import { API } from "../../utils/api";

const BAR_COLORS = {
  newPatients: "#34d399",
  returningPatients: "#064e3b",
};

const DONUT_COLORS = ["#34d399", "#064e3b"];

export default function HospitalAdminDashboard() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const admin = useMemo(() => getAdminInfo(), []);
  const hospitalName =
    admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, counselorsRes] = await Promise.all([
        API.get("/hospital-admin/appointments"),
        API.get("/hospital-admin/counselors"),
      ]);

      const appointmentsRaw = Array.isArray(appointmentsRes.data)
        ? appointmentsRes.data
        : Array.isArray(appointmentsRes.data?.appointments)
        ? appointmentsRes.data.appointments
        : Array.isArray(appointmentsRes.data?.data)
        ? appointmentsRes.data.data
        : [];

      const counselorsRaw = Array.isArray(counselorsRes.data)
        ? counselorsRes.data
        : Array.isArray(counselorsRes.data?.data)
        ? counselorsRes.data.data
        : [];

      setAppointments(appointmentsRaw.map(normalizeAppointment).filter(Boolean));
      setCounselors(counselorsRaw.map(normalizeCounselor).filter(Boolean));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setAppointments([]);
      setCounselors([]);
    } finally {
      setLoading(false);
    }
  };

  const today = getTodayDate();
  const now = new Date();

  const approvedCounselors = useMemo(() => {
    return counselors.filter((c) =>
      ["APPROVED", "ACTIVE"].includes(String(c.status).toUpperCase())
    );
  }, [counselors]);

  const pendingCounselors = useMemo(() => {
    return counselors.filter((c) =>
      ["PENDING", "WAITING"].includes(String(c.status).toUpperCase())
    );
  }, [counselors]);

  const todaysAppointments = useMemo(() => {
    return appointments.filter((a) => a.date === today);
  }, [appointments, today]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const dt = getAppointmentStart(a);
        if (!dt) return false;
        return dt >= now && String(a.status).toLowerCase() !== "cancelled";
      })
      .sort((a, b) => {
        const aStart = getAppointmentStart(a);
        const bStart = getAppointmentStart(b);
        return (aStart?.getTime() || 0) - (bStart?.getTime() || 0);
      });
  }, [appointments, now]);

  const completedToday = useMemo(() => {
    return todaysAppointments.filter(
      (a) => String(a.status).toLowerCase() === "completed"
    ).length;
  }, [todaysAppointments]);

  const cancelledToday = useMemo(() => {
    return todaysAppointments.filter(
      (a) => String(a.status).toLowerCase() === "cancelled"
    ).length;
  }, [todaysAppointments]);

  const activeCounselorIdsThisMonth = useMemo(() => {
    const monthKey = getMonthKey(new Date());
    return new Set(
      appointments
        .filter((a) => {
          const start = getAppointmentStart(a);
          return start && getMonthKey(start) === monthKey;
        })
        .map((a) => a.counselor_id)
        .filter(Boolean)
    );
  }, [appointments]);

  const activeCounselorsCount = activeCounselorIdsThisMonth.size;
  const inactiveCounselorsCount = Math.max(
    approvedCounselors.length - activeCounselorsCount,
    0
  );

  const stats = {
    totalCounselors: approvedCounselors.length,
    pendingApprovals: pendingCounselors.length,
    todaysAppointments: todaysAppointments.length,
    upcomingSessions: upcomingAppointments.length,
    activeCounselors: activeCounselorsCount,
    inactiveCounselors: inactiveCounselorsCount,
    completedToday,
    cancelledToday,
  };

  const patientOverviewChartData = useMemo(() => {
    return buildPatientOverviewChart(appointments);
  }, [appointments]);

  const counselorActivityChartData = useMemo(() => {
    const total = approvedCounselors.length;
    const active = Math.min(activeCounselorsCount, total);
    const inactive = Math.max(total - active, 0);
    return [
      { name: "Active", value: active },
      { name: "Inactive", value: inactive },
    ];
  }, [approvedCounselors, activeCounselorsCount]);

  const totalCounselorActivity = counselorActivityChartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const recentActivities = admin?.recentActivities || [];

  const navItems = [
    { to: "/hospital-admin/dashboard", label: "Dashboard", icon: "🏠", exact: true },
    { to: "/hospital-admin/counselors", label: "Counselor Approval", icon: "🧑‍⚕️", badge: "Core" },
    { to: "/hospital-admin/appointments", label: "Appointments", icon: "📅" },
    { to: "/hospital-admin/payment-history", label: "Payment History", icon: "💳" },
    { to: "/hospital-admin/schedules", label: "Schedules", icon: "🕐" },
    { to: "/hospital-admin/session-history", label: "Session History", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">

      {/* ── Dark Green Sidebar ── */}
      <aside className="w-80 hidden md:flex bg-gradient-to-b from-[#255b4e] via-[#2d6154] to-[#466f64] text-white px-7 py-8 flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="mb-8 rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🌿</div>
              <div>
                <p className="font-serif text-2xl font-semibold tracking-wide">MannSathi</p>
                <p className="text-[11px] text-[#d6ebe2]">Hospital Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Admin info */}
          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🏥</div>
              <div className="min-w-0">
                <p className="text-xs text-[#d6ebe2] tracking-[0.2em] uppercase">Hospital Admin</p>
                <p className="text-sm font-semibold truncate mt-1">{hospitalName}</p>
                <p className="text-xs text-[#d6ebe2] truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    active
                      ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]"
                      : "text-white/95 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); nav("/admin/login", { replace: true }); }}
          className="text-xs font-semibold rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-left text-[#e2efe8] hover:text-white transition-all"
        >
          Logout
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 md:px-8 py-8 space-y-6 bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)]">

        {/* Header */}
        <div className="rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">MannSathi Hospital Panel</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Hospital Dashboard
              </h1>
              <p className="mt-2 text-sm text-[#5f6d68] font-medium">Welcome back, {hospitalName}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/hospital-admin/counselors" className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md">
                Review Counselors
              </Link>
              <Link to="/hospital-admin/appointments" className="px-5 py-2.5 bg-white border border-[#d7d9d0] rounded-2xl text-sm font-semibold text-[#27584d] hover:bg-[#f7f8f5] transition shadow-sm">
                View Appointments
              </Link>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Counselors" value={loading ? "..." : stats.totalCounselors} hint="Approved + managed" tone="green" />
          <StatCard title="Pending Approvals" value={loading ? "..." : stats.pendingApprovals} hint="Waiting for review" tone="amber" />
          <StatCard title="Today's Appointments" value={loading ? "..." : stats.todaysAppointments} hint="Scheduled for today" tone="teal" />
          <StatCard title="Upcoming Sessions" value={loading ? "..." : stats.upcomingSessions} hint="Future confirmed sessions" tone="sage" />
        </section>

        {/* Upcoming Appointments Table */}
        <section className="rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#1f4e43]">Upcoming Appointments</h2>
              <p className="text-sm text-[#6a7772] mt-1">Quick preview of hospital appointments</p>
            </div>
            <Link to="/hospital-admin/appointments" className="px-4 py-2 rounded-2xl border border-[#d7d9d0] text-sm font-semibold text-[#1f4e43] hover:bg-[#f7f8f5] transition">
              Open full page
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#e7e5de]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8f6f0] text-[#6a7772]">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Patient</th>
                  <th className="py-3 px-4 text-left font-semibold">Counselor</th>
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 text-left font-semibold">Time</th>
                  <th className="py-3 px-4 text-left font-semibold">Type</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 px-4 text-center text-[#6a7772]">Loading appointments...</td></tr>
                ) : upcomingAppointments.length ? (
                  upcomingAppointments.slice(0, 6).map((item, idx) => (
                    <tr key={item.id || idx} className="border-t border-[#f0ede6] hover:bg-[#f8f6f0] transition-all">
                      <td className="py-3 px-4 text-[#1f4e43] font-medium">{item.patient_name || "—"}</td>
                      <td className="py-3 px-4 text-[#5f6d68]">{item.counselor_name || "—"}</td>
                      <td className="py-3 px-4 text-[#5f6d68]">{formatDateValue(item)}</td>
                      <td className="py-3 px-4 text-[#5f6d68]">{formatTimeValue(item)}</td>
                      <td className="py-3 px-4 text-[#5f6d68]">{item.type || "Chat"}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}>
                          {item.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-8 px-4 text-center text-[#6a7772]">No upcoming appointments available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pending Approvals + Counselor Activity */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pending approvals */}
          <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-lg text-[#1f4e43]">Pending Counselor Approvals</h2>
                <p className="text-sm text-[#6a7772] mt-1">Review new counselor requests</p>
              </div>
              <Link to="/hospital-admin/counselors" className="text-sm font-semibold text-[#1f4e43] hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <EmptyState text="Loading counselor approvals..." />
              ) : pendingCounselors.length ? (
                pendingCounselors.slice(0, 4).map((counselor, idx) => (
                  <ApprovalRow
                    key={counselor.id || idx}
                    name={counselor.name || "—"}
                    specialty={counselor.specialty || counselor.specialization || "General Counseling"}
                    license={counselor.licenseNumber || counselor.license_no || counselor.license || "Not added"}
                  />
                ))
              ) : (
                <EmptyState text="No pending counselor approvals" />
              )}
            </div>
          </div>

          {/* Counselor Activity Donut */}
          <div className="xl:col-span-2 rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-lg text-[#1f4e43]">Counselor Activity</h2>
                <p className="text-sm text-[#6a7772] mt-1">Active vs inactive counselors</p>
              </div>
              <span className="rounded-full border border-[#e7e5de] bg-[#f8f6f0] px-3 py-1 text-xs text-[#6a7772]">This month</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-center">
              <div className="relative h-[300px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomDonutTooltip />} />
                    <Pie data={counselorActivityChartData} dataKey="value" nameKey="name" innerRadius={80} outerRadius={110} paddingAngle={4} stroke="none">
                      {counselorActivityChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold text-[#1f4e43]">{totalCounselorActivity}</span>
                  <span className="mt-1 text-xs text-[#6a7772]">Counselors</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {counselorActivityChartData.map((item, index) => (
                  <div key={item.name} className="rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: DONUT_COLORS[index] }} />
                      <p className="text-sm text-[#6a7772]">{item.name}</p>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-[#1f4e43]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Patient Overview Bar Chart */}
        <section className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-lg text-[#1f4e43]">Patient Overview</h2>
              <p className="text-sm text-[#6a7772] mt-1">New vs returning patients by month</p>
            </div>
            <span className="rounded-full border border-[#e7e5de] bg-[#f8f6f0] px-3 py-1 text-xs text-[#6a7772]">Monthly</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
            <div>
              <p className="text-sm text-[#6a7772]">Patients Status</p>
              <h3 className="mt-2 text-5xl font-bold text-[#1f4e43]">
                {patientOverviewChartData.reduce((sum, item) => sum + item.newPatients + item.returningPatients, 0)}
              </h3>
              <div className="mt-8 space-y-3">
                <LegendStat color="bg-emerald-400" label="New" value={patientOverviewChartData.reduce((sum, item) => sum + item.newPatients, 0)} />
                <LegendStat color="bg-[#064e3b]" label="Returning" value={patientOverviewChartData.reduce((sum, item) => sum + item.returningPatients, 0)} />
              </div>
            </div>

            <div className="h-[340px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientOverviewChartData} barGap={10} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5de" />
                  <XAxis dataKey="month" tick={{ fill: "#6a7772", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6a7772", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="newPatients" fill={BAR_COLORS.newPatients} radius={[12, 12, 0, 0]} name="New" />
                  <Bar dataKey="returningPatients" fill={BAR_COLORS.returningPatients} radius={[12, 12, 0, 0]} name="Returning" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg text-[#1f4e43]">Recent Activity</h2>
              <p className="text-sm text-[#6a7772] mt-1">Last 7 days</p>
            </div>
          </div>
          <div className="relative pl-4">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#e7e5de]" />
            <div className="space-y-4">
              {recentActivities.length ? (
                recentActivities.slice(0, 5).map((activity, idx) => (
                  <ActivityRow key={activity.id || idx} title={activity.title || "—"} meta={activity.meta || "—"} />
                ))
              ) : (
                <EmptyState text="No recent activity yet" />
              )}
            </div>
          </div>
        </section>

        {/* Info footer */}
        <section className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <InfoLine label="Hospital" value={hospitalName} />
            <InfoLine label="Hospital ID" value={admin?.hospital_id || "—"} />
            <InfoLine label="Admin Email" value={email} />
          </div>
          <div className="mt-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] p-4">
            <p className="text-sm text-[#166534]">
              Tip: Use the charts to monitor counselor workload and patient flow, then review appointments and patients for day-to-day actions.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

function normalizeAppointment(item) {
  if (!item) return null;
  const normalizedDate = normalizeDateOnly(
    item.date || item.appointment_date || (item.date_time ? String(item.date_time).slice(0, 10) : null)
  );
  const normalizedTime = normalizeTimeOnly(
    item.time || item.appointment_time || (item.date_time && String(item.date_time).length >= 16 ? String(item.date_time).slice(11, 16) : null)
  );
  return {
    id: item.id,
    user_id: item.user_id || item.user?.id || null,
    counselor_id: item.counselor_id || item.counselor?.id || null,
    patient_name: item.patient_name || item.patientName || item.user?.name || item.user_name || item.name || item.guest_name || "Unknown Patient",
    counselor_name: item.counselor_name || item.counselorName || item.counselor?.name || "Unknown Counselor",
    date: normalizedDate,
    time: normalizedTime,
    date_time: item.date_time || null,
    status: item.status || "pending",
    type: item.type || item.session_type || "Chat",
  };
}

function normalizeDateOnly(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeTimeOnly(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) return str.slice(0, 5);
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getAppointmentStart(item) {
  if (item?.date && item?.time) {
    const [year, month, day] = String(item.date).split("-").map(Number);
    const [hour, minute] = String(item.time).slice(0, 5).split(":").map(Number);
    const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return null;
}

function formatDateValue(item) {
  if (!item?.date) return "—";
  const [year, month, day] = String(item.date).split("-").map(Number);
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return item.date;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTimeValue(item) {
  if (!item?.time) return "—";
  const [hourRaw, minuteRaw] = String(item.time).slice(0, 5).split(":");
  let hour = Number(hourRaw);
  const minute = minuteRaw || "00";
  if (Number.isNaN(hour)) return item.time;
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

function normalizeCounselor(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name || item.full_name || "Counselor",
    specialty: item.specialty || item.specialization || "General Counseling",
    license: item.licenseNumber || item.license_no || item.license || "Not added",
    status: String(item.status || item.approval_status || "pending").toUpperCase(),
  };
}

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function getLastSixMonths() {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: getMonthKey(d), label: getMonthLabel(d) });
  }
  return months;
}

function buildPatientOverviewChart(appointments) {
  const months = getLastSixMonths();
  const sorted = [...appointments]
    .filter((a) => a.user_id && getAppointmentStart(a))
    .sort((a, b) => (getAppointmentStart(a)?.getTime() || 0) - (getAppointmentStart(b)?.getTime() || 0));

  const firstMonthByUser = new Map();
  sorted.forEach((a) => {
    const start = getAppointmentStart(a);
    if (start && !firstMonthByUser.has(a.user_id)) {
      firstMonthByUser.set(a.user_id, getMonthKey(start));
    }
  });

  const monthSets = new Map(months.map((m) => [m.key, { newPatients: new Set(), returningPatients: new Set() }]));
  sorted.forEach((a) => {
    const start = getAppointmentStart(a);
    if (!start) return;
    const monthKey = getMonthKey(start);
    if (!monthSets.has(monthKey)) return;
    const firstMonth = firstMonthByUser.get(a.user_id);
    const bucket = monthSets.get(monthKey);
    if (firstMonth === monthKey) bucket.newPatients.add(a.user_id);
    else bucket.returningPatients.add(a.user_id);
  });

  return months.map((m) => ({
    month: m.label,
    newPatients: monthSets.get(m.key)?.newPatients.size || 0,
    returningPatients: monthSets.get(m.key)?.returningPatients.size || 0,
  }));
}

/* ================= UI COMPONENTS ================= */

function StatCard({ title, value, hint, tone }) {
  const toneMap = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    sage: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
  };
  const chip = toneMap[tone] || toneMap.sage;
  return (
    <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
      <p className="text-sm text-[#6a7772]">{title}</p>
      <div className="flex justify-between items-end mt-4">
        <h3 className="text-3xl font-bold text-[#1f4e43]">{value}</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${chip}`}>{hint}</span>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e7e5de] bg-[#f8f6f0] p-4 text-sm text-[#6a7772]">{text}</div>
  );
}

function ApprovalRow({ name, specialty, license }) {
  return (
    <div className="rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] p-4">
      <div className="font-semibold text-[#1f4e43]">{name}</div>
      <div className="text-sm text-[#6a7772] mt-1">{specialty}</div>
      <div className="text-xs text-[#8f9a95] mt-2">License: {license}</div>
    </div>
  );
}

function LegendStat({ color, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm text-[#6a7772]">{label}</span>
      </div>
      <span className="font-semibold text-[#1f4e43]">{value}</span>
    </div>
  );
}

function ActivityRow({ title, meta }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-[#1f4e43] shadow" />
      <div className="rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] px-4 py-3">
        <div className="font-medium text-[#1f4e43]">{title}</div>
        <div className="text-sm text-[#6a7772] mt-1">{meta}</div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] px-4 py-3">
      <div className="text-xs text-[#8f9a95]">{label}</div>
      <div className="text-sm font-medium text-[#1f4e43] mt-1">{value}</div>
    </div>
  );
}

function getStatusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (["confirmed", "completed", "active", "approved"].includes(normalized)) return "bg-emerald-100 text-emerald-700";
  if (["scheduled", "booked", "in session"].includes(normalized)) return "bg-teal-100 text-teal-700";
  if (["pending", "waiting"].includes(normalized)) return "bg-amber-100 text-amber-700";
  if (["cancelled", "rejected", "inactive"].includes(normalized)) return "bg-red-100 text-red-700";
  return "bg-[#f8f6f0] text-[#6a7772]";
}

function CustomDonutTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-[#e7e5de] bg-white px-3 py-2 shadow-sm text-sm">
      <div className="font-semibold text-[#1f4e43]">{item?.name}</div>
      <div className="text-[#6a7772] mt-1">{item?.value}</div>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-[#e7e5de] bg-white px-3 py-2 shadow-sm text-sm">
      <div className="font-semibold text-[#1f4e43]">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="text-[#6a7772] mt-1">{entry.name}: {entry.value}</div>
      ))}
    </div>
  );
}