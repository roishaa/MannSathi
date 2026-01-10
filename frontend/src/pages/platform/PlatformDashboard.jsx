import { useNavigate } from "react-router-dom";
import { clearAdminSession, getAdminSession } from "../../utils/adminAuth";
import { HOSPITAL } from "../../constants/hospital";

export default function PlatformDashboard() {
  const nav = useNavigate();
  const s = getAdminSession();

  const logout = () => {
    clearAdminSession();
    nav("/platform/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Platform Admin Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">
            Logged in as: <span className="font-semibold">{s?.email}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Role: Platform Admin (MannSathi representation)
          </p>
        </div>

        <button onClick={logout} className="bg-[#215c4c] text-white px-5 py-2 rounded-lg hover:opacity-90">
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Hospitals</p>
          <h2 className="text-3xl font-bold">1</h2>
          <p className="text-sm text-gray-500 mt-2">Single hospital for FYP.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Revenue Model</p>
          <h2 className="text-3xl font-bold">Plan</h2>
          <p className="text-sm text-gray-500 mt-2">
            Subscription / commission (backend later).
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Security</p>
          <h2 className="text-3xl font-bold">Protected</h2>
          <p className="text-sm text-gray-500 mt-2">Separate login route.</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3">Hospital Details</h2>
        <div className="space-y-1 text-gray-700">
          <p><span className="font-semibold">Name:</span> {HOSPITAL.name}</p>
          <p><span className="font-semibold">Address:</span> {HOSPITAL.address}</p>
          <p><span className="font-semibold">Hospital ID:</span> {HOSPITAL.id}</p>
        </div>
      </div>
    </div>
  );
}
