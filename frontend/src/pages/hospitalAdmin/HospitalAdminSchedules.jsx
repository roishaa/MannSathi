// src/pages/hospital-admin/HospitalAdminSchedules.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import { getAdminInfo } from "../../utils/adminAuth";

export default function HospitalAdminSchedules() {
  const nav = useNavigate();
  const admin = useMemo(() => getAdminInfo(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [counselors, setCounselors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const fetchData = async (date) => {
    setLoading(true);
    setError("");

    try {
      const counselorRes = await API.get("/hospital-admin/counselors");
      const counselorRaw = Array.isArray(counselorRes.data)
        ? counselorRes.data
        : counselorRes.data?.data || [];

      const approvedCounselors = counselorRaw
        .map((c) => ({
          ...c,
          status: String(c.status || c.approval_status || "").toUpperCase(),
        }))
        .filter((c) => c.status === "APPROVED");

      setCounselors(approvedCounselors);

      try {
        const appointmentRes = await API.get("/hospital-admin/appointments", {
          params: { date },
        });

        const appointmentRaw = Array.isArray(appointmentRes.data)
          ? appointmentRes.data
          : appointmentRes.data?.data || [];

        setAppointments(appointmentRaw);
      } catch {
        // fallback if backend appointments endpoint is not ready yet
        setAppointments([
          {
            id: 1,
            counselor_id: approvedCounselors[0]?.id,
            patient_name: "Demo Patient",
            date,
            time: "11:00",
            status: "confirmed",
          },
          {
            id: 2,
            counselor_id: approvedCounselors[0]?.id,
            patient_name: "Demo Patient 2",
            date,
            time: "14:00",
            status: "confirmed",
          },
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

    const fullyBooked = counselorViews.filter(
      (c) => c.availableCount === 0 && c.totalSlots > 0 && c.isWorkingDay
    ).length;

    const availableSlots = counselorViews.reduce((sum, c) => sum + c.availableCount, 0);

    return {
      totalCounselors: counselors.length,
      activeToday,
      fullyBooked,
      availableSlots,
      counselorViews,
    };
  }, [counselors, appointments, selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/50 text-slate-800">
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute top-40 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-slate-200/30 blur-3xl" />

        <div className="relative z-10 p-4 md:p-8 space-y-6">
          <div className="w-full rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-4 md:p-6 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Hospital Admin Panel
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900">
                  Counselor Schedules
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  Hospital:{" "}
                  <span className="font-semibold text-slate-700">
                    {admin?.hospital_name || "MannSathi General Hospital"}
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  onClick={() => nav("/hospital-admin/dashboard")}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-50 hover:shadow-md text-sm font-semibold transition-all duration-200"
                >
                  Back
                </button>

                <button
                  onClick={() => fetchData(selectedDate)}
                  className="px-4 py-2.5 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md text-sm font-semibold transition-all duration-200"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Counselors"
              value={cards.totalCounselors}
              hint="Approved counselors"
              accent="ink"
            />
            <SummaryCard
              title="Active Today"
              value={cards.activeToday}
              hint="Working on selected day"
              accent="teal"
            />
            <SummaryCard
              title="Fully Booked"
              value={cards.fullyBooked}
              hint="No free slots left"
              accent="amber"
            />
            <SummaryCard
              title="Available Slots"
              value={cards.availableSlots}
              hint="Free slots remaining"
              accent="teal"
            />
          </section>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-500 text-sm">
              Loading schedules...
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {cards.counselorViews.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                  No approved counselors found.
                </div>
              ) : (
                cards.counselorViews.map((counselor) => (
                  <CounselorScheduleCard key={counselor.id} counselor={counselor} />
                ))
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg text-slate-900">Next step after this</h2>
                <p className="text-sm text-slate-500 mt-1">
                  After schedules page, build full Appointments page and then Reports.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/hospital-admin/counselors"
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all duration-200"
                >
                  Counselor Approval
                </Link>

                <Link
                  to="/hospital-admin/appointments"
                  className="px-4 py-2.5 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 text-sm font-semibold transition-all duration-200"
                >
                  Appointments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CounselorScheduleCard({ counselor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {counselor.name || counselor.full_name || "Counselor"}
            </h2>
            <StatusPill status={counselor.statusLabel} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              Specialty: {counselor.specialization || counselor.specialty || "—"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              Hours: {counselor.startTimeLabel} - {counselor.endTimeLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              Working Days: {counselor.workingDaysLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <MiniCount label="Total" value={counselor.totalSlots} />
          <MiniCount label="Booked" value={counselor.bookedCount} tone="red" />
          <MiniCount label="Free" value={counselor.availableCount} tone="green" />
        </div>
      </div>

      <div className="p-5">
        {!counselor.isWorkingDay ? (
          <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 text-sm text-slate-600">
            This counselor is unavailable on the selected day.
          </div>
        ) : counselor.slots.length === 0 ? (
          <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 text-sm text-slate-600">
            No slots generated for this counselor.
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-700 mb-3">Today’s slots</p>
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

function SlotBadge({ slot }) {
  const toneMap = {
    booked: "bg-red-100 text-red-700 border-red-200",
    free: "bg-emerald-100 text-emerald-700 border-emerald-200",
    unavailable: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <div
      className={`px-3 py-2 rounded-2xl border text-xs font-semibold ${toneMap[slot.type] || toneMap.unavailable}`}
      title={slot.patientName ? `Patient: ${slot.patientName}` : slot.label}
    >
      {slot.label}
    </div>
  );
}

function MiniCount({ label, value, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
    red: "bg-red-50 border-red-100 text-red-700",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 min-w-[88px] ${toneMap[tone]}`}>
      <p className="text-[11px]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function SummaryCard({ title, value, hint, accent }) {
  const accentMap = {
    amber: {
      chip: "bg-amber-100 text-amber-600 border-amber-200",
      icon: "bg-slate-100",
    },
    teal: {
      chip: "bg-emerald-100 text-emerald-600 border-emerald-200",
      icon: "bg-slate-100",
    },
    ink: {
      chip: "bg-slate-200 text-slate-600 border-slate-200",
      icon: "bg-slate-100",
    },
  };

  const accentClass = accentMap[accent] || accentMap.ink;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className={`h-9 w-9 rounded-xl ${accentClass.icon} shadow-sm`} />
      </div>

      <div className="flex items-end justify-between mt-4">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border ${accentClass.chip}`}>
          Live
        </span>
      </div>

      <p className="text-sm text-slate-500 mt-2">{hint}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const toneMap = {
    ACTIVE: "bg-emerald-100 text-emerald-600",
    INACTIVE: "bg-red-100 text-red-600",
    UNAVAILABLE: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${toneMap[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

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

    if (found) {
      return {
        time24,
        label: `${formatTime12(time24)} Booked`,
        type: "booked",
        patientName: found.patient_name || found.user_name || "Patient",
      };
    }

    return {
      time24,
      label: `${formatTime12(time24)} Free`,
      type: "free",
      patientName: null,
    };
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
  const raw =
    counselor.workingDays ||
    counselor.working_days ||
    counselor.days ||
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  if (Array.isArray(raw)) return raw;

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((d) => d.trim().slice(0, 3))
      .filter(Boolean);
  }

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

  while (current < endMinutes) {
    result.push(minutesToTime(current));
    current += 60;
  }

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
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayShortName(dateString) {
  const d = new Date(`${dateString}T00:00:00`);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()];
}