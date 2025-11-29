import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/register-counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Signup failed");
      }

      const data = await res.json();

      // Save token + user info (like user signup)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to counselor dashboard (you will create later)
      navigate("/counselor/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#222] text-center">
          Counselor Signup
        </h1>
        <p className="mt-2 text-sm text-center text-[#6b6762]">
          Join MannSathi as a counselor and support people on their healing journey.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-[#444] mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#444] mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[#444] mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#444] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#444] mb-1">
              Specialization (e.g., Anxiety, Couples)
            </label>
            <input
              type="text"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[#444] mb-1">
                License / Registration No.
              </label>
              <input
                type="text"
                name="license_no"
                value={form.license_no}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#444] mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience_years"
                value={form.experience_years}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4]"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#444] mb-1">Short Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-xl border border-[#e4d9cb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9ed9b4] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[#215c4c] text-white py-2.5 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Creating account..." : "Sign up as Counselor"}
          </button>
        </form>
      </div>
    </div>
  );
}
