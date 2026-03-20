import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";

export default function CounselorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/counselor/login", form);

      if (!data?.counselor) {
        throw new Error("Invalid response from server.");
      }

      console.log("Counselor login successful, token:", data.token);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify({ ...data.counselor, role: data.role }));

      navigate("/counselor/dashboard");
    } catch (err) {
      console.error("Counselor login error:", err);
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fbf8_0%,_#f4f7f2_45%,_#f6f1e7_100%)] px-4 sm:px-6 pt-28 pb-12">
      {/* NAVBAR (FIXED) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          {/* Logo Ribbon */}
          <Link to="/" className="relative block select-none">
            <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-800">
            <Link to="/" className="hover:text-[#215c4c] transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-[#215c4c] transition">
              About Us
            </Link>
            <Link to="/services" className="hover:text-[#215c4c] transition">
              Services
            </Link>

            <Link
              to="/counselor/signup"
              className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                         px-7 py-2.5 text-[15px] font-semibold text-[#305b39]
                         shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                         hover:shadow-[0_3px_0_0_#89ad8f] transition"
            >
              Counselor Signup
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl mt-8 md:mt-12 px-2 pb-16">
        <div className="relative min-h-[72vh] flex items-center justify-center">
          <div className="pointer-events-none absolute -top-6 right-[8%] h-64 w-64 rounded-full bg-[#e3f3e6]/65 blur-3xl" />
          <div className="pointer-events-none absolute top-32 -left-10 h-72 w-72 rounded-full bg-[#f6e7d8]/55 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-6 right-0 h-52 w-52 rounded-full bg-[#d8eee1]/55 blur-3xl hidden md:block" />

          <div className="relative w-full max-w-md sm:max-w-lg">
            <div className="rounded-3xl border border-[#ebe4d7] bg-white/90 p-8 sm:p-10 shadow-[0_24px_70px_rgba(32,66,55,0.12)] backdrop-blur">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f877f]">MannSathi Counselor Portal</p>
                <h1 className="text-3xl font-semibold text-[#1f2f2a] leading-tight">
                  Counselor Login
                </h1>
                <p className="text-sm text-neutral-600">
                  Log in to manage your sessions and connect with clients.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-800">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                               px-4 py-3 text-sm text-[#243630] outline-none transition
                               focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                    placeholder="counselor@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-800">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                               px-4 py-3 text-sm text-[#243630] outline-none transition
                               focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-2xl border border-[#89ad8f] bg-gradient-to-b from-[#e8f5ea] to-[#d9eddc]
                             px-5 py-3.5 text-sm font-semibold text-[#305b39]
                             shadow-[0_8px_22px_rgba(101,143,108,0.24)] transition
                             hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(101,143,108,0.3)]
                             disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Login as Counselor"}
                </button>
              </form>

              <p className="mt-6 text-sm text-neutral-600 text-center">
                Don&apos;t have a counselor account?{" "}
                <Link
                  to="/counselor/signup"
                  className="text-[#305b39] font-semibold hover:underline"
                >
                  Sign up as Counselor
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
