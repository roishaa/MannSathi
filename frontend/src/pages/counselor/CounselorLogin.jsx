import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
      const res = await fetch("http://localhost:8000/api/counselor/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      // ✅ IMPORTANT: parse JSON only once
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Backend returns 'counselor', not 'user'
      if (!data?.counselor) {
        throw new Error("Invalid response from server.");
      }

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify({ ...data.counselor, role: data.role }));

      navigate("/counselor/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-28 pb-10">
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
      <main className="mx-auto max-w-6xl mt-10 md:mt-14 px-2 pb-16">
        <div className="relative flex justify-center">
          {/* soft background glow */}
          <div className="absolute -top-10 h-72 w-72 rounded-full bg-[#ffe1d6]/40 blur-3xl" />
          <div className="absolute top-24 -left-10 h-64 w-64 rounded-full bg-[#e3f3e6]/55 blur-3xl hidden md:block" />

          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-3xl border border-[#efe7dc] shadow-[0_20px_60px_rgba(0,0,0,0.08)] px-8 py-10">
              <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
                Counselor Login
              </h1>
              <p className="text-sm text-neutral-600 mb-6">
                Log in to manage your sessions and connect with clients.
              </p>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                               px-4 py-3 text-sm outline-none
                               focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                    placeholder="counselor@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                               px-4 py-3 text-sm outline-none
                               focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                             px-5 py-3 text-sm font-semibold text-[#305b39]
                             shadow-[0_4px_0_0_#89ad8f]
                             hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition
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
