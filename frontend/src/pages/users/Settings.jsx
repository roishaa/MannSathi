import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [form, setForm] = useState({
    name: user.name || user.full_name || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const [msg, setMsg] = useState("");

  const save = () => {
    setMsg("");
    const updated = { ...user, ...form };
    localStorage.setItem("user", JSON.stringify(updated));
    setMsg("✅ Saved changes (localStorage).");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] px-5 md:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="text-sm underline text-[#1f4e43]">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="max-w-2xl bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
        <h1 className="text-xl font-semibold text-[#1e293b]">Settings</h1>
        <p className="text-sm text-[#6b7280]">Update profile details (UI-only for now).</p>

        {msg && (
          <div className="mt-4 text-xs rounded-2xl border border-[#d5e4da] bg-[#e3f3e6] text-[#1f4e43] p-3">
            {msg}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs text-[#6b7280]">Name</label>
            <input
              className="mt-1 w-full rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-[#6b7280]">Email</label>
            <input
              className="mt-1 w-full rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-[#6b7280]">Phone</label>
            <input
              className="mt-1 w-full rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <button
            onClick={save}
            className="w-full rounded-2xl bg-[#1f4e43] text-white py-3 text-sm font-semibold hover:opacity-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
