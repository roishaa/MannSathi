import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  completed: "bg-sky-100 text-sky-700 border border-sky-200",
  cancelled: "bg-rose-100 text-rose-700 border border-rose-200",
};

const AppointmentsPreview = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
      return str.slice(0, 5);
    }

    const d = new Date(str);
    if (!isValidDate(d)) return null;

    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const buildLocalDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const [year, month, day] = String(dateStr).split("-").map(Number);
    const [hour, minute] = String(timeStr).slice(0, 5).split(":").map(Number);

    if (
      !year ||
      !month ||
      !day ||
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return null;
    }

    const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
    return isValidDate(dt) ? dt : null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";

    const [year, month, day] = String(dateStr).split("-").map(Number);
    const d = new Date(year, month - 1, day);

    if (!isValidDate(d)) return dateStr;

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

    const localStart = buildLocalDateTime(normalizedDate, normalizedTime);

    return {
      ...item,
      normalizedDate,
      normalizedTime,
      localStart,
    };
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/hospital-admin/appointments");
      const raw = res.data.appointments || [];
      const normalized = raw.map(normalizeAppointment);
      setAppointments(normalized);
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
    return [...appointments].sort(
      (a, b) => (b.localStart?.getTime() || 0) - (a.localStart?.getTime() || 0)
    );
  }, [appointments]);

  const todaysAppointments = useMemo(() => {
    return appointments.filter((a) => a.normalizedDate === today);
  }, [appointments, today]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        if (!a.localStart) return false;
        return a.localStart >= now && a.status !== "cancelled";
      })
      .sort((a, b) => (a.localStart?.getTime() || 0) - (b.localStart?.getTime() || 0));
  }, [appointments, now]);

  const pastAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        if (!a.localStart) return false;
        return a.localStart < now;
      })
      .sort((a, b) => (b.localStart?.getTime() || 0) - (a.localStart?.getTime() || 0));
  }, [appointments, now]);

  const confirmedAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === "confirmed");
  }, [appointments]);

  const upcomingPreview = useMemo(() => {
    return upcomingAppointments.slice(0, 3);
  }, [upcomingAppointments]);

  const pastPreview = useMemo(() => {
    return pastAppointments.slice(0, 6);
  }, [pastAppointments]);

  const getStatusClass = (status) =>
    statusStyles[status] ||
    "bg-slate-100 text-slate-700 border border-slate-200";

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
                  Appointments Overview
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  Monitor upcoming appointments and review past session records.
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href="/hospital-admin/appointments"
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all duration-200"
                >
                  View All
                </a>

                <button
                  onClick={() => navigate("/hospital-admin/dashboard")}
                  className="px-4 py-2.5 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 text-sm font-semibold transition-all duration-200"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              title="Today’s Appointments"
              value={todaysAppointments.length}
              hint="Today"
            />
            <Card
              title="Upcoming Appointments"
              value={upcomingAppointments.length}
              hint="Future"
            />
            <Card
              title="Past Appointments"
              value={pastAppointments.length}
              hint="History"
            />
            <Card
              title="Confirmed Sessions"
              value={confirmedAppointments.length}
              hint="Active"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Upcoming Appointments
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Future booked appointments that have not happened yet
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500 mt-4">Loading...</p>
            ) : upcomingPreview.length === 0 ? (
              <div className="mt-4 p-4 rounded-2xl bg-slate-100 text-sm text-slate-600">
                No upcoming appointments found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                {upcomingPreview.map((appt) => (
                  <div
                    key={appt.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {appt.user?.name || appt.name || "Unknown Patient"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {appt.counselor?.name || "Unknown Counselor"}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                          appt.status
                        )}`}
                      >
                        {appt.status || "unknown"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white px-3 py-3 border border-slate-200">
                        <p className="text-xs text-slate-400">Date</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {formatDate(appt.normalizedDate)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white px-3 py-3 border border-slate-200">
                        <p className="text-xs text-slate-400">Time</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {formatTime(appt.normalizedTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-lg text-slate-900">
                Recent Appointments
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Latest appointment records from the system
              </p>
            </div>

            {loading ? (
              <p className="p-5 text-sm text-slate-500">Loading...</p>
            ) : sortedAppointments.length === 0 ? (
              <div className="p-5">
                <div className="p-4 rounded-2xl bg-slate-100 text-sm text-slate-600">
                  No appointments found.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4 text-left font-medium">Patient</th>
                      <th className="p-4 text-left font-medium">Counselor</th>
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Time</th>
                      <th className="p-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedAppointments.slice(0, 6).map((appt) => (
                      <tr key={appt.id} className="border-t border-slate-100">
                        <td className="p-4 text-slate-900 font-medium">
                          {appt.user?.name || appt.name || "Unknown Patient"}
                        </td>
                        <td className="p-4 text-slate-700">
                          {appt.counselor?.name || "Unknown Counselor"}
                        </td>
                        <td className="p-4 text-slate-700">
                          {formatDate(appt.normalizedDate)}
                        </td>
                        <td className="p-4 text-slate-700">
                          {formatTime(appt.normalizedTime)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                              appt.status
                            )}`}
                          >
                            {appt.status || "unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Past Appointments
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Previous appointments already completed or passed
              </p>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500 mt-4">Loading...</p>
            ) : pastPreview.length === 0 ? (
              <div className="mt-4 p-4 rounded-2xl bg-slate-100 text-sm text-slate-600">
                No past appointments found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                {pastPreview.map((appt) => (
                  <div
                    key={`past-${appt.id}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {appt.user?.name || appt.name || "Unknown Patient"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {appt.counselor?.name || "Unknown Counselor"}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                          appt.status
                        )}`}
                      >
                        {appt.status || "unknown"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white px-3 py-3 border border-slate-200">
                        <p className="text-xs text-slate-400">Date</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {formatDate(appt.normalizedDate)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white px-3 py-3 border border-slate-200">
                        <p className="text-xs text-slate-400">Time</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {formatTime(appt.normalizedTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function Card({ title, value, hint }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="flex justify-between items-end mt-4">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
          {hint}
        </span>
      </div>
    </div>
  );
}

export default AppointmentsPreview;