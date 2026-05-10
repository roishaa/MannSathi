// src/pages/hospital-admin/HospitalAdminSchedules.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import { getAdminInfo, logout } from "../../utils/adminAuth";

export default function HospitalAdminSchedules() {
  const nav = useNavigate();
  const admin = useMemo(() => getAdminInfo(), []);
  const hospitalName = admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [counselors, setCounselors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const navItems = [
    { to: "/hospital-admin/dashboard",       label: "Dashboard",          icon: "🏠",  exact: true },
    { to: "/hospital-admin/counselors",      label: "Counselor Approval", icon: "🧑‍⚕️", badge: "Core" },
    { to: "/hospital-admin/appointments",    label: "Appointments",       icon: "📅" },
    { to: "/hospital-admin/payment-history", label: "Payment History",    icon: "💳" },
    { to: "/hospital-admin/schedules",       label: "Schedules",          icon: "🕐" },
    { to: "/hospital-admin/session-history", label: "Session History",    icon: "📋" },
  ];

  useEffect(() => { fetchData(selectedDate); }, [selectedDate]);

  const fetchData = async (date) => {
    setLoading(true);
    setError("");
    try {
      const counselorRes = await API.get("/hospital-admin/counselors");
      const counselorRaw = Array.isArray(counselorRes.data) ? counselorRes.data : counselorRes.data?.data || [];
      const approvedCounselors = counselorRaw
        .map((c) => ({ ...c, status: String(c.status || c.approval_status || "").toUpperCase() }))
        .filter((c) => c.status === "APPROVED");
      setCounselors(approvedCounselors);

      try {
        const appointmentRes = await API.get("/hospital-admin/appointments", { params: { date } });
        const appointmentRaw = Array.isArray(appointmentRes.data) ? appointmentRes.data : appointmentRes.data?.data || [];
        setAppointments(appointmentRaw);
      } catch {
        setAppointments([
          { id: 1, counselor_id: approvedCounselors[0]?.id, patient_name: "Demo Patient",   date, time: "11:00", status: "confirmed" },
          { id: 2, counselor_id: approvedCounselors[0]?.id, patient_name: "Demo Patient 2", date, time: "14:00", status: "confirmed" },
        ]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  const cards = useMemo(() => {
    const activeToday = counselors.filter((c) => isCounselorWorkingToday(c)).length;
    const counselorViews = counselors.map((c) => buildCounselorSchedule(c, appointments, selectedDate));
    const fullyBooked = counselorViews.filter((c) => c.availableCount === 0 && c.totalSlots > 0 && c.isWorkingDay).length;
    const availableSlots = counselorViews.reduce((sum, c) => sum + c.availableCount, 0);
    return { totalCounselors: counselors.length, activeToday, fullyBooked, availableSlots, counselorViews };
  }, [counselors, appointments, selectedDate]);

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
              const active = item.exact ? window.location.pathname === item.to : window.location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]" : "text-white/95 hover:bg-white/10"}`}>
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{item.badge}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <button onClick={() => { logout(); nav("/admin/login", { replace: true }); }}
          className="text-xs font-semibold rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-left text-[#e2efe8] hover:text-white transition-all">
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
                Counselor Schedules
              </h1>
              <p className="mt-2 text-sm text-[#5f6d68]">
                Hospital: <span className="font-semibold text-[#1f4e43]">{hospitalName}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border border-[#e7e5de] bg-white text-[#1f4e43] text-sm outline-none focus:border-[#1f4e43] focus:ring-2 focus:ring-[#1f4e43]/10" />
              <button onClick={() => nav("/hospital-admin/dashboard")}
                className="px-5 py-2.5 bg-white border border-[#d7d9d0] rounded-2xl text-sm font-semibold text-[#27584d] hover:bg-[#f7f8f5] transition shadow-sm">
                ← Back
              </button>
              <button onClick={() => fetchData(selectedDate)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Total Counselors" value={cards.totalCounselors} hint="Approved counselors"      accent="sage"  />
          <SummaryCard title="Active Today"     value={cards.activeToday}     hint="Working on selected day"  accent="green" />
          <SummaryCard title="Fully Booked"     value={cards.fullyBooked}     hint="No free slots left"       accent="amber" />
          <SummaryCard title="Available Slots"  value={cards.availableSlots}  hint="Free slots remaining"     accent="teal"  />
        </section>

        {loading && (
          <div className="rounded-3xl border border-[#e7e5de] bg-white p-6 text-[#6a7772] text-sm">Loading schedules...</div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-3xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {cards.counselorViews.length === 0 ? (
              <div className="rounded-3xl border border-[#e7e5de] bg-white p-10 text-center text-[#6a7772]">
                No approved counselors found.
              </div>
            ) : (
              cards.counselorViews.map((counselor) => (
                <CounselorScheduleCard key={counselor.id} counselor={counselor} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Counselor Schedule Card ── */
function CounselorScheduleCard({ counselor }) {
  return (
    <div className="rounded-3xl border border-[#e7e5de] bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className="p-5 border-b border-[#f0ede6] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] flex items-center justify-center text-[#1f4e43] font-bold text-sm">
              {(counselor.name || "C").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-[#1f4e43]">{counselor.name || counselor.full_name || "Counselor"}</h2>
            <StatusPill status={counselor.statusLabel} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#d5e8e4] text-[#1f4e43]">
              Specialty: {counselor.specialization || counselor.specialty || "—"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#d5e8e4] text-[#1f4e43]">
              Hours: {counselor.startTimeLabel} - {counselor.endTimeLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#d5e8e4] text-[#1f4e43]">
              Working Days: {counselor.workingDaysLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <MiniCount label="Total"  value={counselor.totalSlots}     tone="sage"  />
          <MiniCount label="Booked" value={counselor.bookedCount}    tone="red"   />
          <MiniCount label="Free"   value={counselor.availableCount} tone="green" />
        </div>
      </div>

      <div className="p-5">
        {!counselor.isWorkingDay ? (
          <div className="rounded-2xl bg-[#f8f6f0] border border-[#e7e5de] p-4 text-sm text-[#6a7772]">
            This counselor is unavailable on the selected day.
          </div>
        ) : counselor.slots.length === 0 ? (
          <div className="rounded-2xl bg-[#f8f6f0] border border-[#e7e5de] p-4 text-sm text-[#6a7772]">
            No slots generated for this counselor.
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-[#1f4e43] mb-3">Today's slots</p>
            <div className="flex flex-wrap gap-2">
              {counselor.slots.map((slot) => (
                <SlotBadge key={slot.time24} slot={slot} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Slot Badge ── */
function SlotBadge({ slot }) {
  const toneMap = {
    booked:      "bg-red-100 text-red-700 border-red-200",
    free:        "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
    unavailable: "bg-[#f8f6f0] text-[#8f9a95] border-[#e7e5de]",
  };
  return (
    <div className={`px-3 py-2 rounded-2xl border text-xs font-semibold ${toneMap[slot.type] || toneMap.unavailable}`}
      title={slot.patientName ? `Patient: ${slot.patientName}` : slot.label}>
      {slot.label}
    </div>
  );
}

/* ── Mini Count ── */
function MiniCount({ label, value, tone = "sage" }) {
  const toneMap = {
    sage:  "bg-[#f8f6f0] border-[#e7e5de] text-[#1f4e43]",
    green: "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]",
    red:   "bg-red-50 border-red-100 text-red-700",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 min-w-[88px] ${toneMap[tone]}`}>
      <p className="text-[11px] opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

/* ── Summary Card ── */
function SummaryCard({ title, value, hint, accent }) {
  const accentMap = {
    green: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
    teal:  "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    sage:  "bg-[#f8f6f0] text-[#1f4e43] border-[#e7e5de]",
  };
  const chip = accentMap[accent] || accentMap.sage;
  return (
    <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
      <p className="text-sm text-[#6a7772]">{title}</p>
      <div className="flex items-end justify-between mt-4">
        <h3 className="text-3xl font-bold text-[#1f4e43]">{value}</h3>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border ${chip}`}>Live</span>
      </div>
      <p className="text-sm text-[#6a7772] mt-2">{hint}</p>
    </div>
  );
}

/* ── Status Pill ── */
function StatusPill({ status }) {
  const toneMap = {
    ACTIVE:      "bg-[#f0fdf4] text-[#166534]",
    INACTIVE:    "bg-red-100 text-red-700",
    UNAVAILABLE: "bg-[#f8f6f0] text-[#6a7772]",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${toneMap[status] || "bg-[#f8f6f0] text-[#6a7772]"}`}>
      {status}
    </span>
  );
}

/* ── Helpers ── */
function buildCounselorSchedule(counselor, appointments, selectedDate) {
  const workingDays = normalizeWorkingDays(counselor);
  const selectedDayName = getDayShortName(selectedDate);
  const isWorkingDay = workingDays.includes(selectedDayName);
  const startTime = counselor.start_time || counselor.startTime || "10:00";
  const endTime = counselor.end_time || counselor.endTime || "16:00";
  const slots = isWorkingDay ? generateHourlySlots(startTime, endTime) : [];

  const counselorAppointments = appointments.filter((a) => {
    const appointmentDate = a.date || a.appointment_date || extractDateOnly(a.date_time);
    const appointmentCounselorId = a.counselor_id || a.counselor?.id;
    return String(appointmentCounselorId) === String(counselor.id) && appointmentDate === selectedDate;
  });

  const mappedSlots = slots.map((time24) => {
    const found = counselorAppointments.find((a) => normalizeTime(a.time || a.appointment_time || extractTimeOnly(a.date_time)) === time24);
    if (found) return { time24, label: `${formatTime12(time24)} Booked`, type: "booked", patientName: found.patient_name || found.user_name || "Patient" };
    return { time24, label: `${formatTime12(time24)} Free`, type: "free", patientName: null };
  });

  const bookedCount = mappedSlots.filter((s) => s.type === "booked").length;
  const availableCount = mappedSlots.filter((s) => s.type === "free").length;

  return {
    ...counselor,
    workingDaysLabel: workingDays.join(", "),
    startTimeLabel: formatTime12(startTime),
    endTimeLabel: formatTime12(endTime),
    isWorkingDay,
    slots: mappedSlots,
    bookedCount,
    availableCount,
    totalSlots: mappedSlots.length,
    statusLabel: isWorkingDay ? "ACTIVE" : "UNAVAILABLE",
  };
}

function normalizeWorkingDays(counselor) {
  const raw = counselor.workingDays || counselor.working_days || counselor.days || ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return raw.split(",").map((d) => d.trim().slice(0, 3)).filter(Boolean);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
}

function isCounselorWorkingToday(counselor) {
  const today = getTodayDate();
  const dayName = getDayShortName(today);
  return normalizeWorkingDays(counselor).includes(dayName);
}

function generateHourlySlots(start, end) {
  const result = [];
  let current = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  while (current < endMinutes) { result.push(minutesToTime(current)); current += 60; }
  return result;
}

function timeToMinutes(time) {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTime12(time24) {
  if (!time24) return "—";
  const [hourRaw, minuteRaw] = String(time24).split(":");
  let hour = Number(hourRaw);
  const minute = minuteRaw || "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

function normalizeTime(value) {
  if (!value) return "";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
  const d = new Date(`1970-01-01T${value}`);
  if (!Number.isNaN(d.getTime())) return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return String(value).slice(0, 5);
}

function extractDateOnly(dateTime) {
  if (!dateTime) return "";
  if (String(dateTime).includes("T")) return String(dateTime).split("T")[0];
  if (String(dateTime).includes(" ")) return String(dateTime).split(" ")[0];
  return String(dateTime).slice(0, 10);
}

function extractTimeOnly(dateTime) {
  if (!dateTime) return "";
  if (String(dateTime).includes("T")) return String(dateTime).split("T")[1]?.slice(0, 5) || "";
  if (String(dateTime).includes(" ")) return String(dateTime).split(" ")[1]?.slice(0, 5) || "";
  return "";
}

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayShortName(dateString) {
  const d = new Date(`${dateString}T00:00:00`);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}