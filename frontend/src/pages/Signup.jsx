// src/Signup.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../utils/api";

// ─── Validation helpers ───────────────────────────────────────────────────────

// Strictly requires @gmail.com — blocks .con, .co, .comm, @yahoo, etc.
const isValidGmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@gmail\.com$/.test(email.trim().toLowerCase());

const validateSignupForm = ({ name, email, password, password_confirmation }) => {
  if (!name.trim())
    return { field: "name", message: "Full name is required." };
  if (name.trim().length < 2)
    return { field: "name", message: "Name must be at least 2 characters." };

  if (!email.trim())
    return { field: "email", message: "Email address is required." };
  if (!isValidGmail(email))
    return { field: "email", message: "Please enter a valid Gmail address (e.g. yourname@gmail.com)." };

  if (!password)
    return { field: "password", message: "Password is required." };
  if (password.length < 8)
    return { field: "password", message: "Password must be at least 8 characters." };
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
    return { field: "password", message: "Password must contain at least one letter and one number." };

  if (!password_confirmation)
    return { field: "password_confirmation", message: "Please confirm your password." };
  if (password !== password_confirmation)
    return { field: "password_confirmation", message: "Passwords do not match." };

  return null;
};

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        if (value && value.trim().length < 2)
          setFieldErrors((p) => ({ ...p, name: "Name must be at least 2 characters." }));
        break;
      case "email":
        if (value && !isValidGmail(value))
          setFieldErrors((p) => ({
            ...p,
            email: "Please enter a valid Gmail address (e.g. yourname@gmail.com).",
          }));
        break;
      case "password":
        if (value && value.length < 8)
          setFieldErrors((p) => ({ ...p, password: "Password must be at least 8 characters." }));
        else if (value && (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)))
          setFieldErrors((p) => ({ ...p, password: "Must contain at least one letter and one number." }));
        break;
      case "password_confirmation":
        if (value && value !== form.password)
          setFieldErrors((p) => ({ ...p, password_confirmation: "Passwords do not match." }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // ── Validate BEFORE calling the API ──────────────────────────────────────
    const validationError = validateSignupForm(form);
    if (validationError) {
      setFieldErrors({ [validationError.field]: validationError.message });
      setError(validationError.message);
      return; // ← API is never called with invalid data
    }

    setLoading(true);
    try {
      const { data } = await api.post("/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Account created successfully! You can now log in.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Signup error:", err);
      if (err.response?.data?.errors) {
        const firstField = Object.keys(err.response.data.errors)[0];
        const msg = err.response.data.errors[firstField][0];
        setFieldErrors({ [firstField]: msg });
        setError(msg);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
              <span className="text-white font-bold text-lg md:text-xl font-serif tracking-wide">MannSathi</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[15px] font-medium text-neutral-700">
            <Link to="/" className="hover:text-[#1f4e43] transition-colors">Home</Link>
            <Link to="/about" className="hover:text-[#1f4e43] transition-colors">About Us</Link>
            <Link to="/services" className="hover:text-[#1f4e43] transition-colors">Services</Link>
            <Link to="/login" className="inline-flex items-center rounded-full bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-6 py-2.5 text-[15px] font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Login
            </Link>
          </nav>
          <Link to="/login" className="md:hidden px-4 py-2 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white text-sm font-semibold rounded-full">Login</Link>
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
                <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold text-[#1f4e43] shadow-sm">MannSathi</div>
                <div className="max-w-md space-y-4">
                  <h1 className="text-3xl md:text-4xl leading-tight font-serif font-semibold text-neutral-800">Support begins here</h1>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                    Create your account to access compassionate counseling, private support, and a calmer path toward better mental wellbeing.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-neutral-800">Private & Secure</p>
                    <p className="mt-1 text-xs text-neutral-600">Confidential sessions with trusted care standards.</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-neutral-800">Compassionate Support</p>
                    <p className="mt-1 text-xs text-neutral-600">Guidance from verified mental health counselors.</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm sm:col-span-2">
                    <p className="text-sm font-semibold text-neutral-800">Easy Session Booking</p>
                    <p className="mt-1 text-xs text-neutral-600">Book and manage your sessions with a few simple steps.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="bg-white p-8 md:p-10 lg:p-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-7">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f4e43] to-[#2a6b5e] shadow-md">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-800">Create Account</h1>
                  <p className="mt-2 text-sm text-neutral-600">Start your mental wellness journey with verified counselors.</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-neutral-700">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400 group-focus-within:text-[#1f4e43] transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input type="text" name="name" value={form.name} onChange={handleChange} onBlur={handleBlur}
                        placeholder="Enter your full name" required
                        className={`w-full rounded-2xl border bg-[#FCFCFD] pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${fieldBorder("name")}`}
                      />
                    </div>
                    {fieldErrors.name && <p className="text-xs text-red-500 pl-1 mt-1">{fieldErrors.name}</p>}
                  </div>

                  {/* Email — strictly @gmail.com */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Gmail Address
                      <span className="ml-2 text-xs font-normal text-neutral-400">(only @gmail.com)</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400 group-focus-within:text-[#1f4e43] transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                        placeholder="yourname@gmail.com" required
                        className={`w-full rounded-2xl border bg-[#FCFCFD] pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${fieldBorder("email")}`}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-xs text-red-500 pl-1 mt-1">{fieldErrors.email}</p>}
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-neutral-700">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400 group-focus-within:text-[#1f4e43] transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input type="password" name="password" value={form.password} onChange={handleChange} onBlur={handleBlur}
                          placeholder="Min 8 chars + number" required
                          className={`w-full rounded-2xl border bg-[#FCFCFD] pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${fieldBorder("password")}`}
                        />
                      </div>
                      {fieldErrors.password && <p className="text-xs text-red-500 pl-1 mt-1">{fieldErrors.password}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-neutral-700">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400 group-focus-within:text-[#1f4e43] transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} onBlur={handleBlur}
                          placeholder="Confirm password" required
                          className={`w-full rounded-2xl border bg-[#FCFCFD] pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${fieldBorder("password_confirmation")}`}
                        />
                      </div>
                      {fieldErrors.password_confirmation && <p className="text-xs text-red-500 pl-1 mt-1">{fieldErrors.password_confirmation}</p>}
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-6 py-3.5 text-base font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <span>Create My Account</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200"></div></div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-4 text-neutral-500 font-medium">Already a member?</span>
                    </div>
                  </div>
                  <Link to="/login" className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e7eb] px-6 py-3.5 text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 hover:border-[#1f4e43] transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Login to Your Account</span>
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-2 rounded-2xl bg-[#DCFCE7] px-2 py-3">
                    <div className="w-9 h-9 mx-auto rounded-full bg-white/80 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-medium text-neutral-700">Verified Counselors</p>
                  </div>
                  <div className="space-y-2 rounded-2xl bg-[#E0F2FE] px-2 py-3">
                    <div className="w-9 h-9 mx-auto rounded-full bg-white/80 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-medium text-neutral-700">100% Private</p>
                  </div>
                  <div className="space-y-2 rounded-2xl bg-[#FCE7F3] px-2 py-3">
                    <div className="w-9 h-9 mx-auto rounded-full bg-white/80 flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-medium text-neutral-700">24/7 Support</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
