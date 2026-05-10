// src/pages/hospital-admin/HospitalAdminPaymentHistory.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import { getAdminInfo, logout } from "../../utils/adminAuth";

function getMonthRange() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` };
}

function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const parts = String(timeStr).split(":");
  let h = Number(parts[0]);
  const m = parts[1] || "00";
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

const METHOD_ICONS = { esewa: "🟢", khalti: "🟣", cash: "💵", card: "💳", online: "🌐", default: "💰" };
const VALID_STATUSES = ["paid", "completed"];

export default function HospitalAdminPaymentHistory() {
  const nav = useNavigate();
  const admin = useMemo(() => getAdminInfo(), []);
  const hospitalName = admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const defaultRange = getMonthRange();
  const [dateFrom, setDateFrom]   = useState(defaultRange.from);
  const [dateTo, setDateTo]       = useState(defaultRange.to);
  const [search, setSearch]       = useState("");
  const [methodFilter, setMethod] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir]     = useState("desc");
  const [page, setPage]           = useState(1);
  const PAGE_SIZE = 10;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const navItems = [
    { to: "/hospital-admin/dashboard",      label: "Dashboard",          icon: "🏠",  exact: true },
    { to: "/hospital-admin/counselors",     label: "Counselor Approval", icon: "🧑‍⚕️", badge: "Core" },
    { to: "/hospital-admin/appointments",   label: "Appointments",       icon: "📅" },
    { to: "/hospital-admin/payment-history",label: "Payment History",    icon: "💳" },
    { to: "/hospital-admin/schedules",      label: "Schedules",          icon: "🕐" },
    { to: "/hospital-admin/session-history",label: "Session History",    icon: "📋" },
  ];

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/hospital-admin/payments", { params: { from: dateFrom, to: dateTo } });
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.payments || [];
      const successfulOnly = raw.filter((p) => VALID_STATUSES.includes(String(p.payment_status || p.status || "").toLowerCase()));
      setPayments(successfulOnly);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load payment data. Please try again.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [dateFrom, dateTo]);
  useEffect(() => { setPage(1); }, [search, methodFilter, sortField, sortDir]);

  const filtered = useMemo(() => {
    let list = [...payments];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        [p.patient_name, p.counselor_name, p.transaction_id, p.payment_method, p.id]
          .some((v) => String(v || "").toLowerCase().includes(q))
      );
    }
    if (methodFilter !== "all") {
      list = list.filter((p) => String(p.payment_method || p.method || "").toLowerCase() === methodFilter);
    }
    list.sort((a, b) => {
      let aVal, bVal;
      if (sortField === "amount") { aVal = Number(a.amount || 0); bVal = Number(b.amount || 0); }
      else if (sortField === "date") { aVal = new Date(a.payment_date || a.created_at || 0).getTime(); bVal = new Date(b.payment_date || b.created_at || 0).getTime(); }
      else { aVal = String(a[sortField] || "").toLowerCase(); bVal = String(b[sortField] || "").toLowerCase(); }
      return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return list;
  }, [payments, search, methodFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    const totalRevenue  = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const userPayments  = payments.filter((p) => p.type === "user");
    const guestPayments = payments.filter((p) => p.type === "guest");
    return { totalRevenue, totalCount: payments.length, userCount: userPayments.length, guestCount: guestPayments.length };
  }, [payments]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const allMethods = useMemo(() => {
    const set = new Set(payments.map((p) => String(p.payment_method || p.method || "").toLowerCase()).filter(Boolean));
    return [...set];
  }, [payments]);

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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]" : "text-white/95 hover:bg-white/10"}`}
                >
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
                Payment History
              </h1>
              <p className="mt-1 text-sm text-[#5f6d68]">
                Hospital: <span className="font-semibold text-[#1f4e43]">{hospitalName}</span>
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">✓ Confirmed payments only — Paid &amp; Completed</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#6a7772] shrink-0">From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl border border-[#e7e5de] bg-white text-[#1f4e43] text-sm outline-none focus:border-[#1f4e43] focus:ring-2 focus:ring-[#1f4e43]/10" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#6a7772] shrink-0">To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl border border-[#e7e5de] bg-white text-[#1f4e43] text-sm outline-none focus:border-[#1f4e43] focus:ring-2 focus:ring-[#1f4e43]/10" />
              </div>
              <button onClick={() => nav("/hospital-admin/dashboard")}
                className="px-5 py-2.5 bg-white border border-[#d7d9d0] rounded-2xl text-sm font-semibold text-[#27584d] hover:bg-[#f7f8f5] transition shadow-sm">
                ← Back
              </button>
              <button onClick={fetchPayments}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Total Revenue"      value={formatCurrency(summary.totalRevenue)} hint="Confirmed payments only"      accent="green" />
          <SummaryCard title="Total Transactions" value={summary.totalCount}                   hint="Paid & completed"             accent="teal"  />
          <SummaryCard title="User Bookings"      value={summary.userCount}                    hint="Registered user payments"     accent="sage"  />
          <SummaryCard title="Guest Bookings"     value={summary.guestCount}                   hint="Walk-in guest payments"       accent="amber" />
        </section>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-3xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
        )}

        {/* Table */}
        <div className="rounded-3xl border border-[#e7e5de] bg-white shadow-sm overflow-hidden">

          {/* Filter bar */}
          <div className="p-5 border-b border-[#f0ede6] flex flex-col md:flex-row gap-3 flex-wrap items-center">
            <input type="text" placeholder="Search patient, counselor, transaction ID…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] text-sm outline-none focus:border-[#1f4e43] focus:ring-2 focus:ring-[#1f4e43]/10" />
            <select value={methodFilter} onChange={(e) => setMethod(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] text-sm outline-none focus:border-[#1f4e43]">
              <option value="all">All Methods</option>
              {allMethods.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
            <span className="text-xs text-[#8f9a95] whitespace-nowrap">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table content */}
          {loading ? (
            <div className="p-10 text-center text-[#6a7772] text-sm">Loading payments…</div>
          ) : payments.length === 0 && !error ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-[#6a7772] text-sm font-medium">No confirmed payments found</p>
              <p className="text-[#8f9a95] text-xs">No paid or completed transactions exist for the selected date range.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-[#8f9a95] text-sm">No records match your search or filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8f6f0] border-b border-[#f0ede6]">
                    {[
                      { label: "#",              field: "id"             },
                      { label: "Type",           field: null             },
                      { label: "Patient",        field: "patient_name"   },
                      { label: "Counselor",      field: "counselor_name" },
                      { label: "Payment Date",   field: "date"           },
                      { label: "Session",        field: null             },
                      { label: "Method",         field: "payment_method" },
                      { label: "Transaction ID", field: "transaction_id" },
                      { label: "Amount",         field: "amount"         },
                      { label: "Status",         field: null             },
                    ].map(({ label, field }) => (
                      <th key={label} onClick={field ? () => toggleSort(field) : undefined}
                        className={`px-4 py-3 text-left text-xs font-semibold text-[#6a7772] uppercase tracking-wide whitespace-nowrap select-none ${field ? "cursor-pointer hover:text-[#1f4e43]" : ""}`}>
                        {label}{field && <SortIcon field={field} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8f6f0]">
                  {paginated.map((p, idx) => {
                    const method = String(p.payment_method || p.method || "").toLowerCase();
                    const methodIcon = METHOD_ICONS[method] || METHOD_ICONS.default;
                    const isGuest = p.type === "guest";
                    return (
                      <tr key={p.id || idx} className="hover:bg-[#f8f6f0] transition-colors">
                        <td className="px-4 py-3.5 text-[#8f9a95] font-mono text-xs whitespace-nowrap">#{p.id || ((page - 1) * PAGE_SIZE + idx + 1)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap ${isGuest ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"}`}>
                            {isGuest ? "Guest" : "User"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-[#1f4e43] whitespace-nowrap">{p.patient_name || "—"}</td>
                        <td className="px-4 py-3.5 text-[#5f6d68] whitespace-nowrap">{p.counselor_name || "—"}</td>
                        <td className="px-4 py-3.5 text-[#5f6d68] whitespace-nowrap">{formatDate(p.payment_date || p.created_at)}</td>
                        <td className="px-4 py-3.5 text-[#8f9a95] whitespace-nowrap text-xs">
                          {p.appointment_date ? `${formatDate(p.appointment_date)}${p.appointment_time ? " · " + formatTime(p.appointment_time) : ""}` : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#d5e8e4] text-[#1f4e43] text-xs font-medium whitespace-nowrap">
                            <span>{methodIcon}</span>{method || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-[#8f9a95] whitespace-nowrap">{p.transaction_id || "—"}</td>
                        <td className="px-4 py-3.5 font-bold text-[#1f4e43] whitespace-nowrap">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold bg-[#f0fdf4] text-[#166534] border-[#bbf7d0] whitespace-nowrap">
                            ✓ Paid
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-[#f0ede6] flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-[#8f9a95]">Page {page} of {totalPages} · {filtered.length} records</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] text-sm font-semibold hover:bg-[#e7e5de] disabled:opacity-40 disabled:cursor-not-allowed transition">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-2xl border text-sm font-semibold transition ${page === pageNum ? "bg-[#1f4e43] border-[#1f4e43] text-white" : "border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] hover:bg-[#e7e5de]"}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-2xl border border-[#e7e5de] bg-[#f8f6f0] text-[#1f4e43] text-sm font-semibold hover:bg-[#e7e5de] disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

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
        <h3 className="text-2xl font-bold text-[#1f4e43] leading-tight">{value}</h3>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border ${chip}`}>Live</span>
      </div>
      <p className="text-sm text-[#6a7772] mt-2">{hint}</p>
    </div>
  );
}