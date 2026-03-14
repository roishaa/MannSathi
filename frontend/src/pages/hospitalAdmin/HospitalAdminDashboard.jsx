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
    <div className="min-h-screen bg-[#f6f5f1] text-[#102a2a] flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="hidden md:flex w-[290px] bg-[#0f2d2b] text-white flex-col relative overflow-hidden">
        {/* subtle blobs */}
        <div className="absolute -top-14 -right-16 h-48 w-48 rounded-full bg-[#f4b860]/20 blur-xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#2b5f5a]/35 blur-xl" />

        <div className="px-6 pt-7 pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
              <div className="h-6 w-6 rounded-lg bg-[#f4b860]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.28em] text-white/60">
                HOSPITAL ADMIN
              </p>
              <p className="font-semibold leading-tight truncate">
                {hospitalName}
              </p>
              <p className="text-xs text-white/60 truncate mt-1">{email}</p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-5 space-y-1 relative z-10">
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

        <div className="mt-auto p-4 border-t border-white/10 relative z-10">
          <div className="rounded-2xl p-4 bg-white/5 ring-1 ring-white/10">
            <p className="text-[11px] text-white/60">Logged in as</p>
            <p className="text-sm font-semibold mt-1">{email}</p>
            <p className="text-[11px] text-white/50 mt-2">
              Manage counselor verification & onboarding.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-[#f4b860] text-[#0f2d2b] py-3 rounded-2xl font-semibold hover:opacity-90 active:opacity-80 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 relative">
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-72 w-72 bg-[#f4b860]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 bg-[#2b5f5a]/20 blur-3xl" />
        </div>

        {/* TOP BAR */}
        <header className="sticky top-0 z-20 backdrop-blur bg-[#f6f5f1]/70 border-b border-black/5">
          <div className="px-5 md:px-10 py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.35em] text-[#6f6e6a]">
                OPERATIONS
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold mt-1 text-[#0f2d2b]">
                Hospital Command Center
              </h1>
              <p className="text-[#5f6562] text-sm mt-1 truncate">
                Welcome back, <span className="font-semibold">{email}</span>
              </p>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-2xl bg-white/70 border border-black/5 px-3 py-2 shadow-sm">
                <span className="text-xs text-[#7c7b77]">Search</span>
                <input
                  className="bg-transparent outline-none text-sm w-56"
                  placeholder="Counselor name, ID, email..."
                  disabled
                />
              </div>

              <Link
                to="/hospital-admin/counselors"
                className="hidden md:inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-[#0f2d2b] text-white font-semibold text-sm hover:opacity-90 transition"
              >
                Open approvals
              </Link>

              <button
                onClick={handleLogout}
                className="md:hidden bg-[#0f2d2b] text-white px-4 py-2 rounded-2xl hover:opacity-90 transition"
              >
                Logout
              </button>
            </div>
          </div>
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
          <section className="grid lg:grid-cols-3 gap-5">
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
            <div className="lg:col-span-2 rounded-3xl bg-white/80 backdrop-blur border border-black/5 shadow-sm overflow-hidden">
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

              <div className="p-6 space-y-4">
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
            <div className="rounded-3xl bg-white/80 backdrop-blur border border-black/5 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5">
                <h2 className="font-extrabold text-lg text-[#0f2d2b]">
                  Hospital Profile
                </h2>
                <p className="text-sm text-[#6b6f6a] mt-1">
                  Basic details (read-only)
                </p>
              </div>

              <div className="p-6 space-y-3 text-sm text-[#2a3a3a]">
                <InfoLine label="Hospital" value={hospitalName} />
                <InfoLine label="Hospital ID" value={admin?.hospital_id || "—"} />
                <InfoLine label="Admin Email" value={email} />

                <div className="pt-4">
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl border border-dashed border-black/10 bg-[#fbf8f2] text-[#9a968f] cursor-not-allowed"
                  >
                    Edit Profile (Next)
                  </button>
                </div>

                <div className="pt-2">
                  <div className="rounded-2xl bg-[#0f2d2b]/5 border border-black/5 p-4">
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
    "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition";
  const enabledStyle = active
    ? "bg-white/10 text-white ring-1 ring-white/15"
    : "hover:bg-white/10 text-white/80";
  const disabledStyle =
    "bg-white/5 text-white/40 cursor-not-allowed ring-1 ring-white/10";

  if (disabled) {
    return (
      <div className={`${base} ${disabledStyle}`}>
        <span>{label}</span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link to={to} className={`${base} ${enabledStyle}`}>
      <span className="flex items-center gap-2">
        {label}
        {badge ? (
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#f4b860]/15 text-[#f4b860] border border-[#f4b860]/25">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">
        Go
      </span>
    </Link>
  );
}

function StatCard({ title, value, hint, tone }) {
  const toneMap = {
    amber: {
      chip: "bg-[#f4b860]/15 text-[#915c10] border-[#f4b860]/25",
      dot: "bg-[#f4b860]",
    },
    teal: {
      chip: "bg-[#2b5f5a]/15 text-[#0f2d2b] border-[#2b5f5a]/25",
      dot: "bg-[#2b5f5a]",
    },
    ink: {
      chip: "bg-[#0f2d2b]/10 text-[#0f2d2b] border-black/10",
      dot: "bg-[#0f2d2b]",
    },
  };
  const t = toneMap[tone] || toneMap.ink;

  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur border border-black/5 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7c7b77]">{title}</p>
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

        <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center border border-black/5">
          <div className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, badge, to, buttonText, disabled }) {
  const wrap =
    "rounded-3xl bg-white/80 backdrop-blur border border-black/5 shadow-sm p-6 flex flex-col justify-between";
  const btnEnabled =
    "w-full mt-5 bg-[#0f2d2b] text-white py-3 rounded-2xl hover:opacity-90 active:opacity-80 text-sm font-semibold transition text-center";
  const btnDisabled =
    "w-full mt-5 bg-[#fbf8f2] text-[#a09a91] py-3 rounded-2xl cursor-not-allowed text-sm font-semibold border border-black/5";

  return (
    <div className={wrap}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-[#0f2d2b]">{title}</h3>
          <span className="text-[10px] px-2 py-1 rounded-full border border-black/5 bg-[#fbf8f2] text-[#6b6f6a]">
            {badge}
          </span>
        </div>
        <p className="text-sm text-[#5f6562] mt-2">{desc}</p>
      </div>

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
  );
}

function ActivityRow({ title, meta }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-2xl bg-[#0f2d2b]/10 flex items-center justify-center border border-black/5">
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
    <div className="flex items-start justify-between gap-4">
      <p className="text-[#7c7b77]">{label}</p>
      <p className="font-semibold text-right text-[#0f2d2b]">{value}</p>
    </div>
  );
}
