import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAdminLoggedIn, setAdminSession } from "../../utils/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // If already logged in, go dashboard
  if (isAdminLoggedIn()) {
    navigate("/admin/dashboard", { replace: true });
  }

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // TEMP (replace with backend later)
    const ok =
      form.email.trim().toLowerCase() === "admin@mannsathi.com" &&
      form.password === "admin123";

    if (!ok) {
      setError("Invalid admin credentials");
      return;
    }

    setAdminSession({
      role: "admin",
      email: form.email.trim().toLowerCase(),
      name: "System Admin",
      loggedInAt: new Date().toISOString(),
    });

    // go back to the page they tried to open OR dashboard
    const from = location.state?.from || "/admin/dashboard";
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Admin accounts are pre-created (no signup).
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          name="email"
          placeholder="admin@mannsathi.com"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#215c4c]/30"
        />

        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-6 mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#215c4c]/30"
        />

        <button className="w-full bg-[#215c4c] text-white py-3 rounded-lg hover:opacity-90">
          Login
        </button>

        <div className="text-xs text-gray-400 mt-4">
          Demo: admin@mannsathi.com / admin123
        </div>
      </form>
    </div>
  );
}
