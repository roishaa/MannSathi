import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear whatever you stored after login
    localStorage.removeItem("authToken");
    localStorage.removeItem("user"); // optional if you store user info

    // redirect to login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-[#255b4e] to-[#466f64] text-white px-6 py-8 flex flex-col justify-between">
        {/* Top logo + avatar */}
        <div>
          {/* Logo ribbon style */}
          <div className="relative mb-10">
            <div className="w-40 h-12 bg-[#1e4940] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </div>

          {/* Avatar block */}
          <div className="bg-[#2e6d61]/50 rounded-2xl px-4 py-5 text-center mb-8 shadow-md shadow-black/10">
            <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-b from-[#f5fbf7] to-[#e1efe7] flex items-center justify-center ring-4 ring-[#1e4940]/40 mb-4">
              <span className="text-3xl">🙂</span>
            </div>
            <p className="text-xs text-[#d6ebe2] mb-1">
              Check your condition
            </p>
            <button className="mt-1 inline-flex items-center justify-center rounded-full bg-white text-[#1f4e43] text-xs font-semibold px-4 py-2 shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:-translate-y-[1px] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.18)] transition">
              Check it now
            </button>
          </div>

          {/* Nav links */}
          <nav className="space-y-2 text-sm">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-full bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-sm">
              <span className="text-base">🏠</span>
              <span>Dashboard</span>
            </button>

            <Link
              to="/search-doctor"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#315d51] transition"
            >
              <span className="text-base">🧑‍⚕️</span>
              <span>Search Doctor</span>
            </Link>

            <Link
              to="/sessions"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#315d51] transition"
            >
              <span className="text-base">📅</span>
              <span>Sessions</span>
            </Link>

            <Link
              to="/settings"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#315d51] transition"
            >
              <span className="text-base">⚙️</span>
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-8 text-xs underline text-[#dfeee7] text-left hover:text-white"
        >
          Logout
        </button>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 px-10 py-8">
        {/* Top bar (greeting + icons) */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-[#1e293b]">
              Hi, Roisha Maharjan<span className="text-[#64748b]"> 👋</span>
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Here’s a quick overview of your emotional space today.
            </p>

            {/* small chips */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Mood check pending
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
                <span>📅</span> 0 upcoming sessions
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e4da] px-3 py-1 shadow-sm">
                <span>⏱</span> Last session: not yet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm hover:bg-[#f3f4f6]">
              🔔
            </button>
            <button className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm hover:bg-[#f3f4f6]">
              🧑
            </button>
          </div>
        </div>

        {/* CATEGORIES */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#111827]">
              Categories
            </h2>
            <button className="text-xs text-[#4b5563] hover:text-[#1f4e43] underline">
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: "💬", label: "Stress & Anxiety", chip: "Popular" },
              { icon: "🌙", label: "Sleep & Rest", chip: "New" },
              { icon: "🧠", label: "Self-esteem", chip: "Recommended" },
            ].map((c) => (
              <button
                key={c.label}
                className="group bg-white rounded-3xl px-4 py-5 text-left shadow-sm border border-[#e5e7eb] hover:-translate-y-[2px] hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-[#e3f3e6] flex items-center justify-center text-lg">
                    {c.icon}
                  </div>
                  <span className="text-[11px] rounded-full bg-[#ecf5ef] text-[#1f4e43] px-2 py-0.5">
                    {c.chip}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#111827] mb-1">
                  {c.label}
                </p>
                <p className="text-xs text-[#6b7280]">
                  Explore exercises and short reads to support you.
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* BOOK APPOINTMENT SHORTCUT */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#111827]">
              Book appointment
            </h2>
            <Link
              to="/book-appointment"
              className="text-xs text-[#1f4e43] font-medium underline"
            >
              See all doctors
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Dr. Anjana Shrestha", tag: "Anxiety • Online" },
              { name: "Mr. Kiran Gurung", tag: "Stress • In-person" },
              { name: "Ms. Sita Lama", tag: "Teens • Online" },
            ].map((d) => (
              <div
                key={d.name}
                className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-[#e5e7eb] flex flex-col justify-between hover:shadow-md hover:-translate-y-[2px] transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#e3f3e6] flex items-center justify-center text-sm">
                    👩‍⚕️
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {d.name}
                    </p>
                    <p className="text-[11px] text-[#6b7280]">{d.tag}</p>
                  </div>
                </div>
                <Link
                  to="/book-appointment"
                  className="self-start mt-1 text-xs rounded-full bg-[#1f4e43] text-white px-3 py-1.5 hover:bg-[#173a32] transition"
                >
                  Book a slot
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* UPCOMING SESSIONS */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">
            Upcoming Sessions
          </h2>

          <div className="bg-white rounded-3xl px-6 py-5 border border-[#e5e7eb] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#e3f3e6] flex items-center justify-center text-lg">
                📅
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">
                  No sessions booked yet
                </p>
                <p className="text-xs text-[#6b7280]">
                  When you book a session, it will appear here with date and
                  time.
                </p>
              </div>
            </div>
            <Link
              to="/book-appointment"
              className="text-xs rounded-full border border-[#1f4e43] text-[#1f4e43] px-4 py-2 hover:bg-[#1f4e43] hover:text-white transition"
            >
              Book first session
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
