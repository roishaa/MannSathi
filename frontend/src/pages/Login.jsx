import { Link } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../utils/api";

// ─── Validation helpers ───────────────────────────────────────────────────────
const isValidEmail = (email) => {
  // RFC-5321 simplified: must have chars @ chars . chars (2+ letters tld)
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
};

const validateLoginForm = ({ email, password }) => {
  if (!email.trim()) return "Email address is required.";
  if (!isValidEmail(email)) return "Please enter a valid email address (e.g. you@example.com).";
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null; // no error
};

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  // Validate a single field on blur for inline feedback
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value && !isValidEmail(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address (e.g. you@example.com).",
      }));
    }
    if (name === "password" && value && value.length < 6) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters.",
      }));
    }
  };

  const saveUserAuth = (data) => {
    localStorage.setItem("user_token", data.token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ── Client-side validation BEFORE hitting the API ──
    const validationError = validateLoginForm(form);
    if (validationError) {
      setError(validationError);
      return; // stop here — do NOT call the API
    }

    setLoading(true);
    try {
      const { data } = await api.post("/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (!data.token) {
        setError("Server didn't return a token. Please try again.");
        return;
      }

      saveUserAuth(data);
      alert("Logged in successfully!");
      window.location.href = "/users/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      if (err?.response?.data?.errors) {
        const firstField = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstField][0]);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/google-login", {
        token: credentialResponse.credential,
      });

      if (!data.token) {
        setError("Google login failed. No token returned.");
        return;
      }

      saveUserAuth(data);
      alert("Logged in with Google successfully!");
      window.location.href = "/users/dashboard";
    } catch (err) {
      console.error("Google login error:", err);
      if (err?.response?.data?.errors) {
        const firstField = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstField][0]);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  // Helper: border color for a field
  const fieldBorder = (name) =>
    fieldErrors[name]
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-[#e5e7eb] focus:border-[#1f4e43] focus:ring-[#DCFCE7]/60";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-white to-[#E0F2FE] px-4 md:px-6 pt-28 pb-10">
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-[#e5e7eb] shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 md:px-6 py-4">
          <Link to="/" className="relative block select-none group">
            <div className="w-48 md:w-56 h-14 md:h-16 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)] group-hover:shadow-lg transition-all" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg md:text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[15px] font-medium text-neutral-700">
            <Link to="/" className="hover:text-[#1f4e43] transition-colors">Home</Link>
            <Link to="/about" className="hover:text-[#1f4e43] transition-colors">About Us</Link>
            <Link to="/services" className="hover:text-[#1f4e43] transition-colors">Services</Link>
            <Link
              to="/signup"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-6 py-2.5 text-[15px] font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
          </nav>

          <Link
            to="/signup"
            className="md:hidden px-4 py-2 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white text-sm font-semibold rounded-full"
          >
            Signup
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl mt-8 md:mt-12 px-2 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#FCE7F3] opacity-70 blur-3xl" />
          <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#DCFCE7] opacity-70 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT PANEL */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#F5F3FF] via-[#E0F2FE] to-[#DCFCE7] p-8 md:p-10 lg:p-12">
              <div className="absolute top-10 right-8 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
              <div className="absolute bottom-10 left-8 h-32 w-32 rounded-full bg-[#FCE7F3]/60 blur-3xl" />
              <div className="relative space-y-8">
                <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold text-[#1f4e43] shadow-sm">
                  MannSathi
                </div>
                <div className="max-w-md space-y-4">
                  <h1 className="text-3xl md:text-4xl leading-tight font-serif font-semibold text-neutral-800">
                    Welcome back to your safe space
                  </h1>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                    Continue your healing journey with trusted support, private care,
                    and compassionate conversations designed around your wellbeing.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-neutral-800">Private & Secure</p>
                    <p className="mt-1 text-xs text-neutral-600">Confidential sessions and protected communication.</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-neutral-800">Compassionate Support</p>
                    <p className="mt-1 text-xs text-neutral-600">Certified counselors who listen with care.</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm sm:col-span-2">
                    <p className="text-sm font-semibold text-neutral-800">Easy Session Booking</p>
                    <p className="mt-1 text-xs text-neutral-600">Start quickly and manage appointments without stress.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT PANEL — FORM */}
            <section className="bg-white p-8 md:p-10 lg:p-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-7">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f4e43] to-[#2a6b5e] shadow-md">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">Login</h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    Access your account and continue your wellness progress.
                  </p>
                </div>

                {/* Global error banner */}
                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400 group-focus-within:text-[#1f4e43] transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="you@example.com"
                        required
                        className={`w-full rounded-2xl border bg-[#FCFCFD] pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${fieldBorder("email")}`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 pl-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400 group-focus-within:text-[#1f4e43] transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your password"
                        required
                        className={`w-full rounded-2xl border bg-[#FCFCFD] pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${fieldBorder("password")}`}
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-red-500 pl-1">{fieldErrors.password}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer hover:text-neutral-800">
                        <input type="checkbox" className="rounded border-neutral-300" />
                        Remember me
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-6 py-3.5 text-base font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? "Logging in..." : "Login to Your Account"}
                  </button>
                </form>

                <div className="mt-6">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-4 text-neutral-500 font-medium">or continue with</span>
                    </div>
                  </div>
                  <div className="flex justify-center rounded-xl border border-[#eef2f7] bg-[#fafbfd] py-3">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-4 text-neutral-500 font-medium">New to MannSathi?</span>
                    </div>
                  </div>
                  <Link
                    to="/signup"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e7eb] px-6 py-3.5 text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 hover:border-[#1f4e43] transition-all duration-200"
                  >
                    <span>Create an Account</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}