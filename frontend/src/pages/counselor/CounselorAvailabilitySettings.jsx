import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const DAYS = [
  { label: "Sunday",    short: "Sun", value: 0 },
  { label: "Monday",    short: "Mon", value: 1 },
  { label: "Tuesday",   short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday",  short: "Thu", value: 4 },
  { label: "Friday",    short: "Fri", value: 5 },
  { label: "Saturday",  short: "Sat", value: 6 },
];

const DEFAULT_SCHEDULE = DAYS.map((d) => ({
  day_of_week:  d.value,
  is_available: d.value >= 1 && d.value <= 5, // Mon–Fri on by default
  start_time:   "09:00",
  end_time:     "17:00",
}));

export default function CounselorAvailabilitySettings() {
  const [schedule, setSchedule]             = useState(DEFAULT_SCHEDULE);
  const [blockedDates, setBlockedDates]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [saveMsg, setSaveMsg]               = useState("");
  const [saveError, setSaveError]           = useState("");

  // Block date form
  const [blockDate, setBlockDate]           = useState("");
  const [blockReason, setBlockReason]       = useState("");
  const [blocking, setBlocking]             = useState(false);
  const [blockError, setBlockError]         = useState("");

  // Load existing schedule
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/counselor/availability");
        if (data.schedule?.length === 7) {
          setSchedule(data.schedule.map((d) => ({
            day_of_week:  d.day_of_week,
            is_available: Boolean(d.is_available),
            start_time:   d.start_time?.slice(0, 5) || "09:00",
            end_time:     d.end_time?.slice(0, 5)   || "17:00",
          })));
        }
        setBlockedDates(data.blocked_dates || []);
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleDay = (dayValue) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.day_of_week === dayValue ? { ...d, is_available: !d.is_available } : d
      )
    );
  };

  const updateTime = (dayValue, field, value) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.day_of_week === dayValue ? { ...d, [field]: value } : d
      )
    );
  };

  const saveSchedule = async () => {
    setSaving(true);
    setSaveMsg("");
    setSaveError("");
    try {
      await api.post("/counselor/availability", { schedule });
      setSaveMsg("Availability saved successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async () => {
    if (!blockDate) return;
    setBlocking(true);
    setBlockError("");
    try {
      await api.post("/counselor/blocked-dates", { date: blockDate, reason: blockReason });
      setBlockedDates((prev) => [...prev, { id: Date.now(), blocked_date: blockDate, reason: blockReason }]);
      setBlockDate("");
      setBlockReason("");
    } catch (err) {
      setBlockError(err?.response?.data?.message || "Failed to block date.");
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (id) => {
    try {
      await api.delete(`/counselor/blocked-dates/${id}`);
      setBlockedDates((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to unblock date.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-[3px] border-[#1f4e43] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Weekly Schedule ── */}
      <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="text-sm font-bold text-[#1f4e43]">Weekly Schedule</div>
            <div className="text-xs text-[#6b7280] mt-1">Toggle days on/off and set your working hours</div>
          </div>
          <button
            onClick={saveSchedule}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md disabled:opacity-50"
          >
            {saving ? (
              <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
            ) : "Save Schedule"}
          </button>
        </div>

        {saveMsg && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✅ {saveMsg}
          </div>
        )}
        {saveError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠️ {saveError}
          </div>
        )}

        <div className="space-y-3">
          {schedule.map((day) => {
            const dayMeta = DAYS.find((d) => d.value === day.day_of_week);
            return (
              <div
                key={day.day_of_week}
                className={`rounded-2xl border p-4 transition ${
                  day.is_available
                    ? "border-[#c9e2cf] bg-[#f4fbf6]"
                    : "border-[#e7e5de] bg-[#f9f9f8] opacity-70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Toggle + day name */}
                  <div className="flex items-center gap-3 sm:w-36">
                    <button
                      onClick={() => toggleDay(day.day_of_week)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                        day.is_available ? "bg-[#1f4e43]" : "bg-[#d1d5db]"
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        day.is_available ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                    <span className={`text-sm font-semibold ${day.is_available ? "text-[#1f4e43]" : "text-[#9ca3af]"}`}>
                      {dayMeta?.label}
                    </span>
                  </div>

                  {/* Time pickers */}
                  {day.is_available ? (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[#6b7280]">From</label>
                        <input
                          type="time"
                          value={day.start_time}
                          onChange={(e) => updateTime(day.day_of_week, "start_time", e.target.value)}
                          className="rounded-xl border border-[#e7e5de] bg-white px-3 py-1.5 text-sm text-[#1c2522] outline-none focus:ring-2 focus:ring-[#1f4e43]/20"
                        />
                      </div>
                      <span className="text-[#9ca3af] text-xs">—</span>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[#6b7280]">To</label>
                        <input
                          type="time"
                          value={day.end_time}
                          onChange={(e) => updateTime(day.day_of_week, "end_time", e.target.value)}
                          className="rounded-xl border border-[#e7e5de] bg-white px-3 py-1.5 text-sm text-[#1c2522] outline-none focus:ring-2 focus:ring-[#1f4e43]/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-[#9ca3af] italic">Day off</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Blocked Dates ── */}
      <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6">
        <div className="text-sm font-bold text-[#1f4e43] mb-1">Block Specific Dates</div>
        <div className="text-xs text-[#6b7280] mb-5">Mark vacation days, sick days, or any day you won't be available</div>

        {/* Add block form */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="date"
            value={blockDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setBlockDate(e.target.value)}
            className="rounded-2xl border border-[#e7e5de] bg-[#f9faf8] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1f4e43]/20"
          />
          <input
            type="text"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Reason (optional) — Vacation, Sick day..."
            className="flex-1 rounded-2xl border border-[#e7e5de] bg-[#f9faf8] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1f4e43]/20"
          />
          <button
            onClick={handleBlockDate}
            disabled={!blockDate || blocking}
            className="px-5 py-2.5 rounded-2xl border border-[#89ad8f] bg-[#e3f3e6] text-sm font-semibold text-[#305b39] shadow-[0_3px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#89ad8f] transition disabled:opacity-50"
          >
            {blocking ? "Blocking..." : "Block Date"}
          </button>
        </div>

        {blockError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{blockError}</div>
        )}

        {/* Blocked dates list */}
        {blockedDates.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-[#d6dbd2] bg-[#fbfcfa]">
            <div className="text-2xl mb-2">🗓️</div>
            <p className="text-sm text-[#6b7280]">No dates blocked yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedDates.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#fde8e8] bg-[#fff5f5] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🚫</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1c2522]">{formatDate(b.blocked_date)}</p>
                    {b.reason && <p className="text-xs text-[#6b7280] mt-0.5">{b.reason}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(b.id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-xl hover:bg-red-50 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}