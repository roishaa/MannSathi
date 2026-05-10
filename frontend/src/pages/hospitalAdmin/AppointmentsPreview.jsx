import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import { getAdminInfo, logout } from "../../utils/adminAuth";

const statusStyles = {
  pending:   "bg-amber-100 text-amber-700 border border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  completed: "bg-teal-100 text-teal-700 border border-teal-200",
  cancelled: "bg-rose-100 text-rose-700 border border-rose-200",
};

const AppointmentsPreview = () => {
  const navigate = useNavigate();
  const admin = useMemo(() => getAdminInfo(), []);
  const hospitalName = admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { to: "/hospital-admin/dashboard",       label: "Dashboard",          icon: "🏠",  exact: true },
    { to: "/hospital-admin/counselors",       label: "Counselor Approval", icon: "🧑‍⚕️", badge: "Core" },
    { to: "/hospital-admin/appointments",     label: "Appointments",       icon: "📅" },
    { to: "/hospital-admin/payment-history",  label: "Payment History",    icon: "💳" },
    { to: "/hospital-admin/schedules",        label: "Schedules",          icon: "🕐" },
    { to: "/hospital-admin/session-history",  label: "Session History",    icon: "📋" },
  ];

  const pad2 = (v) => String(v).padStart(2, "0");
  const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

  const normalizeDateOnly = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const d = new Date(str);
    if (!isValidDate(d)) return null;
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  const normalizeTimeOnly = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) return str.slice(0, 5);
    const d = new Date(str);
    if (!isValidDate(d)) return null;
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const buildLocalDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const [hour, minute] = String(timeStr).slice(0, 5).split(":").map(Number);
    if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;
    const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
    return isValidDate(dt) ? dt : null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const d = new Date(year, month - 1, day);
    if (!isValidDate(d)) return dateStr;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    const [hourRaw, minuteRaw] = String(timeStr).slice(0, 5).split(":");
    let hour = Number(hourRaw);
    const minute = minuteRaw || "00";
    if (Number.isNaN(hour)) return timeStr;
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
  };

  const normalizeAppointment = (item) => {
    const normalizedDate = normalizeDateOnly(
      item.date || item.appointment_date || (item.date_time ? String(item.date_time).slice(0, 10) : null)
    );
    const normalizedTime = normalizeTimeOnly(
      item.time || item.appointment_time || (item.date_time && String(item.date_time).length >= 16 ? String(item.date_time).slice(11, 16) : null)
    );
    const localStart = buildLocalDateTime(normalizedDate, normalizedTime);
    return { ...item, normalizedDate, normalizedTime, localStart };
  };

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/hospital-admin/appointments");
      const raw = res.data.appointments || [];
      setAppointments(raw.map(normalizeAppointment));
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  })();

  const now = new Date();

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => (b.localStart?.getTime() || 0) - (a.localStart?.getTime() || 0));
  }, [appointments]);

  const todaysAppointments = useMemo(() => appointments.filter((a) => a.normalizedDate === today), [appointments, today]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.localStart && a.localStart >= now && a.status !== "cancelled")
      .sort((a, b) => (a.localStart?.getTime() || 0) - (b.localStart?.getTime() || 0));
  }, [appointments, now]);

  const pastAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.localStart && a.localStart < now)
      .sort((a, b) => (b.localStart?.getTime() || 0) - (a.localStart?.getTime() || 0));
  }, [appointments, now]);

  const confirmedAppointments = useMemo(() => appointments.filter((a) => a.status === "confirmed"), [appointments]);

  const getStatusClass = (status) => statusStyles[status] || "bg-[#f8f6f0] text-[#6a7772] border border-[#e7e5de]";

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">

      {/* ── Dark Green Sidebar ── */}
      <aside className="w-80 hidden md:flex bg-gradient-to-b from-[#255b4e] via-[#2d6154] to-[#466f64] text-white px-7 py-8 flex-col justify-between">
        <div>
          <div className="mb-8 rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🌿</div>
              <div>
                <p className="font-serif text-2xl font-semibold tracking-wide">MannSathi</p>
                <p className="text-[11px] text-[#d6ebe2]">Hospital Admin Panel</p>
              </div>
            </div>
          </div>

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

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const active = item.exact
                ? window.location.pathname === item.to
                : window.location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    active
                      ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]"
                      : "text-white/95 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => { logout(); navigate("/admin/login", { replace: true }); }}
          className="text-xs font-semibold rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-left text-[#e2efe8] hover:text-white transition-all"
        >
          Logout
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 md:px-8 py-8 space-y-6 bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)]">

        {/* Header */}
        <div className="rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">Hospital Admin Panel</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Appointments Overview
              </h1>
              <p className="mt-2 text-sm text-[#5f6d68]">Monitor upcoming appointments and review past session records.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/hospital-admin/dashboard")}
                className="px-5 py-2.5 bg-white border border-[#d7d9d0] rounded-2xl text-sm font-semibold text-[#27584d] hover:bg-[#f7f8f5] transition shadow-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today's Appointments" value={todaysAppointments.length}    hint="Today"   tone="teal"  />
          <StatCard title="Upcoming"             value={upcomingAppointments.length}  hint="Future"  tone="green" />
          <StatCard title="Past Appointments"    value={pastAppointments.length}      hint="History" tone="sage"  />
          <StatCard title="Confirmed Sessions"   value={confirmedAppointments.length} hint="Active"  tone="amber" />
        </section>

        {/* Upcoming Appointments */}
        <section className="rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-lg text-[#1f4e43]">Upcoming Appointments</h2>
            <p className="text-sm text-[#6a7772] mt-1">Future booked appointments that have not happened yet</p>
          </div>

          {loading ? (
            <p className="text-sm text-[#6a7772]">Loading...</p>
          ) : upcomingAppointments.slice(0, 3).length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#f8f6f0] border border-[#e7e5de] text-sm text-[#6a7772]">
              No upcoming appointments found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcomingAppointments.slice(0, 3).map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} formatDate={formatDate} formatTime={formatTime} getStatusClass={getStatusClass} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Appointments Table */}
        <section className="rounded-3xl border border-[#e7e5de] bg-white overflow-hidden shadow-sm">
          <div className="p-5 md:p-6 border-b border-[#f0ede6]">
            <h2 className="font-bold text-lg text-[#1f4e43]">Recent Appointments</h2>
            <p className="text-sm text-[#6a7772] mt-1">Latest appointment records from the system</p>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-[#6a7772]">Loading...</p>
          ) : sortedAppointments.length === 0 ? (
            <div className="p-6">
              <div className="p-4 rounded-2xl bg-[#f8f6f0] border border-[#e7e5de] text-sm text-[#6a7772]">No appointments found.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f8f6f0] text-[#6a7772]">
                  <tr>
                    <th className="p-4 text-left font-semibold">Patient</th>
                    <th className="p-4 text-left font-semibold">Counselor</th>
                    <th className="p-4 text-left font-semibold">Date</th>
                    <th className="p-4 text-left font-semibold">Time</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAppointments.slice(0, 6).map((appt) => (
                    <tr key={appt.id} className="border-t border-[#f0ede6] hover:bg-[#f8f6f0] transition-colors">
                      <td className="p-4 text-[#1f4e43] font-medium">{appt.user?.name || appt.name || "Unknown Patient"}</td>
                      <td className="p-4 text-[#5f6d68]">{appt.counselor?.name || "Unknown Counselor"}</td>
                      <td className="p-4 text-[#5f6d68]">{formatDate(appt.normalizedDate)}</td>
                      <td className="p-4 text-[#5f6d68]">{formatTime(appt.normalizedTime)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(appt.status)}`}>
                          {appt.status || "unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Past Appointments */}
        <section className="rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-lg text-[#1f4e43]">Past Appointments</h2>
            <p className="text-sm text-[#6a7772] mt-1">Previous appointments already completed or passed</p>
          </div>

          {loading ? (
            <p className="text-sm text-[#6a7772]">Loading...</p>
          ) : pastAppointments.slice(0, 6).length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#f8f6f0] border border-[#e7e5de] text-sm text-[#6a7772]">
              No past appointments found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pastAppointments.slice(0, 6).map((appt) => (
                <AppointmentCard key={`past-${appt.id}`} appt={appt} formatDate={formatDate} formatTime={formatTime} getStatusClass={getStatusClass} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

/* ── Appointment Card ── */
function AppointmentCard({ appt, formatDate, formatTime, getStatusClass }) {
  return (
    <div className="rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#1f4e43]">{appt.user?.name || appt.name || "Unknown Patient"}</p>
          <p className="text-sm text-[#6a7772] mt-1">{appt.counselor?.name || "Unknown Counselor"}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(appt.status)}`}>
          {appt.status || "unknown"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white px-3 py-3 border border-[#e7e5de]">
          <p className="text-xs text-[#8f9a95]">Date</p>
          <p className="text-sm font-medium text-[#1f4e43] mt-1">{formatDate(appt.normalizedDate)}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-3 border border-[#e7e5de]">
          <p className="text-xs text-[#8f9a95]">Time</p>
          <p className="text-sm font-medium text-[#1f4e43] mt-1">{formatTime(appt.normalizedTime)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ title, value, hint, tone }) {
  const toneMap = {
    green: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
    teal:  "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    sage:  "bg-[#f8f6f0] text-[#1f4e43] border-[#e7e5de]",
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

export default AppointmentsPreview;