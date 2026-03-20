import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";

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

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.consent) {
      setError("You must confirm that the information provided is genuine.");
      return;
    }

    setLoading(true);

    try {
      // Build multipart payload
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        // skip null file fields
        if (value === null) return;
        payload.append(key, value);
      });

      const { data } = await api.post("/register-counselor", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(
        "Counselor account created successfully. Your account is pending verification by the hospital."
      );
      navigate("/counselor/login", { replace: true });
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      if (err.response?.data?.errors) {
        const firstField = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstField]?.[0] || "Validation error.");
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
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </Link>

          <Link
            to="/counselor/login"
            className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                       px-6 py-2.5 text-sm font-semibold text-[#305b39]
                       shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                       hover:shadow-[0_3px_0_0_#89ad8f] transition"
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

          <div
            className="relative w-full max-w-3xl rounded-3xl border border-[#ebe4d7] bg-white/92
                       shadow-[0_26px_74px_rgba(28,60,50,0.12)] p-8 md:p-10"
          >
            <div className="mb-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f877f]">MannSathi Counselor Onboarding</p>
              <h1 className="text-3xl md:text-[32px] font-semibold text-[#1f2f2a] leading-tight">
                Counselor Signup 🌿
              </h1>
              <p className="text-sm text-neutral-600">
                All counselor accounts require verification before going live.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Basic Information</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Share your core details to create your counselor profile.</p>
                </div>

                <div className="grid gap-5">
                  <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
                  <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />

                  <div className="grid md:grid-cols-2 gap-5">
                    <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
                    <Input
                      label="Confirm Password"
                      name="password_confirmation"
                      type="password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Professional Details</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Help clients understand your expertise and background.</p>
                </div>

                <div className="grid gap-5">
                  <Input
                    label="Specialization"
                    name="specialization"
                    placeholder="Anxiety, Depression, Couples"
                    value={form.specialization}
                    onChange={handleChange}
                  />

                  <div className="grid md:grid-cols-2 gap-5">
                    <Input
                      label="License / Registration Number"
                      name="license_no"
                      value={form.license_no}
                      onChange={handleChange}
                    />
                    <Input
                      label="Years of Experience"
                      name="experience_years"
                      type="number"
                      min="0"
                      value={form.experience_years}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-800 mb-2">Short Professional Bio</label>
                    <textarea
                      name="bio"
                      rows="3"
                      placeholder="Short professional bio"
                      value={form.bio}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                                 px-4 py-3 text-sm text-[#243630] outline-none resize-none transition
                                 focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Document Uploads</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Upload your verification documents for secure approval.</p>
                </div>

                <div className="grid gap-5">
                  <FileInput
                    label="License / Registration Document"
                    name="license_document"
                    onChange={handleChange}
                    required
                  />
                  <FileInput
                    label="Degree / Certification Document"
                    name="degree_document"
                    onChange={handleChange}
                    required
                  />
                  <FileInput
                    label="Government ID (optional)"
                    name="id_document"
                    onChange={handleChange}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-[#e8e4d9] bg-[#fcfdfa] p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f4e43]">Consent</h2>
                  <p className="mt-1 text-xs text-[#6b7772]">Please review and confirm before submission.</p>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-[#d8e7de] bg-[#f6fbf8] px-4 py-3 text-sm text-neutral-700">
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
              </section>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border border-[#89ad8f] bg-gradient-to-b from-[#e8f5ea] to-[#d9eddc]
                           px-5 py-3.5 text-sm font-semibold text-[#305b39]
                           shadow-[0_10px_24px_rgba(101,143,108,0.25)]
                           hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(101,143,108,0.32)]
                           transition disabled:opacity-70"
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

/* ---------- Small reusable inputs ---------- */

function Input({ label, name, type = "text", placeholder, value, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete={
          name === "email"
            ? "email"
            : name === "password"
            ? "new-password"
            : name === "password_confirmation"
            ? "new-password"
            : "off"
        }
        {...props}
        className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                   px-4 py-3 text-sm text-[#243630] outline-none transition
                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
      />
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
        className="w-full rounded-2xl border border-dashed border-[#cfe2da]
                   bg-[#fffdf7] px-4 py-3 text-sm text-[#385147]
                   file:mr-3 file:rounded-full file:border-0 file:bg-[#e3f3e6]
                   file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#305b39]"
      />
    </div>
  );
}
