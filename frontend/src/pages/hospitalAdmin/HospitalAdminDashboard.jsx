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
  newPatients: "#3B82F6",
  returningPatients: "#0F172A",
};

const DONUT_COLORS = ["#3B82F6", "#0F172A"];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/40 text-slate-800 flex">
      <aside className="hidden md:flex w-[285px] border-r border-slate-200/80 bg-white/80 backdrop-blur relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.08),_transparent_40%)]" />

        <div className="relative z-10 flex h-full flex-col p-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                MH
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.24em] text-slate-500">
                  HOSPITAL ADMIN
                </p>
                <p className="font-semibold leading-tight truncate text-slate-900">
                  {hospitalName}
                </p>
                <p className="text-xs text-slate-500 truncate mt-1">{email}</p>
              </div>
            </div>
          </div>

          <nav className="mt-5 space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <SidebarLink
              to="/hospital-admin/dashboard"
              label="Dashboard"
              active={pathname === "/hospital-admin/dashboard"}
              icon="dashboard"
            />
            <SidebarLink
              to="/hospital-admin/counselors"
              label="Counselor Approval"
              active={pathname.startsWith("/hospital-admin/counselors")}
              badge="Core"
              icon="counselor"
            />
            <SidebarLink
              to="/hospital-admin/appointments"
              label="Appointments"
              active={pathname.startsWith("/hospital-admin/appointments")}
              icon="calendar"
            />
            <SidebarLink
              to="/hospital-admin/patients"
              label="Patients"
              active={pathname.startsWith("/hospital-admin/patients")}
              icon="patient"
            />
            <SidebarLink
              to="/hospital-admin/reports"
              label="Reports"
              active={pathname.startsWith("/hospital-admin/reports")}
              icon="report"
            />
            <SidebarLink
              to="/hospital-admin/schedules"
              label="Schedules"
              active={pathname.startsWith("/hospital-admin/schedules")}
              icon="clock"
            />
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] text-slate-500">Logged in as</p>
            <p className="text-sm font-semibold mt-1 text-slate-900">{email}</p>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Manage counselor verification, appointments, and hospital
              operations.
            </p>

            <button
              onClick={() => {
                logout();
                nav("/admin/login", { replace: true });
              }}
              className="w-full mt-4 bg-slate-200 text-slate-700 py-2.5 rounded-2xl font-semibold hover:shadow-md hover:opacity-95 active:opacity-90 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-16 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute top-32 left-14 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-12 right-1/4 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl" />
        </div>

        <header className="relative z-20 px-4 md:px-8 pt-6 md:pt-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-4 md:p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  MannSathi Hospital Panel
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mt-1">
                  Hospital Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Welcome back, {hospitalName}
                </p>
              </div>

              <div className="w-full xl:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0 sm:min-w-[280px] relative">
                  <input
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    placeholder="Search counselors, patients, appointments..."
                    disabled
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-slate-300" />
                </div>

                <Link
                  to="/hospital-admin/counselors"
                  className="rounded-2xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all duration-200 text-center"
                >
                  Review Counselors
                </Link>

                <Link
                  to="/hospital-admin/appointments"
                  className="rounded-2xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 text-center"
                >
                  View Appointments
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-8 pb-10 pt-6 space-y-6 relative z-10">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Counselors"
              value={loading ? "..." : stats.totalCounselors}
              hint="Approved + managed"
              tone="blue"
            />
            <StatCard
              title="Pending Approvals"
              value={loading ? "..." : stats.pendingApprovals}
              hint="Waiting for review"
              tone="amber"
            />
            <StatCard
              title="Today's Appointments"
              value={loading ? "..." : stats.todaysAppointments}
              hint="Scheduled for today"
              tone="green"
            />
            <StatCard
              title="Upcoming Sessions"
              value={loading ? "..." : stats.upcomingSessions}
              hint="Future confirmed sessions"
              tone="violet"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upcoming Appointments
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Quick preview of hospital appointments
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  placeholder="Search appointments..."
                  disabled
                />
                <select
                  disabled
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                >
                  <option>All statuses</option>
                </select>
                <Link
                  to="/hospital-admin/appointments"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 text-center"
                >
                  Open full page
                </Link>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
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
                    <tr className="border-t border-slate-100">
                      <td
                        colSpan={6}
                        className="py-6 px-4 text-center text-slate-500"
                      >
                        Loading appointments...
                      </td>
                    </tr>
                  ) : upcomingAppointments.length ? (
                    upcomingAppointments.slice(0, 6).map((item, idx) => (
                      <tr
                        key={item.id || `${item.patient_name || "appointment"}-${idx}`}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-all duration-200"
                      >
                        <td className="py-3 px-4 text-slate-700">
                          {item.patient_name || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.counselor_name || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDateValue(item)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatTimeValue(item)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.type || "Chat"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status || "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-slate-100">
                      <td
                        colSpan={6}
                        className="py-6 px-4 text-center text-slate-500"
                      >
                        No upcoming appointments available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg text-slate-900">
                    Pending Counselor Approvals
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Review new counselor requests
                  </p>
                </div>

                <Link
                  to="/hospital-admin/counselors"
                  className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-all duration-200"
                >
                  View all
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <EmptyState text="Loading counselor approvals..." />
                ) : pendingCounselors.length ? (
                  pendingCounselors.slice(0, 4).map((counselor, idx) => (
                    <ApprovalRow
                      key={counselor.id || `${counselor.name || "counselor"}-${idx}`}
                      name={counselor.name || "—"}
                      specialty={
                        counselor.specialty ||
                        counselor.specialization ||
                        "General Counseling"
                      }
                      license={
                        counselor.licenseNumber ||
                        counselor.license_no ||
                        counselor.license ||
                        "Not added"
                      }
                    />
                  ))
                ) : (
                  <EmptyState text="No pending counselor approvals" />
                )}
              </div>
            </div>

            <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-bold text-lg text-slate-900">
                    Counselor Activity
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Active vs inactive counselors
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                  This month
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-center">
                <div className="relative h-[300px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomDonutTooltip />} />
                      <Pie
                        data={counselorActivityChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {counselorActivityChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-slate-900">
                      {totalCounselorActivity}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">Counselors</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {counselorActivityChartData.map((item, index) => (
                    <div
                      key={item.name}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: DONUT_COLORS[index] }}
                        />
                        <p className="text-sm text-slate-500">{item.name}</p>
                      </div>
                      <p className="mt-3 text-3xl font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Patient Overview
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  New vs returning patients by month
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                Monthly
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
              <div>
                <p className="text-sm text-slate-500">Patients Status</p>
                <h3 className="mt-2 text-5xl font-bold text-slate-900">
                  {patientOverviewChartData.reduce(
                    (sum, item) => sum + item.newPatients + item.returningPatients,
                    0
                  )}
                </h3>

                <div className="mt-8 space-y-3">
                  <LegendStat
                    color="bg-blue-500"
                    label="New"
                    value={patientOverviewChartData.reduce(
                      (sum, item) => sum + item.newPatients,
                      0
                    )}
                  />
                  <LegendStat
                    color="bg-slate-900"
                    label="Returning"
                    value={patientOverviewChartData.reduce(
                      (sum, item) => sum + item.returningPatients,
                      0
                    )}
                  />
                </div>
              </div>

              <div className="h-[340px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={patientOverviewChartData}
                    barGap={10}
                    margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#64748B", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748B", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="newPatients"
                      fill={BAR_COLORS.newPatients}
                      radius={[12, 12, 0, 0]}
                      name="New"
                    />
                    <Bar
                      dataKey="returningPatients"
                      fill={BAR_COLORS.returningPatients}
                      radius={[12, 12, 0, 0]}
                      name="Returning"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Recent Activity
                </h2>
                <p className="text-sm text-slate-500 mt-1">Last 7 days</p>
              </div>
            </div>

            <div className="mt-4 relative pl-4">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-4">
                {recentActivities.length ? (
                  recentActivities.slice(0, 5).map((activity, idx) => (
                    <ActivityRow
                      key={activity.id || `${activity.title || "activity"}-${idx}`}
                      title={activity.title || "—"}
                      meta={activity.meta || "—"}
                    />
                  ))
                ) : (
                  <EmptyState text="No recent activity yet" />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
              <InfoLine label="Hospital" value={hospitalName} />
              <InfoLine label="Hospital ID" value={admin?.hospital_id || "—"} />
              <InfoLine label="Admin Email" value={email} />
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-sm text-blue-700">
                Tip: Use the charts to monitor counselor workload and patient flow,
                then review appointments and patients for day-to-day actions.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

function normalizeAppointment(item) {
  if (!item) return null;

  const normalizedDate = normalizeDateOnly(
    item.date ||
      item.appointment_date ||
      (item.date_time ? String(item.date_time).slice(0, 10) : null)
  );

  const normalizedTime = normalizeTimeOnly(
    item.time ||
      item.appointment_time ||
      (item.date_time && String(item.date_time).length >= 16
        ? String(item.date_time).slice(11, 16)
        : null)
  );

  return {
    id: item.id,
    user_id: item.user_id || item.user?.id || null,
    counselor_id: item.counselor_id || item.counselor?.id || null,
    patient_name:
      item.patient_name ||
      item.patientName ||
      item.user?.name ||
      item.user_name ||
      item.name ||
      item.guest_name ||
      "Unknown Patient",
    counselor_name:
      item.counselor_name ||
      item.counselorName ||
      item.counselor?.name ||
      "Unknown Counselor",
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

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
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

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
    license:
      item.licenseNumber ||
      item.license_no ||
      item.license ||
      "Not added",
    status: String(item.status || item.approval_status || "pending").toUpperCase(),
  };
}

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function getLastSixMonths() {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: getMonthKey(d),
      label: getMonthLabel(d),
    });
  }

  return months;
}

function buildPatientOverviewChart(appointments) {
  const months = getLastSixMonths();

  const sorted = [...appointments]
    .filter((a) => a.user_id && getAppointmentStart(a))
    .sort((a, b) => {
      const aStart = getAppointmentStart(a);
      const bStart = getAppointmentStart(b);
      return (aStart?.getTime() || 0) - (bStart?.getTime() || 0);
    });

  const firstMonthByUser = new Map();

  sorted.forEach((a) => {
    const start = getAppointmentStart(a);
    if (start && !firstMonthByUser.has(a.user_id)) {
      firstMonthByUser.set(a.user_id, getMonthKey(start));
    }
  });

  const monthSets = new Map(
    months.map((m) => [
      m.key,
      { newPatients: new Set(), returningPatients: new Set() },
    ])
  );

  sorted.forEach((a) => {
    const start = getAppointmentStart(a);
    if (!start) return;

    const monthKey = getMonthKey(start);
    if (!monthSets.has(monthKey)) return;

    const firstMonth = firstMonthByUser.get(a.user_id);
    const bucket = monthSets.get(monthKey);

    if (firstMonth === monthKey) {
      bucket.newPatients.add(a.user_id);
    } else {
      bucket.returningPatients.add(a.user_id);
    }
  });

  return months.map((m) => ({
    month: m.label,
    newPatients: monthSets.get(m.key)?.newPatients.size || 0,
    returningPatients: monthSets.get(m.key)?.returningPatients.size || 0,
  }));
}

/* ================= SMALL UI ================= */

function SidebarLink({ to, label, active, disabled, badge, icon }) {
  const base =
    "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200";
  const enabledStyle = active
    ? "bg-blue-100 text-blue-600 shadow-sm"
    : "text-slate-600 hover:bg-slate-100";
  const disabledStyle =
    "bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200";

  if (disabled) {
    return (
      <div className={`${base} ${disabledStyle}`}>
        <span className="flex items-center gap-2.5">
          <SidebarIcon type={icon} active={false} />
          <span className="capitalize">{label}</span>
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-500">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link to={to} className={`${base} ${enabledStyle}`}>
      <span className="flex items-center gap-2.5">
        <SidebarIcon type={icon} active={active} />
        {label}
        {badge ? (
          <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[10px] px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-500">
        Go
      </span>
    </Link>
  );
}

function SidebarIcon({ type, active }) {
  const color = active ? "bg-blue-500" : "bg-slate-300";

  if (type === "dashboard") return <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />;
  if (type === "counselor") return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
  if (type === "calendar") return <span className={`h-2.5 w-2.5 rounded-sm rotate-45 ${color}`} />;
  if (type === "clock")
    return <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${color}`} />;
  if (type === "report") return <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />;
  if (type === "patient") return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;

  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function getStatusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (["confirmed", "completed", "active", "approved"].includes(normalized)) {
    return "bg-green-100 text-green-700";
  }
  if (["scheduled", "booked", "in session"].includes(normalized)) {
    return "bg-blue-100 text-blue-700";
  }
  if (["pending", "waiting"].includes(normalized)) {
    return "bg-amber-100 text-amber-700";
  }
  if (["cancelled", "rejected", "inactive"].includes(normalized)) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

function StatCard({ title, value, hint, tone }) {
  const toneMap = {
    blue: {
      chip: "bg-blue-100 text-blue-700 border-blue-200",
    },
    green: {
      chip: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    amber: {
      chip: "bg-amber-100 text-amber-700 border-amber-200",
    },
    violet: {
      chip: "bg-violet-100 text-violet-700 border-violet-200",
    },
    slate: {
      chip: "bg-slate-100 text-slate-700 border-slate-200",
    },
  };

  const t = toneMap[tone] || toneMap.slate;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="flex justify-between items-end mt-4">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${t.chip}`}>
          {hint}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {text}
    </div>
  );
}

function ApprovalRow({ name, specialty, license }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-semibold text-slate-900">{name}</div>
      <div className="text-sm text-slate-500 mt-1">{specialty}</div>
      <div className="text-xs text-slate-400 mt-2">License: {license}</div>
    </div>
  );
}

function LegendStat({ color, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ActivityRow({ title, meta }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-blue-500 shadow" />
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="font-medium text-slate-900">{title}</div>
        <div className="text-sm text-slate-500 mt-1">{meta}</div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function CustomDonutTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm text-sm">
      <div className="font-semibold text-slate-900">{item?.name}</div>
      <div className="text-slate-500 mt-1">{item?.value}</div>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm text-sm">
      <div className="font-semibold text-slate-900">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="text-slate-500 mt-1">
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
}