import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
      setForm((prev) => ({ ...prev, [name]: files[0] }));
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

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value);
    });

    try {
      const res = await fetch(
        "http://localhost:8000/api/register-counselor",
        {
          method: "POST",
          body: payload,
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) {
          const firstField = Object.keys(data.errors)[0];
          setError(data.errors[firstField][0]);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Signup failed. Please try again.");
        }
        return;
      }

      alert(
        "Counselor account created successfully. Your account is pending verification."
      );
      navigate("/counselor/login");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-28 pb-12">
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
      <main className="mx-auto max-w-3xl">
        <div className="bg-white rounded-3xl border border-[#efe7dc]
                        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                        px-8 py-10">

          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Counselor Signup 🌿
          </h1>
          <p className="text-sm text-neutral-600 mb-6">
            All counselor accounts require verification before going live.
          </p>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* BASIC INFO */}
            <Input label="Full Name" name="name" onChange={handleChange} />
            <Input label="Email" name="email" type="email" onChange={handleChange} />

            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Password" name="password" type="password" onChange={handleChange} />
              <Input
                label="Confirm Password"
                name="password_confirmation"
                type="password"
                onChange={handleChange}
              />
            </div>

            <Input
              label="Specialization"
              name="specialization"
              placeholder="Anxiety, Depression, Couples"
              onChange={handleChange}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="License / Registration Number"
                name="license_no"
                onChange={handleChange}
              />
              <Input
                label="Years of Experience"
                name="experience_years"
                type="number"
                min="0"
                onChange={handleChange}
              />
            </div>

            {/* FILE UPLOADS */}
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

            <textarea
              name="bio"
              rows="3"
              placeholder="Short professional bio"
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                         px-4 py-3 text-sm outline-none resize-none
                         focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
            />

            {/* CONSENT */}
            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="consent"
                onChange={handleChange}
                className="mt-1"
              />
              I confirm that the information and documents provided are genuine and
              agree to verification by the MannSathi team.
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                         px-5 py-3 text-sm font-semibold text-[#305b39]
                         shadow-[0_4px_0_0_#89ad8f]
                         hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f]
                         transition disabled:opacity-70"
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

/* ---------- Small reusable inputs ---------- */

function Input({ label, name, type = "text", placeholder, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-800 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        {...props}
        className="w-full rounded-2xl border border-[#e3ded0] bg-[#fffdf7]
                   px-4 py-3 text-sm outline-none
                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
      />
    </div>
  );
}

function FileInput({ label, name, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-800 mb-2">
        {label}
      </label>
      <input
        type="file"
        name={name}
        {...props}
        className="w-full rounded-2xl border border-dashed border-[#cfe2da]
                   bg-[#fffdf7] px-4 py-3 text-sm"
      />
    </div>
  );
}
