import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import { getAdminInfo } from "../../utils/adminAuth";

export default function CounselorApproval() {
  const nav = useNavigate();
  const admin = useMemo(() => getAdminInfo(), []);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchCounselors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const pending = rows.filter((r) => (r.status || "") === "PENDING");
  const approved = rows.filter((r) => (r.status || "") === "APPROVED");

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#1c2b2d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600&display=swap');
      `}</style>

      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#f4b860]/25 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#2b5f5a]/25 blur-3xl" />

        <div className="relative z-10 p-6 md:p-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.35em] text-[#7c7b77]">VERIFICATION</p>
              <h1
                className="text-3xl md:text-4xl font-bold mt-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Counselor Approval
              </h1>
              <p
                className="text-[#5f6562] text-sm mt-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Hospital: <span className="font-semibold">{admin?.hospital_name || "MannSathi General Hospital"}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => nav("/hospital-admin/dashboard")}
                className="px-4 py-2 rounded-xl border border-[#e0d7ca] bg-white/70 hover:bg-white text-sm font-semibold"
              >
                Back
              </button>
              <button
                onClick={fetchCounselors}
                className="px-5 py-2 rounded-xl bg-[#0f2d2b] text-white hover:opacity-90 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Pending" value={pending.length} hint="Awaiting review" accent="amber" />
            <SummaryCard title="Approved" value={approved.length} hint="Active in hospital" accent="teal" />
            <SummaryCard title="Total" value={rows.length} hint="All submissions" accent="ink" />
            <SummaryCard title="Priority" value={pending.length ? "High" : "Low"} hint="Queue focus" accent="amber" />
          </section>

          {loading && <p className="text-[#6b6f6a]">Loading counselors...</p>}

          {!loading && error && (
            <div className="p-4 rounded-2xl bg-[#fff1f1] text-[#b42318] text-sm border border-[#f7cfcf]">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <Section
                title="Pending approvals"
                count={pending.length}
                items={pending}
                onApprove={approve}
                onReject={reject}
                tone="amber"
              />

              <Section
                title="Approved counselors"
                count={approved.length}
                items={approved}
                readOnly
                tone="teal"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, count, items, onApprove, onReject, readOnly, tone }) {
  const toneMap = {
    amber: "bg-[#f4b860]/20 text-[#7a4b09]",
    teal: "bg-[#2b5f5a]/15 text-[#0f2d2b]",
  };
  const toneClass = toneMap[tone] || "bg-[#1c2b2d]/10 text-[#1c2b2d]";
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white/60">
      <div className="p-5 border-b border-[#e6e1d9] flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg" style={{ fontFamily: "'Fraunces', serif" }}>
            {title}
          </h2>
          <p className="text-xs text-[#7c7b77] mt-1">Manage credentials and compliance</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${toneClass}`}>{count}</span>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-[#7c7b77] text-sm">No counselors here yet.</div>
      ) : (
        <div className="divide-y divide-[#eee7dc]">
          {items.map((c) => (
            <div
              key={c.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/40 hover:bg-white/70 transition"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-sm">
                    {c.name || c.full_name || "Counselor"}
                  </p>
                  <StatusPill status={c.status} />
                  <span className="text-xs px-2 py-1 rounded-full border border-[#e0d7ca] bg-[#fbf8f2] text-[#6b6f6a]">
                    {c.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-[#f7f2e9] border border-[#e9e0d4]">
                    License: {c.license_no || c.license || "—"}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[#f7f2e9] border border-[#e9e0d4]">
                    Specialty: {c.specialization || c.specialty || "—"}
                  </span>
                </div>
              </div>

              {!readOnly ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onReject(c.id)}
                    className="px-4 py-2 rounded-xl border border-[#e0d7ca] bg-white/70 hover:bg-white text-sm font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(c.id)}
                    className="px-4 py-2 rounded-xl bg-[#0f2d2b] text-white hover:opacity-90 text-sm font-semibold"
                  >
                    Approve
                  </button>
                </div>
              ) : (
                <div className="text-xs px-3 py-2 rounded-xl bg-[#2b5f5a]/15 text-[#0f2d2b] font-semibold">
                  Active
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, hint, accent }) {
  const accentMap = {
    amber: "bg-[#f4b860]/15 text-[#915c10]",
    teal: "bg-[#2b5f5a]/15 text-[#0f2d2b]",
    ink: "bg-[#1c2b2d]/10 text-[#1c2b2d]",
  };
  const accentClass = accentMap[accent] || accentMap.ink;

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white/60 p-5">
      <p className="text-xs text-[#7c7b77]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {title}
      </p>
      <div className="flex items-end justify-between mt-2">
        <h3 className="text-3xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
          {value}
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full ${accentClass}`}>Live</span>
      </div>
      <p className="text-sm text-[#6b6f6a] mt-2">{hint}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const toneMap = {
    PENDING: "bg-[#f4b860]/20 text-[#7a4b09]",
    APPROVED: "bg-[#2b5f5a]/15 text-[#0f2d2b]",
    REJECTED: "bg-[#fbd5d5] text-[#9b1c1c]",
  };
  const tone = toneMap[status] || "bg-[#e5e7eb] text-[#374151]";
  return <span className={`text-[10px] px-2 py-1 rounded-full ${tone}`}>{status || "—"}</span>;
}
