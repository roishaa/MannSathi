// src/Dashboard.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch logged-in user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

        if (!res.ok) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf4]">
        <p className="text-sm text-neutral-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4ef] flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#6f8f89] text-white flex flex-col items-center pt-10 pb-8">
        {/* top ribbon logo */}
       <div className="relative">
          {/* green shape */}
          <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />

          {/* centered text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-semibold text-xl font-serif tracking-wide">
              MannSathi
            </span>
          </div>
        </div>  

        {/* circle avatar placeholder */}
        <div className="w-28 h-28 rounded-full bg-[#d9dedc] border border-white/70 mb-4" />

        <p className="text-sm font-medium mb-1">Check your Condition</p>
        <button
          className="mb-10 rounded-full bg-[#3f5e56] px-5 py-2 text-xs font-semibold"
          type="button"
        >
          Check it now
        </button>

        {/* side nav */}
        <nav className="w-full px-6 space-y-4 text-sm">
          <div className="bg-[#f6f5f1] text-[#1f2933] rounded-full px-4 py-2 font-semibold">
            Dashboard
          </div>
          <button className="block w-full text-left text-[#fdfdfd] hover:text-white/90">
            Search Doctor
          </button>
          <button className="block w-full text-left text-[#fdfdfd] hover:text-white/90">
            Sessions
          </button>
          <button className="block w-full text-left text-[#fdfdfd] hover:text-white/90">
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="mt-6 text-xs text-red-100 underline underline-offset-2"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="flex-1 px-10 py-8">
        {/* top bar: greeting + icons */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold text-neutral-900">
            Hi, {user?.name || "Friend"}..
          </div>

          <div className="flex items-center gap-4 text-neutral-700">
            {/* simple icon circles as placeholders */}
            <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-sm">
              🔔
            </div>
            <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-sm">
              👤
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* CATEGORIES */}
       {/* CATEGORIES */}
<section className="mb-10">
  <h2 className="text-xl font-semibold text-neutral-900 mb-5">
    Categories
  </h2>

  <div className="flex gap-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-40 w-60 rounded-3xl bg-[#e4e4e4] flex-shrink-0"
      />
    ))}
  </div>
</section>
<hr className="border-neutral-200 my-4" />


        {/* BOOK APPOINTMENT */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-neutral-900 mb-3">
            Book appointment
          </h2>
           <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
           <div
            key={i}
            className="h-40 w-60 rounded-3xl bg-[#e4e4e4] flex-shrink-0"
            />
         ))}
        </div>
        </section>

        <hr className="border-neutral-200 my-4" />

        {/* UPCOMING SESSIONS */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">
            Upcoming Sessions
          </h2>
          {/* grey placeholder card */}
          <div className="h-24 w-full max-w-xl rounded-2xl bg-[#e4e4e4]" />
        </section>
      </main>
    </div>
  );
}
