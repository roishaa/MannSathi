import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sessions() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const sessions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sessions")) || [];
    } catch {
      return [];
    }
  }, []);

  const statusKey = (status = "") => status.toLowerCase().replace(/\s+/g, "_");

  const badgeClass = (status) => {
    const s = statusKey(status);
    const base = "text-[11px] rounded-full px-3 py-1 border font-semibold";
    if (s.includes("scheduled")) return `${base} bg-yellow-50 border-yellow-200 text-yellow-700`;
    if (s.includes("pending")) return `${base} bg-red-50 border-red-200 text-red-700`;
    if (s.includes("completed")) return `${base} bg-green-50 border-green-200 text-green-700`;
    if (s.includes("cancel")) return `${base} bg-gray-50 border-gray-200 text-gray-700`;
    return `${base} bg-[#f9fafb] border-[#e5e7eb] text-[#374151]`;
  };

  const filtered = sessions
    .filter((s) => {
      if (filter === "all") return true;
      return statusKey(s.status).includes(filter);
    })
    .filter((s) => {
      const hay = `${s.id} ${s.counselor} ${s.type} ${s.status} ${s.date} ${s.time}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

  const counts = useMemo(() => {
    const all = sessions.length;
    const scheduled = sessions.filter((s) => statusKey(s.status).includes("scheduled")).length;
    const pending = sessions.filter((s) => statusKey(s.status).includes("pending")).length;
    const completed = sessions.filter((s) => statusKey(s.status).includes("completed")).length;
    return { all, scheduled, pending, completed };
  }, [sessions]);

  const goChat = (session) => {
    // optional: make chat page able to read this easily
    localStorage.setItem(
      "activeChat",
      JSON.stringify({ sessionId: session.id, counselor: session.counselor })
    );

    const params = new URLSearchParams({
      sessionId: String(session.id),
      counselor: String(session.counselor),
    }).toString();

    navigate(`/chat?${params}`);
  };

  const goDetails = (session) => {
    // If you don’t have details page yet, we can still route to sessions page with state later.
    // For now: simple alert or you can create /sessions/:id page later.
    alert(
      `Session Details:\n\nID: ${session.id}\nCounselor: ${session.counselor}\nDate: ${session.date}\nTime: ${session.time}\nType: ${session.type}\nStatus: ${session.status}`
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] px-5 md:px-10 py-8">
      {/* Top row */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="text-sm underline text-[#1f4e43]">
          ← Back to Dashboard
        </Link>

        <Link
          to="/users/BookAppointmentUser"
          className="text-xs rounded-full bg-[#1f4e43] text-white px-5 py-2.5 shadow-sm hover:opacity-95"
        >
          + Book Session
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#1e293b]">My Sessions</h1>
            <p className="text-sm text-[#6b7280]">
              Upcoming and past counseling sessions — with quick chat access.
            </p>

            {/* Stats chips */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1">
                All: <b>{counts.all}</b>
              </span>
              <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-yellow-700">
                Scheduled: <b>{counts.scheduled}</b>
              </span>
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                Pending: <b>{counts.pending}</b>
              </span>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
                Completed: <b>{counts.completed}</b>
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              className="w-full sm:w-72 rounded-2xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1f4e43]/20"
              placeholder="Search by counselor, status, date..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="rounded-2xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending Payment</option>
              <option value="completed">Completed</option>
              <option value="cancel">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table / Empty state */}
        <div className="mt-6 overflow-x-auto">
          {filtered.length ? (
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f4f6] text-[#374151]">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Counselor</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => {
                  const st = statusKey(s.status);
                  const isPending = st.includes("pending");
                  return (
                    <tr key={s.id} className="border-t hover:bg-[#fafafa] transition">
                      <td className="px-4 py-3 font-medium text-[#111827]">{s.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#111827]">{s.counselor}</div>
                        <div className="text-xs text-[#6b7280]">Tap chat to message counselor</div>
                      </td>
                      <td className="px-4 py-3">{s.date}</td>
                      <td className="px-4 py-3">{s.time}</td>
                      <td className="px-4 py-3">{s.type}</td>
                      <td className="px-4 py-3">
                        <span className={badgeClass(s.status)}>{s.status}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => goChat(s)}
                            className="text-xs rounded-full bg-[#1f4e43] text-white px-4 py-2 hover:opacity-95"
                          >
                            💬 Chat
                          </button>

                          <button
                            onClick={() => goDetails(s)}
                            className="text-xs rounded-full border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6] transition"
                          >
                            👁 Details
                          </button>

                          {isPending && (
                            <Link
                              to="/payments"
                              className="text-xs rounded-full border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 transition"
                            >
                              💳 Pay now
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="rounded-3xl border border-[#e5e7eb] bg-[#fafafa] p-8 text-center">
              <div className="text-3xl">📭</div>
              <p className="mt-2 text-sm text-[#6b7280]">
                No sessions found for your filter/search.
              </p>
              <Link
                to="/users/BookAppointmentUser"
                className="mt-4 inline-flex text-xs rounded-full bg-[#1f4e43] text-white px-5 py-2.5 hover:opacity-95"
              >
                Book your first session
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
