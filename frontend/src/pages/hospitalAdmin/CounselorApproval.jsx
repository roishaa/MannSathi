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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/50 text-slate-800">
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute top-40 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-slate-200/30 blur-3xl" />

        <div className="relative z-10 p-4 md:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="w-full rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-4 md:p-6 shadow-sm">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Hospital Admin Panel</p>
                  <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900">Counselor Approval</h1>
                  <p className="text-slate-500 text-sm mt-2">
                    Hospital: <span className="font-semibold text-slate-700">{admin?.hospital_name || "MannSathi General Hospital"}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => nav("/hospital-admin/dashboard")}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-50 hover:shadow-md text-sm font-semibold transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={fetchCounselors}
                    className="px-4 py-2.5 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md text-sm font-semibold transition-all duration-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Pending" value={pending.length} hint="Awaiting review" accent="amber" />
            <SummaryCard title="Approved" value={approved.length} hint="Active in hospital" accent="teal" />
            <SummaryCard title="Total" value={rows.length} hint="All submissions" accent="ink" />
            <SummaryCard title="Priority" value={pending.length ? "High" : "Low"} hint="Queue focus" accent="amber" />
          </section>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-500 text-sm">
              Loading counselors...
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200 shadow-sm">
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
    amber: "bg-amber-100 text-amber-600 border border-amber-200",
    teal: "bg-emerald-100 text-emerald-600 border border-emerald-200",
  };
  const toneClass = toneMap[tone] || "bg-slate-200 text-slate-600 border border-slate-200";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-1">Manage credentials and compliance</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${toneClass}`}>{count}</span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-slate-500 text-sm text-center">No counselors here yet.</div>
      ) : (
        <div className="p-4 space-y-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 shadow-sm shrink-0" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900">
                        {c.name || c.full_name || "Counselor"}
                      </p>
                      <StatusPill status={c.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{c.email || "—"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs pl-0 lg:pl-13">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                    License: {c.license_no || c.license || "—"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                    Specialty: {c.specialization || c.specialty || "—"}
                  </span>
                </div>
              </div>

              {!readOnly ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onReject(c.id)}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-50 hover:shadow-md text-sm font-semibold transition-all duration-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(c.id)}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md text-sm font-semibold transition-all duration-200"
                  >
                    Approve
                  </button>
                </div>
              ) : (
                <div className="text-xs px-3 py-2 rounded-2xl bg-emerald-100 text-emerald-600 font-semibold border border-emerald-200">
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
    amber: {
      chip: "bg-amber-100 text-amber-600 border-amber-200",
      icon: "bg-slate-100",
    },
    teal: {
      chip: "bg-emerald-100 text-emerald-600 border-emerald-200",
      icon: "bg-slate-100",
    },
    ink: {
      chip: "bg-slate-200 text-slate-600 border-slate-200",
      icon: "bg-slate-100",
    },
  };
  const accentClass = accentMap[accent] || accentMap.ink;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className={`h-9 w-9 rounded-xl ${accentClass.icon} shadow-sm`} />
      </div>
      <div className="flex items-end justify-between mt-4">
        <h3 className="text-3xl font-bold text-slate-900">
          {value}
        </h3>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border ${accentClass.chip}`}>Live</span>
      </div>
      <p className="text-sm text-slate-500 mt-2">{hint}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const toneMap = {
    PENDING: "bg-amber-100 text-amber-600",
    APPROVED: "bg-emerald-100 text-emerald-600",
    REJECTED: "bg-red-100 text-red-600",
  };
  const tone = toneMap[status] || "bg-slate-100 text-slate-600";
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tone}`}>{status || "—"}</span>;
}
