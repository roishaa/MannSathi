import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [form, setForm] = useState({
    name: user.name || user.full_name || "",
    pseudonym: user.pseudonym || "",
    email: user.email || "",
    phone: user.phone || user.number || "",
  });

  const [msg, setMsg] = useState("");

  const userName =
    form.pseudonym || form.name || user?.pseudonym || user?.name || user?.full_name || "LotusMind 🌸";
  const userEmail = form.email || user?.email || "user@email.com";

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const save = () => {
    setMsg("");
    const updated = { ...user, ...form };
    localStorage.setItem("user", JSON.stringify(updated));
    setMsg("✅ Changes saved successfully.");
  };

  const navItems = [
    { label: "Dashboard", to: "/users/dashboard", icon: "🏠" },
    { label: "Search Counselor", to: "/search-doctor", icon: "🧑‍⚕️" },
    { label: "Sessions", to: "/sessions", icon: "📅" },
    { label: "Resources", to: "/resources", icon: "📚" },
    { label: "Payments", to: "/payments", icon: "💳" },
    { label: "Settings", to: "/settings", icon: "⚙️" },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-[#e6e5df] bg-white/90 backdrop-blur-xl">
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dadbd3] bg-white text-[#1f4e43] shadow-sm transition hover:bg-[#f7f8f5]"
          >
            ☰
          </button>
          <div className="text-center">
            <p className="font-serif text-lg font-semibold tracking-wide text-[#1f4e43]">MannSathi</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-[#dadbd3] bg-white px-3.5 py-2 text-xs font-semibold text-[#27584d] shadow-sm transition hover:bg-[#f7f8f5]"
          >
            Logout
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[#1f4e43]/35 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#215c4c] via-[#2b6557] to-[#3f7164] text-white px-6 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="font-serif font-semibold text-xl tracking-wide">MannSathi</div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="mt-1 text-xs text-[#d6ebe2]">{userEmail}</p>
            </div>

            <nav className="mt-7 space-y-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive(item.to)
                      ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_8px_24px_rgba(20,43,37,0.18)]"
                      : "text-white/95 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-8 inline-flex rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#e4efe9]"
            >
              Logout
            </button>
          </aside>
        </div>
      )}

      <aside className="w-80 hidden md:flex bg-gradient-to-b from-[#255b4e] via-[#2d6154] to-[#466f64] text-white px-7 py-8 flex-col justify-between">
        <div>
          <div className="mb-10 rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🌿</div>
              <div>
                <p className="font-serif text-2xl font-semibold tracking-wide">MannSathi</p>
                <p className="text-[11px] text-[#d6ebe2]">Mental wellness space</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">🧑</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-[#d6ebe2] truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive(item.to)
                    ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]"
                    : "text-white/95 hover:bg-white/10"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-left text-[#e2efe8] hover:text-white"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 px-4 md:px-10 xl:px-14 py-6 md:py-10 pt-24 md:pt-10 bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)]">
        <div className="mb-8 rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">Account Settings</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Manage your profile
              </h1>
              <p className="mt-3 text-sm md:text-base text-[#5f6d68] font-medium">
                Update your personal details and keep your profile information current.
              </p>
            </div>

            <button
              onClick={save}
              className="px-5 py-2.5 bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition shadow-md w-fit"
            >
              Save changes
            </button>
          </div>
        </div>

        {msg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1f4e43]">Profile Information</h2>
              <p className="mt-1 text-sm text-[#6a7772]">These details are stored locally for now.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7f8c87] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-[#dcded6] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#88b2a6] focus:ring-2 focus:ring-[#d7ebe4]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7f8c87] mb-2">
                  Pseudonym
                </label>
                <input
                  type="text"
                  value={form.pseudonym}
                  onChange={(e) => setForm({ ...form, pseudonym: e.target.value })}
                  className="w-full rounded-2xl border border-[#dcded6] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#88b2a6] focus:ring-2 focus:ring-[#d7ebe4]"
                  placeholder="Display name or nickname"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7f8c87] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-2xl border border-[#dcded6] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#88b2a6] focus:ring-2 focus:ring-[#d7ebe4]"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7f8c87] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-2xl border border-[#dcded6] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#88b2a6] focus:ring-2 focus:ring-[#d7ebe4]"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <button
              onClick={save}
              className="mt-6 w-full md:w-auto rounded-2xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              Save Changes
            </button>
          </section>

          <aside className="rounded-3xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] text-2xl">
                🧑
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[#1f4e43] truncate">{userName}</h3>
                <p className="text-sm text-[#6a7772] truncate">{userEmail}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-[#edf0e8] bg-[#fbfcfa] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-[#8f9a95] font-semibold">Full Name</p>
                <p className="mt-1 text-sm font-medium text-[#1f2937]">{form.name || "Not set"}</p>
              </div>

              <div className="rounded-2xl border border-[#edf0e8] bg-[#fbfcfa] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-[#8f9a95] font-semibold">Pseudonym</p>
                <p className="mt-1 text-sm font-medium text-[#1f2937]">{form.pseudonym || "Not set"}</p>
              </div>

              <div className="rounded-2xl border border-[#edf0e8] bg-[#fbfcfa] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-[#8f9a95] font-semibold">Email</p>
                <p className="mt-1 text-sm font-medium text-[#1f2937] break-all">{form.email || "Not set"}</p>
              </div>

              <div className="rounded-2xl border border-[#edf0e8] bg-[#fbfcfa] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-[#8f9a95] font-semibold">Phone Number</p>
                <p className="mt-1 text-sm font-medium text-[#1f2937]">{form.phone || "Not set"}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}