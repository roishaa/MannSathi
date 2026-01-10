import { useNavigate } from "react-router-dom";
import { clearAdminSession, getAdminSession } from "../../utils/adminAuth";

export default function HospitalAdminDashboard() {
  const nav = useNavigate();
  const s = getAdminSession();

  const logout = () => {
    clearAdminSession();
    nav("/hospital-admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hospital Admin Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">
            Hospital: <span className="font-semibold">{s?.hospitalName}</span>
          </p>
          <p className="text-gray-600 text-sm">
            Logged in as: <span className="font-semibold">{s?.email}</span>
          </p>
        </div>

        <button onClick={logout} className="bg-[#215c4c] text-white px-5 py-2 rounded-lg hover:opacity-90">
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Counselor Approval</p>
          <h2 className="text-3xl font-bold">Next</h2>
          <p className="text-sm text-gray-500 mt-2">
            Approve/verify counselors and license.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Schedules</p>
          <h2 className="text-3xl font-bold">Next</h2>
          <p className="text-sm text-gray-500 mt-2">Manage availability.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Appointments</p>
          <h2 className="text-3xl font-bold">Next</h2>
          <p className="text-sm text-gray-500 mt-2">View hospital sessions.</p>
        </div>
      </div>
    </div>
  );
}
