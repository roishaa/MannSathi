import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminInfo, logout } from "../../utils/adminAuth";

export default function HospitalAdminDashboard() {
  const nav = useNavigate();
  const admin = useMemo(() => getAdminInfo(), []);

  const hospitalName =
    admin?.hospital_name || admin?.hospitalName || "MannSathi General Hospital";
  const email = admin?.email || "—";

  const handleLogout = () => {
    logout();
    nav("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="hidden md:flex w-72 bg-white border-r flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#215c4c]/10 flex items-center justify-center">
              <div className="h-6 w-6 rounded-md bg-[#215c4c]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hospital Admin</p>
              <p className="font-bold leading-tight">{hospitalName}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarLink to="/hospital-admin/dashboard" label="Dashboard" active />
          <SidebarLink to="/hospital-admin/counselors" label="Counselor Approval" />
          <SidebarLink to="#" label="Appointments (Next)" disabled />
          <SidebarLink to="#" label="Schedules (Next)" disabled />
          <SidebarLink to="#" label="Reports (Next)" disabled />
          <SidebarLink to="#" label="Settings (Next)" disabled />
        </nav>

        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-[#215c4c] text-white py-3 rounded-xl hover:opacity-90"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1">
        {/* TOP BAR */}
        <header className="px-6 md:px-10 py-6 flex items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">
              Welcome back, <span className="font-semibold">{email}</span>
            </p>
          </div>

          {/* Mobile logout */}
          <button
            onClick={handleLogout}
            className="md:hidden bg-[#215c4c] text-white px-4 py-2 rounded-xl hover:opacity-90"
          >
            Logout
          </button>
        </header>

        {/* CONTENT */}
        <div className="px-6 md:px-10 pb-12 space-y-8">
          {/* STAT CARDS */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Pending Approvals" value="—" hint="Counselors awaiting review" />
            <StatCard title="Active Counselors" value="—" hint="Approved in this hospital" />
            <StatCard title="Today's Appointments" value="—" hint="Upcoming today" />
            <StatCard title="Upcoming Sessions" value="—" hint="Next 7 days" />
          </section>

          {/* QUICK ACTIONS */}
          <section className="grid lg:grid-cols-3 gap-5">
            <ActionCard
              title="Counselor Approval"
              desc="Approve / reject counselors and verify license."
              badge="Important"
              to="/hospital-admin/counselors"
              buttonText="Open approvals"
            />

            <ActionCard
              title="Appointments"
              desc="View bookings, reschedule or cancel (next)."
              badge="Next"
              disabled
              to="#"
              buttonText="Coming soon"
            />

            <ActionCard
              title="Schedules"
              desc="Manage availability and time slots (next)."
              badge="Next"
              disabled
              to="#"
              buttonText="Coming soon"
            />
          </section>

          {/* TWO COLUMN AREA */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* Activity */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-bold text-lg">Recent Activity</h2>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>

              <div className="p-5 space-y-4">
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

                <div className="pt-2">
                  <Link
                    to="/hospital-admin/counselors"
                    className="inline-flex items-center text-sm font-semibold text-[#215c4c] hover:underline"
                  >
                    Go to approvals →
                  </Link>
                </div>
              </div>
            </div>

            {/* Hospital info */}
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="p-5 border-b">
                <h2 className="font-bold text-lg">Hospital Profile</h2>
              </div>
              <div className="p-5 space-y-3 text-sm text-gray-700">
                <InfoLine label="Hospital" value={hospitalName} />
                <InfoLine label="Hospital ID" value={admin?.hospital_id || "—"} />
                <InfoLine label="Admin Email" value={email} />
                <div className="pt-3">
                  <button
                    disabled
                    className="w-full py-3 rounded-xl border bg-gray-50 text-gray-400 cursor-not-allowed"
                  >
                    Edit Profile (Next)
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER NOTE */}
          <div className="text-xs text-gray-500">
            Tip: Use <span className="font-semibold">Counselor Approval</span> to verify and onboard
            counselors before users can book sessions.
          </div>
        </div>
      </main>
    </div>
  );
}

/* ====== Small UI components ====== */

function SidebarLink({ to, label, active, disabled }) {
  const base =
    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition";
  const enabledStyle = active
    ? "bg-[#215c4c]/10 text-[#215c4c]"
    : "hover:bg-gray-50 text-gray-700";
  const disabledStyle = "bg-gray-50 text-gray-400 cursor-not-allowed";

  if (disabled) {
    return (
      <div className={`${base} ${disabledStyle}`}>
        <span>{label}</span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-white border">Soon</span>
      </div>
    );
  }

  return (
    <Link to={to} className={`${base} ${enabledStyle}`}>
      <span>{label}</span>
      <span className="text-[10px] px-2 py-1 rounded-full bg-white border">Go</span>
    </Link>
  );
}

function StatCard({ title, value, hint }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <h3 className="text-3xl font-bold">{value}</h3>
        <span className="text-[10px] px-2 py-1 rounded-full bg-[#215c4c]/10 text-[#215c4c]">
          Live
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-2">{hint}</p>
    </div>
  );
}

function ActionCard({ title, desc, badge, to, buttonText, disabled }) {
  const wrap =
    "bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between";
  const btnEnabled =
    "w-full mt-5 bg-[#215c4c] text-white py-3 rounded-xl hover:opacity-90 text-sm font-semibold";
  const btnDisabled =
    "w-full mt-5 bg-gray-100 text-gray-400 py-3 rounded-xl cursor-not-allowed text-sm font-semibold";

  return (
    <div className={wrap}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{title}</h3>
          <span className="text-[10px] px-2 py-1 rounded-full border bg-gray-50">
            {badge}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{desc}</p>
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
      <div className="h-9 w-9 rounded-xl bg-[#215c4c]/10 flex items-center justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-[#215c4c]" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{meta}</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-right">{value}</p>
    </div>
  );
}
