import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function SearchDoctor() {
  const [q, setQ] = useState("");

  const counselors = useMemo(
    () => [
      { name: "Dr. Anjana Shrestha", spec: "Anxiety", type: "Online", rating: 4.8 },
      { name: "Mr. Kiran Gurung", spec: "Stress", type: "In-person", rating: 4.6 },
      { name: "Ms. Sita Lama", spec: "Teen Counseling", type: "Online", rating: 4.7 },
      { name: "Dr. Pratiksha Basnet", spec: "Relationships", type: "Online", rating: 4.5 },
    ],
    []
  );

  const filtered = counselors.filter((c) =>
    (c.name + " " + c.spec).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f6f0] px-5 md:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="text-sm underline text-[#1f4e43]">
          ← Back to Dashboard
        </Link>

        <Link
          to="/users/BookAppointmentUser"
          className="text-xs rounded-full bg-[#1f4e43] text-white px-4 py-2"
        >
          Book session
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#1e293b]">Search Counselor</h1>
            <p className="text-sm text-[#6b7280]">Find counselors based on specialization and type.</p>
          </div>

          <input
            className="rounded-2xl border border-[#e5e7eb] px-4 py-2 text-sm outline-none"
            placeholder="Search by name or topic..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((c) => (
            <div key={c.name} className="rounded-3xl border border-[#e5e7eb] p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-[#6b7280]">
                    {c.spec} • {c.type}
                  </p>
                </div>
                <span className="text-[11px] rounded-full border border-[#d5e4da] bg-[#e3f3e6] px-3 py-1 text-[#1f4e43]">
                  ⭐ {c.rating}
                </span>
              </div>

              <Link
                to="/users/BookAppointmentUser"
                className="mt-4 inline-flex text-xs rounded-full bg-[#1f4e43] text-white px-4 py-2 hover:opacity-95"
              >
                Book with {c.name.split(" ")[0]}
              </Link>
            </div>
          ))}

          {!filtered.length && (
            <div className="text-sm text-[#6b7280]">No counselors found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
