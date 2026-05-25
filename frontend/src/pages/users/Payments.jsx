import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function Payments() {
  const [filter, setFilter] = useState("all");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/user/payments");
        const raw = res.data?.data || [];

        // Normalize status — backend may return "paid", "completed", "success" etc.
        const normalizeStatus = (s) => {
          const v = (s || "").toLowerCase().trim();
          if (["paid", "success", "completed", "approved"].includes(v)) return "success";
          if (["pending", "processing", "initiated"].includes(v))        return "pending";
          if (["failed", "failure", "cancelled", "canceled", "rejected"].includes(v)) return "failed";
          return "pending"; // safe fallback
        };

        setPayments(raw.map((p) => ({
          id:        p.id,
          provider:  p.payment_method || "—",
          amount:    p.amount || 0,
          status:    normalizeStatus(p.payment_status),
          date:      p.payment_date || "",
          counselor: p.counselor_name || "—",
          txn:       p.transaction_id || "—",
        })));
      } catch (err) {
        setError("Failed to load payments.");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  const statusConfig = {
    success: {
      badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
      dot: "bg-emerald-500",
      label: "Success",
    },
    pending: {
      badge: "bg-amber-50 border-amber-200 text-amber-700",
      dot: "bg-amber-400",
      label: "Pending",
    },
    failed: {
      badge: "bg-red-50 border-red-200 text-red-600",
      dot: "bg-red-400",
      label: "Failed",
    },
  };

  const providerIcon = (provider) => {
    const p = (provider || "").toLowerCase();
    if (p === "esewa")  return { icon: "💚", bg: "bg-green-50 border-green-200" };
    if (p === "khalti") return { icon: "💜", bg: "bg-purple-50 border-purple-200" };
    return { icon: "💵", bg: "bg-gray-50 border-gray-200" };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filters = ["all", "success"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)] px-4 md:px-10 xl:px-14 py-8 md:py-12">

      {/* Header */}
      <div className="mb-8">
        <Link
          to="/users/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#1f4e43] hover:text-[#2a6b5e] transition mb-5"
        >
          ← Back to Dashboard
        </Link>
        <div className="rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">Billing</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Payment History 💳
              </h1>
              <p className="mt-2 text-sm text-[#5f6d68]">Track all your session payments and invoices</p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <SummaryCard icon="📋" label="Total Payments" value={payments.length} sub="all time" />
            
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition capitalize ${
              filter === f
                ? "bg-[#1f4e43] text-white border-[#1f4e43] shadow-md"
                : "bg-white text-[#1f4e43] border-[#d7d9d0] hover:bg-[#f7f8f5]"
            }`}
          >
            {f === "all" ? "All Transactions" : f}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-[#6b7280]">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Payment cards */}
      <div className="rounded-3xl border border-[#e7e5de] bg-white/75 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm overflow-hidden">

        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-4 bg-[#f7f8f5] border-b border-[#e7e5de]">
          {["Payment ID", "Counselor", "Provider", "Amount", "Date", "Status"].map((h) => (
            <div key={h} className="text-[11px] font-semibold uppercase tracking-wider text-[#83918b]">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-8 h-8 border-[3px] border-[#1f4e43] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#6b7280]">Loading payments...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-sm font-semibold text-[#1f4e43]">No payments found</p>
            <p className="text-xs text-[#6b7280] mt-1">Try changing the filter above</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0ede8]">
            {filtered.map((p, idx) => {
              const s = statusConfig[p.status?.toLowerCase()] || statusConfig.failed;
              const prov = providerIcon(p.provider);
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4 items-center px-5 md:px-6 py-4 hover:bg-[#fafaf8] transition group"
                >
                  {/* ID */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#eef7f3] border border-[#d5e8e0] flex items-center justify-center text-xs font-bold text-[#1f4e43] flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-semibold text-[#1c2522]">{p.id}</div>
                      {/* Mobile: show all info stacked */}
                      <div className="md:hidden text-[11px] text-[#6b7280] mt-0.5">{formatDate(p.date)}</div>
                    </div>
                  </div>

                  {/* Provider */}
                  <div className="text-sm font-medium text-[#1c2522]">{p.counselor}</div>

                  {/* Provider/Method */}
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-xl border flex items-center justify-center text-sm ${prov.bg}`}>
                      {prov.icon}
                    </span>
                    <span className="text-sm font-medium text-[#1c2522]">{p.provider}</span>
                  </div>

                  {/* Amount */}
                  <div className="text-sm font-bold text-[#1f4e43]">
                    Rs. {p.amount.toLocaleString()}
                  </div>

                  {/* Date */}
                  <div className="hidden md:block text-sm text-[#6b7280]">
                    {formatDate(p.date)}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1 border ${s.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 bg-[#f7f8f5] border-t border-[#e7e5de]">
            <p className="text-xs text-[#6b7280]">Showing {filtered.length} of {payments.length} transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, green, amber }) {
  return (
    <div className={`rounded-2xl border p-4 ${
      green ? "bg-emerald-50 border-emerald-200" :
      amber ? "bg-amber-50 border-amber-200" :
      "bg-white border-[#e7e5de]"
    }`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#83918b]">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-xl font-bold ${green ? "text-emerald-700" : amber ? "text-amber-700" : "text-[#1f4e43]"}`}>
        {value}
      </p>
      <p className="text-[11px] text-[#95a19b] mt-0.5">{sub}</p>
    </div>
  );
}