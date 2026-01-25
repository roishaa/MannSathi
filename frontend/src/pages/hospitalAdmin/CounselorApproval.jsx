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
    <div className="min-h-screen bg-[#f9fafb] p-6 md:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Counselor Approval</h1>
          <p className="text-gray-600 text-sm mt-2">
            Hospital:{" "}
            <span className="font-semibold">
              {admin?.hospital_name || "MannSathi General Hospital"}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => nav("/hospital-admin/dashboard")}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={fetchCounselors}
            className="px-4 py-2 rounded-lg bg-[#215c4c] text-white hover:opacity-90"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="mt-6 text-gray-600">Loading counselors…</p>}

      {!loading && error && (
        <div className="mt-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <Section
            title={`Pending (${pending.length})`}
            items={pending}
            onApprove={approve}
            onReject={reject}
          />

          <div className="h-6" />

          <Section title={`Approved (${approved.length})`} items={approved} readOnly />
        </>
      )}
    </div>
  );
}

function Section({ title, items, onApprove, onReject, readOnly }) {
  return (
    <div className="mt-8 bg-white rounded-xl shadow">
      <div className="p-5 border-b">
        <h2 className="font-bold text-lg">{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="p-5 text-gray-500 text-sm">No counselors here.</div>
      ) : (
        <div className="divide-y">
          {items.map((c) => (
            <div key={c.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {c.name || c.full_name || "Counselor"}{" "}
                  <span className="text-gray-400 font-normal">• {c.email}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  License: <span className="font-medium">{c.license_no || c.license || "—"}</span>
                  {"  "}• Specialty: <span className="font-medium">{c.specialization || c.specialty || "—"}</span>
                </p>
              </div>

              {!readOnly && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onReject(c.id)}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(c.id)}
                    className="px-4 py-2 rounded-lg bg-[#215c4c] text-white hover:opacity-90"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
