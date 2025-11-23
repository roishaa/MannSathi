// src/Signup.jsx
import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000"; // change later to env if you want

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // update form when typing
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    // clear error when user starts typing again
    if (error) setError("");
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
const res = await fetch(`${API_BASE}/api/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(form),
});

      const data = await res.json();

      if (!res.ok) {
        // handle Laravel validation / error messages
        if (res.status === 419) {
          // 419 = CSRF in Laravel (should not happen for /api routes)
          setError("Server reported a CSRF error. Check that /api/register is in routes/api.php.");
        } else if (data.errors) {
          const firstField = Object.keys(data.errors)[0];
          setError(data.errors[firstField][0]);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Registration failed. Please try again.");
        }
        return;
      }

      // save token & user if you want auto-login
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Account created successfully! You can now log in.");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] px-6 py-10">
      {/* NAVBAR */}
      <header className="flex items-center justify-between">
        {/* Logo ribbon */}
        <div className="relative">
          <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-semibold text-xl font-serif tracking-wide">
              MannSathi
            </span>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="flex items-center gap-10 text-[15px] font-medium text-neutral-800">
          <a className="hover:text-[#215c4c] cursor-pointer">Home</a>
          <a className="hover:text-[#215c4c] cursor-pointer">About Us</a>
          <a className="hover:text-[#215c4c] cursor-pointer">Services</a>

          <button
            className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </button>
        </nav>
      </header>

      {/* content */}
      <main className="flex-1 w-full flex justify-center items-center px-4 pb-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] px-8 py-10">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Create your account 🌿
          </h1>
          <p className="text-sm text-neutral-600 mb-4">
            Join MannSathi and connect with verified counselors.
          </p>

          {/* error message */}
          {error && (
            <p className="mb-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e3ded0] bg-[#fffdf7] px-3 py-2.5 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e3ded0] bg-[#fffdf7] px-3 py-2.5 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e3ded0] bg-[#fffdf7] px-3 py-2.5 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e3ded0] bg-[#fffdf7] px-3 py-2.5 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex justify-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-5 py-3 text-sm font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-xs text-neutral-600 text-center">
            Already have an account?{" "}
            <span
              className="text-[#305b39] font-semibold hover:underline cursor-pointer"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
