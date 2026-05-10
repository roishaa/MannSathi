import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { API } from "../../utils/api";
import { getAdminInfo, logout } from "../../utils/adminAuth";

const formatDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
};

const formatTime = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const StatusBadge = ({ status }) => {
  const map = {
    completed: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
    cancelled: "bg-red-100 text-red-600 border-red-200",
    canceled:  "bg-red-100 text-red-600 border-red-200",
    confirmed: "bg-teal-100 text-teal-700 border-teal-200",
    pending:   "bg-amber-100 text-amber-700 border-amber-200",
  };
  const cls = map[status?.toLowerCase()] || "bg-[#f8f6f0] text-[#6a7772] border-[#e7e5de]";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status || "Unknown"}
    </span>
  );
};

const NotesCell = ({ notes, updatedAt }) => {
  const [open, setOpen] = useState(false);
  if (!notes) return <span className="text-xs text-[#8f9a95] italic">No notes added</span>;
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)}
        className="text-xs text-[#1f4e43] font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">
        {open ? "Hide ▲" : "View notes ▼"}
      </button>
      {open && (
        <div className="mt-2 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3 text-sm text-[#166534] whitespace-pre-wrap max-w-xs">
          {notes}
          {updatedAt && <div className="text-[10px] text-emerald-500 mt-2">Updated: {formatDate(updatedAt)} {formatTime(updatedAt)}</div>}
        </div>
      )}
    </div>
  );
};

export default function SessionHistoryPage() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const admin = getAdminInfo();
  const hospitalName = admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const [sessions, setSessions] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const navItems = [
    { to: "/hospital-admin/dashboard",       label: "Dashboard",          icon: "🏠",  exact: true },
    { to: "/hospital-admin/counselors",      label: "Counselor Approval", icon: "🧑‍⚕️", badge: "Core" },
    { to: "/hospital-admin/appointments",    label: "Appointments",       icon: "📅" },
    { to: "/hospital-admin/payment-history", label: "Payment History",    icon: "💳" },
    { to: "/hospital-admin/schedules",       label: "Schedules",          icon: "🕐" },
    { to: "/hospital-admin/session-history", label: "Session History",    icon: "📋" },
  ];

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await API.get("/hospital-admin/counselors");
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setCounselors(raw.map((c) => ({ id: c.id, name: c.name || "Counselor" })));
      } catch { setCounselors([]); }
    };
    fetchCounselors();
  }, []);

  useEffect(() => { fetchSessions(); }, [page, selectedCounselor]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page, limit });
      if (selectedCounselor) params.append("counselor_id", selectedCounselor);
      const res = await API.get(`/session-history/admin?${params.toString()}`);
      const data = res.data;
      setSessions(data?.data || data?.sessions || []);
      setTotal(data?.total || data?.meta?.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load session history.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.patient_name?.toLowerCase().includes(q) ||
      s.counselor_name?.toLowerCase().includes(q) ||
      s.patient_email?.toLowerCase().includes(q) ||
      s.counselor_email?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">
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
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
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

      <main className="flex-1 px-4 md:px-8 py-8 space-y-6 bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)]">
        <div className="rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">MannSathi Hospital Panel</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">Session History</h1>
          <p className="text-sm text-[#5f6d68] mt-2">All completed sessions with counselor notes</p>
        </div>

        <div className="rounded-3xl border border-[#e7e5de] bg-white p-4 shadow-sm flex flex-wrap gap-3 items-center">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or counselor..."
            className="rounded-2xl border border-[#e7e5de] px-4 py-2.5 text-sm outline-none focus:border-[#1f4e43] focus:ring-2 focus:ring-[#1f4e43]/10 w-72 bg-[#f8f6f0] text-[#1f4e43]" />
          {counselors.length > 0 && (
            <select value={selectedCounselor} onChange={(e) => { setSelectedCounselor(e.target.value); setPage(1); }}
              className="rounded-2xl border border-[#e7e5de] px-4 py-2.5 text-sm outline-none focus:border-[#1f4e43] bg-[#f8f6f0] text-[#1f4e43]">
              <option value="">All Counselors</option>
              {counselors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <div className="ml-auto text-sm text-[#8f9a95]">{total} session{total !== 1 ? "s" : ""} found</div>
        </div>

        {error && <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="rounded-3xl border border-[#e7e5de] bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-[#6a7772]">Loading sessions...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-[#6a7772] text-sm">No sessions found.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0ede6] bg-[#f8f6f0]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6a7772] uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6a7772] uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6a7772] uppercase tracking-wider">Counselor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6a7772] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6a7772] uppercase tracking-wider">Session Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8f6f0]">
                  {filtered.map((s, idx) => (
                    <tr key={s.appointment_id || s.id || idx} className="hover:bg-[#f8f6f0] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-[#1f4e43]">{formatDate(s.date_time)}</div>
                        <div className="text-xs text-[#8f9a95]">{formatTime(s.date_time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#1f4e43]">{s.patient_name || s.user?.name || "—"}</div>
                        <div className="text-xs text-[#8f9a95]">{s.patient_email || s.user?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#1f4e43]">{s.counselor_name || s.counselor?.name || "—"}</div>
                        <div className="text-xs text-[#8f9a95]">{s.counselor_email || s.counselor?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                      <td className="px-6 py-4">
                        <NotesCell notes={s.counselor_note?.notes || s.notes} updatedAt={s.counselor_note?.updated_at || s.notes_updated_at} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#f0ede6] flex items-center justify-between">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-2xl border border-[#e7e5de] px-4 py-2 text-sm font-medium text-[#1f4e43] disabled:opacity-40 hover:bg-[#f8f6f0] transition-colors">
                ← Previous
              </button>
              <span className="text-sm text-[#8f9a95]">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-2xl border border-[#e7e5de] px-4 py-2 text-sm font-medium text-[#1f4e43] disabled:opacity-40 hover:bg-[#f8f6f0] transition-colors">
                Next →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}