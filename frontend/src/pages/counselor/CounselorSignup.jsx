import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";

// ─── Validation ───────────────────────────────────────────────────────────────
const isValidCounselorEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@mannsathi\.com$/.test(email.trim().toLowerCase());

const validateSignupForm = ({ name, email, password, password_confirmation, specialization, license_no, experience_years, consent }) => {
  if (!name.trim())
    return { field: "name", message: "Full name is required." };
  if (name.trim().length < 2)
    return { field: "name", message: "Name must be at least 2 characters." };

  if (!email.trim())
    return { field: "email", message: "Email address is required." };
  if (!isValidCounselorEmail(email))
    return { field: "email", message: "Only @mannsathi.com email addresses are allowed for counselor accounts." };

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

  if (!specialization.trim())
    return { field: "specialization", message: "Specialization is required." };

  if (!license_no.trim())
    return { field: "license_no", message: "License / Registration number is required." };

  if (!experience_years && experience_years !== 0)
    return { field: "experience_years", message: "Years of experience is required." };
  if (Number(experience_years) < 0)
    return { field: "experience_years", message: "Experience years cannot be negative." };

  if (!consent)
    return { field: "consent", message: "You must confirm that the information provided is genuine." };

  return null;
};

export default function CounselorSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    specialization: "",
    license_no: "",
    experience_years: "",
    bio: "",
    license_document: null,
    degree_document: null,
    id_document: null,
    consent: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
  };

  // Per-field inline validation on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        if (value && value.trim().length < 2)
          setFieldErrors((p) => ({ ...p, name: "Name must be at least 2 characters." }));
        break;
      case "email":
        if (value && !isValidCounselorEmail(value))
          setFieldErrors((p) => ({
            ...p,
            email: "Only @mannsathi.com email addresses are allowed.",
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
      case "experience_years":
        if (value && Number(value) < 0)
          setFieldErrors((p) => ({ ...p, experience_years: "Experience years cannot be negative." }));
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
      // Scroll to top of form so error is visible
      window.scrollTo({ top: 0, behavior: "smooth" });
      return; // ← API never called with invalid data
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value === null) return;
        payload.append(key, value);
      });

      await api.post("/register-counselor", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        "Counselor account created successfully. Your account is pending verification by the hospital."
      );
      navigate("/counselor/login", { replace: true });
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      if (err.response?.data?.errors) {
        const firstField = Object.keys(err.response.data.errors)[0];
        const msg = err.response.data.errors[firstField]?.[0] || "Validation error.";
        setFieldErrors({ [firstField]: msg });
        setError(msg);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Signup failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fbf8_0%,_#f4f7f2_48%,_#f6f1e7_100%)] px-4 sm:px-6 pt-28 pb-12">
      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="relative block select-none">
            <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">MannSathi</span>
            </div>
          </Link>
          <Link
            to="/counselor/login"
            className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-6 py-2.5 text-sm font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition"
          >
            Counselor Login
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-5xl">
        <div className="relative min-h-[72vh] flex items-center justify-center py-6 md:py-10">
          <div className="pointer-events-none absolute -top-4 left-4 h-64 w-64 rounded-full bg-[#dff1e6]/70 blur-3xl" />
          <div className="pointer-events-none absolute top-40 -right-6 h-72 w-72 rounded-full bg-[#f6e7d8]/60 blur-3xl" />

          <div className="relative w-full max-w-3xl rounded-3xl border border-[#ebe4d7] bg-white/92 shadow-[0_26px_74px_rgba(28,60,50,0.12)] p-8 md:p-10">
            <div className="mb-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f877f]">
                MannSathi Counselor Onboarding
              </p>
              <h1 className="text-3xl md:text-[32px] font-semibold text-[#1f2f2a] leading-tight">
                Counselor Signup 🌿
              </h1>
              <p className="text-sm text-neutral-600">
                All counselor accounts require verification before going live.
              </p>
              {/* Domain restriction notice */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9e2cf] bg-[#f0faf2] px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#4caf72]" />
                <span className="text-xs font-medium text-[#305b39]">
                  Requires a <strong>@mannsathi.com</strong> email address
                </span>
              </div>
            </div>

            {/* Global error banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* ── Basic Information ── */}
              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Basic Information</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Share your core details to create your counselor profile.</p>
                </div>

                <div className="grid gap-5">
                  <ValidatedInput
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldErrors.name}
                    placeholder="Dr. Jane Smith"
                  />

                  <ValidatedInput
                    label="Email Address"
                    sublabel="only @mannsathi.com"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldErrors.email}
                    placeholder="yourname@mannsathi.com"
                  />

                  <div className="grid md:grid-cols-2 gap-5">
                    <ValidatedInput
                      label="Password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.password}
                      placeholder="Min 8 chars + number"
                      autoComplete="new-password"
                    />
                    <ValidatedInput
                      label="Confirm Password"
                      name="password_confirmation"
                      type="password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.password_confirmation}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </section>

              {/* ── Professional Details ── */}
              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Professional Details</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Help clients understand your expertise and background.</p>
                </div>

                <div className="grid gap-5">
                  <ValidatedInput
                    label="Specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldErrors.specialization}
                    placeholder="Anxiety, Depression, Couples"
                  />

                  <div className="grid md:grid-cols-2 gap-5">
                    <ValidatedInput
                      label="License / Registration Number"
                      name="license_no"
                      value={form.license_no}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.license_no}
                    />
                    <ValidatedInput
                      label="Years of Experience"
                      name="experience_years"
                      type="number"
                      min="0"
                      value={form.experience_years}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldErrors.experience_years}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-neutral-800">
                      Short Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      rows="3"
                      placeholder="Short professional bio"
                      value={form.bio}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7] px-4 py-3 text-sm text-[#243630] outline-none resize-none transition focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                    />
                  </div>
                </div>
              </section>

              {/* ── Document Uploads ── */}
              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Document Uploads</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Upload your verification documents for secure approval.</p>
                </div>

                <div className="grid gap-5">
                  <FileInput label="License / Registration Document" name="license_document" onChange={handleChange} required />
                  <FileInput label="Degree / Certification Document" name="degree_document" onChange={handleChange} required />
                  <FileInput label="Government ID (optional)" name="id_document" onChange={handleChange} />
                </div>
              </section>

              {/* ── Consent ── */}
              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Consent</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Please review and confirm before submission.</p>
                </div>

                <label className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm text-neutral-700 cursor-pointer transition ${fieldErrors.consent ? "border-red-300 bg-red-50" : "border-[#d8e7de] bg-[#f6fbf8]"}`}>
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  I confirm that the information and documents provided are genuine and agree to
                  verification by the MannSathi team.
                </label>
                {fieldErrors.consent && (
                  <p className="text-xs text-red-500 pl-1">{fieldErrors.consent}</p>
                )}
              </section>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border border-[#89ad8f] bg-gradient-to-b from-[#e8f5ea] to-[#d9eddc] px-5 py-3.5 text-sm font-semibold text-[#305b39] shadow-[0_10px_24px_rgba(101,143,108,0.25)] hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(101,143,108,0.32)] transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit for Verification"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Reusable input with inline error support ─────────────────────────────────
function ValidatedInput({ label, sublabel, name, type = "text", placeholder, value, error, onBlur, ...props }) {
  const borderClass = error
    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
    : "border-[#e3ded0] focus:border-[#89ad8f] focus:ring-[#c9e2cf]";

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-neutral-800">
        {label}
        {sublabel && (
          <span className="ml-2 text-xs font-normal text-neutral-400">({sublabel})</span>
        )}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onBlur={onBlur}
        {...props}
        className={`w-full rounded-2xl border bg-[#fffdf7] px-4 py-3 text-sm text-[#243630] outline-none transition focus:ring-2 ${borderClass}`}
      />
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
}

function FileInput({ label, name, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id={name}
        type="file"
        name={name}
        {...props}
        className="w-full rounded-2xl border border-dashed border-[#cfe2da] bg-[#fffdf7] px-4 py-3 text-sm text-[#385147] file:mr-3 file:rounded-full file:border-0 file:bg-[#e3f3e6] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#305b39]"
      />
    </div>
  );
}