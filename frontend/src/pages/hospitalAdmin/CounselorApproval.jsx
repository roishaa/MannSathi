import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import { getAdminInfo, logout } from "../../utils/adminAuth";

export default function CounselorApproval() {
  const nav = useNavigate();
  const admin = useMemo(() => getAdminInfo(), []);
  const hospitalName = admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const [viewCounselor, setViewCounselor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState("all");

  const navItems = [
    { to: "/hospital-admin/dashboard", label: "Dashboard", icon: "🏠", exact: true },
    { to: "/hospital-admin/counselors", label: "Counselor Approval", icon: "🧑‍⚕️", badge: "Core" },
    { to: "/hospital-admin/appointments", label: "Appointments", icon: "📅" },
    { to: "/hospital-admin/payment-history", label: "Payment History", icon: "💳" },
    { to: "/hospital-admin/schedules", label: "Schedules", icon: "🕐" },
    { to: "/hospital-admin/session-history", label: "Session History", icon: "📋" },
  ];

  const { pathname } = window.location;

  const fetchCounselors = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await API.get("/hospital-admin/counselors");
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const normalized = raw.map((r) => ({
        ...r,
        status: (r.status || r.approval_status || "").toUpperCase(),
      }));
      setRows(normalized);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load counselors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCounselors(); }, []);

  const approve = async (id) => {
    try {
      await API.put(`/hospital-admin/counselors/${id}/approve`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)));
    } catch (e) {
      alert(e?.response?.data?.message || "Approve failed");
    }
  };

  const reject = async (id) => {
    try {
      await API.put(`/hospital-admin/counselors/${id}/reject`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));
    } catch (e) {
      alert(e?.response?.data?.message || "Reject failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/hospital-admin/counselors/${deleteTarget.id}`);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const pending  = rows.filter((r) => r.status === "PENDING");
  const approved = rows.filter((r) => r.status === "APPROVED");
  const rejected = rows.filter((r) => r.status === "REJECTED");

  const filtered = useMemo(() => {
    let list = tabFilter === "pending"  ? pending
             : tabFilter === "approved" ? approved
             : tabFilter === "rejected" ? rejected
             : rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        [c.name, c.full_name, c.email, c.specialization, c.specialty, c.license_no, c.license]
          .some((v) => String(v || "").toLowerCase().includes(q))
      );
    }
    return list;
  }, [rows, tabFilter, search]);

  const TABS = [
    { key: "all",      label: "All",      count: rows.length },
    { key: "pending",  label: "Pending",  count: pending.length },
    { key: "approved", label: "Approved", count: approved.length },
    { key: "rejected", label: "Rejected", count: rejected.length },
  ];

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
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">Hospital Admin Panel</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Counselor Approval
              </h1>
              <p className="mt-2 text-sm text-[#5f6d68]">
                Hospital: <span className="font-semibold text-[#1f4e43]">{hospitalName}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => nav("/hospital-admin/dashboard")}
                className="px-5 py-2.5 bg-white border border-[#d7d9d0] rounded-2xl text-sm font-semibold text-[#27584d] hover:bg-[#f7f8f5] transition shadow-sm"
              >
                ← Back
              </button>
              <button
                onClick={fetchCounselors}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Pending"  value={pending.length}  hint="Awaiting review"   accent="amber" />
          <SummaryCard title="Approved" value={approved.length} hint="Active in hospital" accent="green" />
          <SummaryCard title="Rejected" value={rejected.length} hint="Declined requests"  accent="red"   />
          <SummaryCard title="Total"    value={rows.length}     hint="All submissions"    accent="sage"  />
        </section>

        {/* Loading / Error */}
        {loading && (
          <div className="rounded-3xl border border-[#e7e5de] bg-white p-6 text-[#6a7772] text-sm">
            Loading counselors...
          </div>
        )}
        {!loading && error && (
          <div className="p-4 rounded-3xl bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Main List */}
        {!loading && !error && (
          <div className="rounded-3xl border border-[#e7e5de] bg-white overflow-hidden shadow-sm">

            {/* Tab bar + search */}
            <div className="p-5 border-b border-[#f0ede6] flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex gap-1 bg-[#f8f6f0] rounded-2xl p-1 flex-wrap">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTabFilter(t.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      tabFilter === t.key
                        ? "bg-white text-[#1f4e43] shadow-sm"
                        : "text-[#6a7772] hover:text-[#1f4e43]"
                    }`}
                  >
                    {t.label}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      tabFilter === t.key ? "bg-[#f0fdf4] text-[#166534]" : "bg-[#e7e5de] text-[#6a7772]"
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex-1 md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search name, email, specialty…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] text-sm outline-none focus:border-[#1f4e43] focus:ring-2 focus:ring-[#1f4e43]/10"
                />
              </div>

              <span className="text-xs text-[#8f9a95] whitespace-nowrap">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="p-12 text-[#8f9a95] text-sm text-center">
                <div className="text-4xl mb-3">🔍</div>
                No counselors match the current filter.
              </div>
            ) : (
              <div className="divide-y divide-[#f8f6f0]">
                {filtered.map((c) => (
                  <CounselorRow
                    key={c.id}
                    counselor={c}
                    onApprove={approve}
                    onReject={reject}
                    onView={() => setViewCounselor(c)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {viewCounselor && <DetailModal counselor={viewCounselor} onClose={() => setViewCounselor(null)} />}
      {deleteTarget && (
        <DeleteModal
          counselor={deleteTarget}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ── Counselor Row ── */
function CounselorRow({ counselor: c, onApprove, onReject, onView, onDelete }) {
  const isPending = c.status === "PENDING";

  return (
    <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-[#f8f6f0] transition-colors">
      <div className="flex items-start gap-4 min-w-0">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] shadow-sm shrink-0 flex items-center justify-center text-[#1f4e43] font-bold text-sm">
          {(c.name || c.full_name || "C").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-[#1f4e43] truncate">{c.name || c.full_name || "Counselor"}</p>
            <StatusPill status={c.status} />
          </div>
          <p className="text-xs text-[#6a7772] mt-0.5">{c.email || "—"}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Chip>{c.specialization || c.specialty || "No specialty"}</Chip>
            <Chip>License: {c.license_no || c.license || "—"}</Chip>
            {c.phone && <Chip>📞 {c.phone}</Chip>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button onClick={onView} className="px-4 py-2 rounded-2xl border border-[#d5e8e4] bg-[#f0fdf4] text-[#1f4e43] hover:bg-[#d5e8e4] text-sm font-semibold transition-all">
          View Details
        </button>
        {isPending && (
          <>
            <button onClick={() => onReject(c.id)} className="px-4 py-2 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#6a7772] hover:bg-[#e7e5de] text-sm font-semibold transition-all">
              Reject
            </button>
            <button onClick={() => onApprove(c.id)} className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white hover:shadow-md text-sm font-semibold transition-all">
              Approve
            </button>
          </>
        )}
        <button onClick={onDelete} className="px-4 py-2 rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold transition-all">
          Delete
        </button>
      </div>
    </div>
  );
}

/* ── Detail Modal ── */
function DetailModal({ counselor: c, onClose }) {
  const fields = [
    ["Full Name",       c.name || c.full_name],
    ["Email",          c.email],
    ["Phone",          c.phone || c.contact || "—"],
    ["Specialization", c.specialization || c.specialty || "—"],
    ["License No.",    c.license_no || c.license || "—"],
    ["Experience",     c.experience ? `${c.experience} years` : "—"],
    ["Qualification",  c.qualification || c.degree || "—"],
    ["Working Days",   Array.isArray(c.working_days) ? c.working_days.join(", ") : c.working_days || "—"],
    ["Working Hours",  (c.start_time && c.end_time) ? `${c.start_time} – ${c.end_time}` : "—"],
    ["Address",        c.address || "—"],
    ["Joined",         c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"],
    ["Status",         c.status],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1f4e43]/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e7e5de] w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-[#f0ede6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] flex items-center justify-center text-[#1f4e43] font-bold text-lg shadow-sm">
              {(c.name || c.full_name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1f4e43]">{c.name || c.full_name || "Counselor"}</h2>
              <p className="text-xs text-[#6a7772]">{c.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full border border-[#e7e5de] bg-[#f8f6f0] flex items-center justify-center text-[#6a7772] hover:bg-[#e7e5de] transition">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-2 flex-1">
          <StatusPill status={c.status} />
          <div className="mt-4 divide-y divide-[#f8f6f0]">
            {fields.map(([label, value]) => (
              <div key={label} className="flex gap-4 py-3">
                <dt className="text-xs text-[#8f9a95] w-32 shrink-0 pt-0.5">{label}</dt>
                <dd className="text-sm text-[#1f4e43] font-medium break-words min-w-0">
                  {label === "Status" ? <StatusPill status={value} /> : (value || "—")}
                </dd>
              </div>
            ))}
          </div>

          {c.bio && (
            <div className="mt-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-4">
              <p className="text-xs font-semibold text-[#166534] uppercase tracking-wide mb-2">Bio</p>
              <p className="text-sm text-[#1f4e43] leading-relaxed">{c.bio}</p>
            </div>
          )}

          {c.document_url && (
            <div className="mt-3">
              <a href={c.document_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#d5e8e4] bg-[#f0fdf4] text-[#1f4e43] text-sm font-semibold hover:bg-[#d5e8e4] transition">
                📄 View License Document
              </a>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#f0ede6] flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] text-sm font-semibold hover:bg-[#e7e5de] transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Modal ── */
function DeleteModal({ counselor: c, loading, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1f4e43]/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e7e5de] w-full max-w-md">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl font-bold shrink-0">!</div>
            <div>
              <h2 className="text-lg font-bold text-[#1f4e43]">Delete Counselor</h2>
              <p className="text-sm text-[#6a7772] mt-0.5">This action cannot be undone.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f8f6f0] border border-[#e7e5de] px-4 py-3 mb-6">
            <p className="text-sm text-[#5f6d68]">
              You are about to permanently delete{" "}
              <span className="font-semibold text-[#1f4e43]">{c.name || c.full_name || "this counselor"}</span>
              {c.email && <span className="text-[#6a7772]"> ({c.email})</span>}. All their data will be removed.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} disabled={loading}
              className="px-5 py-2.5 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] text-sm font-semibold hover:bg-[#e7e5de] transition disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Components ── */
function Chip({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#d5e8e4] text-[#1f4e43] text-xs">{children}</span>
  );
}

function SummaryCard({ title, value, hint, accent }) {
  const accentMap = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
    red:   "bg-red-50 text-red-700 border-red-200",
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

function StatusPill({ status }) {
  const toneMap = {
    PENDING:  "bg-amber-100 text-amber-700",
    APPROVED: "bg-[#f0fdf4] text-[#166534]",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${toneMap[status] || "bg-[#f8f6f0] text-[#6a7772]"}`}>
      {status || "—"}
    </span>
  );
}