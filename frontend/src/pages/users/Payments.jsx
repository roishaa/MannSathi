import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Payments() {
  const [filter, setFilter] = useState("all");

  // If you don’t have payments stored yet, show fallback demo rows
  const payments = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("payments")) || [];
      if (stored.length) return stored;
    } catch {}
    return [
      { id: "P-1001", provider: "eSewa", amount: 800, status: "success", date: "2026-01-03" },
      { id: "P-1002", provider: "Khalti", amount: 1000, status: "pending", date: "2026-01-04" },
      { id: "P-1003", provider: "Cash", amount: 500, status: "failed", date: "2025-12-25" },
    ];
  }, []);

  const badge = (status) => {
    const base = "text-[11px] rounded-full px-3 py-1 border";
    const s = (status || "").toLowerCase();
    if (s === "success") return `${base} bg-green-50 border-green-200 text-green-700`;
    if (s === "pending") return `${base} bg-yellow-50 border-yellow-200 text-yellow-700`;
    if (s === "failed") return `${base} bg-red-50 border-red-200 text-red-700`;
    return `${base} bg-[#f9fafb] border-[#e5e7eb] text-[#374151]`;
  };

  const filtered = payments.filter((p) => (filter === "all" ? true : p.status === filter));

  return (
    <div className="min-h-screen bg-[#f8f6f0] px-5 md:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="text-sm underline text-[#1f4e43]">
          ← Back to Dashboard
        </Link>

        <select
          className="rounded-2xl border border-[#e5e7eb] px-4 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
        <h1 className="text-xl font-semibold text-[#1e293b]">Payments</h1>
        <p className="text-sm text-[#6b7280]">View your payment history and invoices.</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f3f4f6] text-[#374151]">
              <tr>
                <th className="text-left px-4 py-3">Payment ID</th>
                <th className="text-left px-4 py-3">Provider</th>
                <th className="text-left px-4 py-3">Amount (Rs.)</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3">{p.provider}</td>
                  <td className="px-4 py-3">{p.amount}</td>
                  <td className="px-4 py-3">{p.date}</td>
                  <td className="px-4 py-3">
                    <span className={badge(p.status)}>{p.status}</span>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-[#6b7280]">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 text-xs text-[#6b7280]">
          Tip: Later you can generate invoices with backend (PDF).
        </div>
      </div>
    </div>
  );
}
