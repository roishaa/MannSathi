import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function CounselorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }

      const data = await res.json();

      if (data.user.role !== "counselor") {
        throw new Error("This account is not a counselor account.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/counselor/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#222] text-center">
          Counselor Login
        </h1>
        <p className="mt-2 text-sm text-center text-[#6b6762]">
          Log in to manage your sessions and connect with clients.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[#215c4c] text-white py-2.5 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Logging in..." : "Login as Counselor"}
          </button>
        </form>

        {/* NEW: Counselor Signup Link */}
        <p className="mt-5 text-sm text-center text-[#6b6762]">
          Don&apos;t have a counselor account?{" "}
          <Link
            to="/counselor/signup"
            className="text-[#215c4c] font-semibold hover:underline"
          >
            Sign up as Counselor
          </Link>
        </p>
      </div>
    </div>
  );
}
