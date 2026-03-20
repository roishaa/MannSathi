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
      // ✅ Call /admin/login (baseURL already adds /api via proxy)
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4f9f6_0%,_#f7f5ef_48%,_#f2efe8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-[#e9e3d8] bg-white/90 shadow-[0_22px_65px_rgba(34,55,48,0.12)] backdrop-blur lg:grid-cols-2">
        <section className="relative overflow-hidden border-b border-[#eee8de] p-8 sm:p-10 lg:border-b-0 lg:border-r lg:border-[#eee8de] lg:p-12">
          <div className="pointer-events-none absolute -top-16 -left-10 h-56 w-56 rounded-full bg-[#d8ece4]/70 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 right-4 h-44 w-44 rounded-full bg-[#f2e7d7]/60 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-[#d0e0d8] bg-[#eef6f2] px-3 py-1 text-xs font-semibold tracking-wide text-[#215c4c]">
              Secure Access
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#6f7f78]">
              MannSathi
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#1c2b2d] sm:text-4xl">
              Admin Control Center
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#5e6662] sm:text-base">
              Manage platform operations, hospitals, and counselor workflows from one secure admin portal built for mental health services.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e8e3d9] bg-[#fbfaf7] px-4 py-3 text-sm text-[#30403a]">✓ Manage hospitals</div>
              <div className="rounded-xl border border-[#e8e3d9] bg-[#fbfaf7] px-4 py-3 text-sm text-[#30403a]">✓ Review counselors</div>
              <div className="rounded-xl border border-[#e8e3d9] bg-[#fbfaf7] px-4 py-3 text-sm text-[#30403a]">✓ Track sessions</div>
              <div className="rounded-xl border border-[#e8e3d9] bg-[#fbfaf7] px-4 py-3 text-sm text-[#30403a]">✓ Secure admin access</div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-[#ece6dc] bg-white p-7 shadow-sm sm:p-8"
          >
            <h2 className="text-2xl font-semibold text-[#1e2f2b]">Admin Login</h2>
            <p className="mt-1 text-sm text-[#646d69]">
              Login as Platform Admin or Hospital Admin
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-[#4f5a55]">
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
                  className="mt-1.5 w-full rounded-xl border border-[#e2ddd1] bg-[#fffdf8] px-4 py-3.5 text-sm text-[#1e2f2b] outline-none transition focus:border-[#7ca69a] focus:ring-2 focus:ring-[#215c4c]/20"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-[#4f5a55]">
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
                  className="mt-1.5 w-full rounded-xl border border-[#e2ddd1] bg-[#fffdf8] px-4 py-3.5 text-sm text-[#1e2f2b] outline-none transition focus:border-[#7ca69a] focus:ring-2 focus:ring-[#215c4c]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#215c4c] to-[#2d6c5a] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="mt-5 text-center text-xs text-[#7a827f]">
              Authorized administrators only
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
