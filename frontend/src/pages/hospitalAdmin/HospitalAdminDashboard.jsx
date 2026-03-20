// src/pages/hospital-admin/HospitalAdminDashboard.jsx
import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAdminInfo, logout } from "../../utils/adminAuth";

export default function HospitalAdminDashboard() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const admin = useMemo(() => getAdminInfo(), []);
  const hospitalName =
    admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const handleLogout = () => {
    logout();
    nav("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-[#102a2a] flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="hidden md:flex w-[272px] border-r border-black/5 bg-[#f8faf7] relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-4 h-28 w-28 rounded-full bg-[#d8ebe4]/70 blur-2xl" />
          <div className="absolute bottom-8 right-3 h-28 w-28 rounded-full bg-[#f0e8d8]/70 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full flex-col p-4">
          <div className="rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#0f2d2b] text-white flex items-center justify-center font-bold text-sm">
                MH
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.26em] text-[#6f6e6a]">HOSPITAL ADMIN</p>
                <p className="font-semibold leading-tight truncate text-[#0f2d2b]">{hospitalName}</p>
                <p className="text-xs text-[#6b6f6a] truncate mt-1">{email}</p>
              </div>
            </div>
          </div>

          <nav className="mt-4 space-y-1.5 rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-3 shadow-sm">
            <SidebarLink
              to="/hospital-admin/dashboard"
              label="Dashboard"
              active={pathname === "/hospital-admin/dashboard"}
            />
            <SidebarLink
              to="/hospital-admin/counselors"
              label="Counselor Approval"
              active={pathname.startsWith("/hospital-admin/counselors")}
              badge="Priority"
            />
            <SidebarLink to="#" label="Appointments" disabled />
            <SidebarLink to="#" label="Schedules" disabled />
            <SidebarLink to="#" label="Reports" disabled />
            <SidebarLink to="#" label="Settings" disabled />
          </nav>

          <div className="mt-auto rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-4 shadow-sm">
            <p className="text-[11px] text-[#7c7b77]">Logged in as</p>
            <p className="text-sm font-semibold mt-1 text-[#0f2d2b]">{email}</p>
            <p className="text-[11px] text-[#6b6f6a] mt-2">
              Manage counselor verification and onboarding operations.
            </p>

            <button
              onClick={handleLogout}
              className="w-full mt-4 bg-[#0f2d2b] text-white py-3 rounded-2xl font-semibold hover:opacity-90 active:opacity-80 transition shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 relative">
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-10 h-72 w-72 bg-[#e0ece6] blur-3xl" />
          <div className="absolute top-24 left-12 h-72 w-72 bg-[#f3eadb] blur-3xl" />
        </div>

        {/* HERO HEADER */}
        <header className="relative z-20 px-5 md:px-10 pt-8 md:pt-10">
          <div className="rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-6 md:p-8 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f7fbf8] border border-[#dce9e2] px-3 py-1 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2b5f5a]" />
                  <p className="text-[10px] tracking-[0.26em] text-[#6f6e6a]">HOSPITAL MANAGEMENT</p>
                </div>
                <p className="text-sm text-[#6f6e6a] mt-4">Welcome back</p>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-1 text-[#0f2d2b] leading-tight">
                  {hospitalName}
                </h1>
                <p className="text-[#5f6562] text-sm md:text-base mt-3 max-w-2xl">
                  Manage counselor approvals, monitor operations, and keep your hospital counseling workflows running smoothly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 xl:min-w-[420px] xl:justify-end">
                <div className="flex items-center gap-2 rounded-2xl bg-white border border-black/5 px-3 py-2 shadow-sm">
                  <span className="text-xs text-[#7c7b77]">Search</span>
                  <input
                    className="bg-transparent outline-none text-sm w-full sm:w-52"
                    placeholder="Counselor name, ID, email..."
                    disabled
                  />
                </div>

                <Link
                  to="/hospital-admin/counselors"
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 bg-[#0f2d2b] text-white font-semibold text-sm hover:opacity-90 transition shadow-sm"
                >
                  Open approvals
                </Link>

                <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-black/5 bg-[#fbfaf6] px-3 py-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#2b5f5a]" />
                  <p className="text-xs text-[#4f5855] truncate max-w-[120px]">{email}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="md:hidden mt-4 bg-[#0f2d2b] text-white px-4 py-2 rounded-2xl hover:opacity-90 transition"
          >
            Logout
          </button>
        </header>

        {/* CONTENT */}
        <div className="px-5 md:px-10 pb-12 pt-7 space-y-8 relative z-10">
          {/* KPI */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending Approvals"
              value="—"
              hint="Counselors awaiting review"
              tone="amber"
            />
            <StatCard
              title="Active Counselors"
              value="—"
              hint="Approved in this hospital"
              tone="teal"
            />
            <StatCard
              title="Today's Appointments"
              value="—"
              hint="Upcoming today"
              tone="ink"
            />
            <StatCard
              title="Upcoming Sessions"
              value="—"
              hint="Next 7 days"
              tone="amber"
            />
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-1 gap-4">
            <ActionCard
              title="Counselor Approval"
              desc="Review documents, approve or reject applications, and unlock bookings."
              badge="Priority"
              to="/hospital-admin/counselors"
              buttonText="Go to approvals"
            />
            <ActionCard
              title="Appointments"
              desc="Monitor daily volume, reschedule, and track cancellations."
              badge="Next"
              disabled
              to="#"
              buttonText="Coming soon"
            />
            <ActionCard
              title="Schedules"
              desc="Control availability blocks and weekly coverage patterns."
              badge="Next"
              disabled
              to="#"
              buttonText="Coming soon"
            />
          </section>

          {/* 2-col */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* Activity */}
            <div className="lg:col-span-2 rounded-3xl bg-white/85 backdrop-blur border border-black/5 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-lg text-[#0f2d2b]">
                    Verification Queue
                  </h2>
                  <p className="text-sm text-[#6b6f6a] mt-1">
                    Recent updates from your hospital
                  </p>
                </div>
                <span className="text-xs text-[#7c7b77] rounded-full bg-[#fbf8f2] border border-black/5 px-3 py-1">
                  Last 7 days
                </span>
              </div>

              <div className="p-6">
                <div className="relative pl-3">
                  <div className="absolute left-[18px] top-2 bottom-4 w-px bg-[#dfe4dc]" />
                  <div className="space-y-4">
                    <ActivityRow
                      title="Counselor submitted verification"
                      meta="Pending review • 10 mins ago"
                    />
                    <ActivityRow
                      title="New appointment booked"
                      meta="User booked session • Today"
                    />
                    <ActivityRow
                      title="Counselor approved"
                      meta="Status updated • Yesterday"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    to="/hospital-admin/counselors"
                    className="inline-flex items-center text-sm font-semibold text-[#0f2d2b] hover:underline"
                  >
                    Go to approvals →
                  </Link>
                </div>
              </div>
            </div>

            {/* Hospital profile */}
            <div className="rounded-3xl bg-white/85 backdrop-blur border border-black/5 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5">
                <h2 className="font-extrabold text-lg text-[#0f2d2b]">
                  Hospital Profile
                </h2>
                <p className="text-sm text-[#6b6f6a] mt-1">
                  Basic details (read-only)
                </p>
              </div>

              <div className="p-6 space-y-4 text-sm text-[#2a3a3a]">
                <div className="rounded-2xl border border-black/5 bg-[#f9faf7] p-4 shadow-sm">
                  <p className="text-[11px] tracking-[0.2em] text-[#7c7b77] uppercase">Profile Summary</p>
                  <p className="mt-1 text-sm font-semibold text-[#0f2d2b] truncate">{hospitalName}</p>
                  <p className="text-xs text-[#6b6f6a] mt-1 truncate">{email}</p>
                </div>

                <InfoLine label="Hospital" value={hospitalName} />
                <InfoLine label="Hospital ID" value={admin?.hospital_id || "—"} />
                <InfoLine label="Admin Email" value={email} />

                <div className="pt-4">
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl border border-dashed border-black/10 bg-[#fbf8f2] text-[#9a968f] cursor-not-allowed shadow-sm"
                  >
                    Edit Profile (Next)
                  </button>
                </div>

                <div className="pt-2">
                  <div className="rounded-2xl bg-[#0f2d2b]/5 border border-black/5 p-4 shadow-sm">
                    <p className="text-xs text-[#6b6f6a]">
                      Tip: Approve counselors first so users can start booking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="text-xs text-[#6b6f6a]">
            Tip: Use <span className="font-semibold">Counselor Approval</span> to
            verify and onboard counselors before users can book sessions.
          </div>
        </div>
      </main>
    </div>
  );
}

/* ===== Small UI components ===== */

function SidebarLink({ to, label, active, disabled, badge }) {
  const base =
    "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200";
  const enabledStyle = active
    ? "bg-[#eef5f2] text-[#0f2d2b] ring-1 ring-[#d7e5df] shadow-sm"
    : "hover:bg-[#f2f6f3] text-[#4f5855]";
  const disabledStyle =
    "bg-[#f6f8f6] text-[#98a09d] cursor-not-allowed ring-1 ring-[#e8ece8]";

  if (disabled) {
    return (
      <div className={`${base} ${disabledStyle}`}>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c4cbc8]" />
          {label}
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-white border border-[#e2e6e3]">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link to={to} className={`${base} ${enabledStyle}`}>
      <span className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#2b5f5a]" : "bg-[#b7bfbc]"}`} />
        {label}
        {badge ? (
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#f4b860]/15 text-[#915c10] border border-[#f4b860]/25">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[10px] px-2 py-1 rounded-full bg-white border border-[#e2e6e3] text-[#6b6f6a]">
        Go
      </span>
    </Link>
  );
}

function StatCard({ title, value, hint, tone }) {
  const toneMap = {
    amber: {
      chip: "bg-[#f4b860]/20 text-[#915c10] border-[#f4b860]/25",
      dot: "bg-[#f4b860]",
      bg: "from-[#fff9ed] to-[#fffdf7]",
    },
    teal: {
      chip: "bg-[#2b5f5a]/15 text-[#0f2d2b] border-[#2b5f5a]/25",
      dot: "bg-[#2b5f5a]",
      bg: "from-[#f1f8f5] to-[#fbfdfa]",
    },
    ink: {
      chip: "bg-[#0f2d2b]/10 text-[#0f2d2b] border-black/10",
      dot: "bg-[#0f2d2b]",
      bg: "from-[#f3f6f5] to-[#fbfcfb]",
    },
  };
  const t = toneMap[tone] || toneMap.ink;

  return (
    <div className={`rounded-3xl border border-black/5 shadow-sm p-5 hover:shadow-md transition bg-gradient-to-br ${t.bg}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7c7b77] uppercase tracking-wide">{title}</p>
        <span
          className={`text-[10px] px-2 py-1 rounded-full border ${t.chip}`}
        >
          Live
        </span>
      </div>

      <div className="flex items-end justify-between mt-2">
        <div>
          <h3 className="text-3xl font-extrabold text-[#0f2d2b]">{value}</h3>
          <p className="text-sm text-[#6b6f6a] mt-1">{hint}</p>
        </div>

        <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center border border-black/5 shadow-sm">
          <div className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, badge, to, buttonText, disabled }) {
  const wrap =
    "rounded-3xl bg-white/85 backdrop-blur border border-black/5 shadow-sm p-6 flex items-center justify-between gap-6 hover:shadow-md transition";
  const btnEnabled =
    "w-full mt-5 bg-[#0f2d2b] text-white py-3 rounded-2xl hover:opacity-90 active:opacity-80 text-sm font-semibold transition text-center shadow-sm";
  const btnDisabled =
    "w-full mt-5 bg-[#fbf8f2] text-[#a09a91] py-3 rounded-2xl cursor-not-allowed text-sm font-semibold border border-black/5";

  return (
    <div className={wrap}>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-[#f3f6f3] border border-black/5 flex items-center justify-center shadow-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-[#2b5f5a]" />
        </div>

        <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-[#0f2d2b]">{title}</h3>
          <span className="text-[10px] px-2 py-1 rounded-full border border-black/5 bg-[#fbf8f2] text-[#6b6f6a] shadow-sm">
            {badge}
          </span>
        </div>
        <p className="text-sm text-[#5f6562] mt-2">{desc}</p>
        </div>
      </div>

      <div className="w-full max-w-[180px]">
        {disabled ? (
          <button disabled className={btnDisabled}>
            {buttonText}
          </button>
        ) : (
          <Link to={to} className={btnEnabled}>
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ title, meta }) {
  return (
    <div className="relative flex items-start gap-3 rounded-2xl border border-black/5 bg-[#fcfaf6] px-3 py-3 ml-3">
      <div className="absolute -left-[18px] top-5 h-3 w-3 rounded-full bg-[#2b5f5a] border border-white shadow-sm" />
      <div className="h-10 w-10 rounded-2xl bg-[#0f2d2b]/10 flex items-center justify-center border border-black/5 shadow-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-[#0f2d2b]" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-[#132f2e]">{title}</p>
        <p className="text-xs text-[#7c7b77] mt-1">{meta}</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-black/5 bg-[#fcfaf6] px-4 py-3">
      <p className="text-[#7c7b77]">{label}</p>
      <p className="font-semibold text-right text-[#0f2d2b]">{value}</p>
    </div>
  );
}
