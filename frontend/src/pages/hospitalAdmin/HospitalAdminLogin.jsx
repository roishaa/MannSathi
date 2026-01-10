import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAdminSession } from "../../utils/adminAuth";
import { HOSPITAL } from "../../constants/hospital";

export default function HospitalAdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // DEMO (backend later)
    const ok =
      form.email.trim().toLowerCase() === "admin@hospital.com" &&
      form.password === "admin123";

    if (!ok) return setError("Invalid Hospital Admin credentials");

    setAdminSession({
      role: "hospital_admin",
      name: "Hospital Admin",
      email: form.email.trim().toLowerCase(),
      hospitalId: HOSPITAL.id,
      hospitalName: HOSPITAL.name,
      loggedInAt: new Date().toISOString(),
    });

    navigate("/hospital-admin/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-sm p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-center">Hospital Admin</h2>
        <p className="text-center text-gray-500 text-sm mt-1 mb-6">{HOSPITAL.name}</p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

        <label className="text-sm text-gray-600">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="admin@hospital.com"
          className="w-full mt-1 mb-4 p-3 border rounded-lg"
        />

        <label className="text-sm text-gray-600">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full mt-1 mb-6 p-3 border rounded-lg"
        />

        <button className="w-full bg-[#215c4c] text-white py-3 rounded-lg hover:opacity-90">
          Login
        </button>

        <p className="text-xs text-gray-400 mt-4">Demo: admin@hospital.com / admin123</p>
      </form>
    </div>
  );
}
