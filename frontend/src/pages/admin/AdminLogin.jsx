import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../utils/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ ONE endpoint preferred:
      // const res = await API.post("/admin/login", form);

      // ✅ If you still have hospital-admin/login for now, keep this:
      // But ideally change backend to /admin/login
      const res = await API.post("/admin/login", {
        email: form.email.trim(),
        password: form.password,
      });

      // expected: { token, admin: { role, ... } } OR { token, role, admin }
      const token = res.data?.token || res.data?.access_token;
      const admin = res.data?.admin || null;
      const role = res.data?.role || admin?.role;

      if (!token || !role) throw new Error("Token/role missing from response.");

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_role", role);
      localStorage.setItem("admin_info", JSON.stringify(admin || {}));

      if (role === "platform_admin") {
        navigate("/platform-admin/dashboard", { replace: true });
      } else if (role === "hospital_admin") {
        navigate("/hospital-admin/dashboard", { replace: true });
      } else {
        setError("Unknown admin role.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (err?.response?.status === 401
            ? "Invalid email or password."
            : "Login failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm p-8 rounded-2xl shadow"
      >
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>
        <p className="text-center text-gray-500 text-sm mt-1 mb-6">
          Platform / Hospital Admin
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <label htmlFor="email" className="text-sm text-gray-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="admin@mannsathi.com"
          required
          autoComplete="email"
          className="w-full mt-1 mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#215c4c]/40"
        />

        <label htmlFor="password" className="text-sm text-gray-600">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full mt-1 mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#215c4c]/40"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#215c4c] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
