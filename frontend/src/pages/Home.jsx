import { Link } from "react-router-dom";
import { useState } from "react";

function Home() {
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffff] px-6 py-10">
      {/* NAVBAR */}
      <header className="flex items-center justify-between">
        {/* Left Logo Ribbon */}
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

        {/* NAV LINKS */}
        <nav className="flex items-center gap-10 text-[15px] font-medium text-neutral-800">
          <a className="hover:text-[#215c4c] cursor-pointer">Home</a>
          <a className="hover:text-[#215c4c] cursor-pointer">About Us</a>
          <a className="hover:text-[#215c4c] cursor-pointer">Services</a>

          {/* Search icon */}
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white border shadow hover:shadow-md cursor-pointer">
            🔍
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-4">
        {/* LEFT TEXT AREA */}
        <div className="ml-10">
          {/* pastel chips */}
          <div className="flex gap-4 mb-6">
            <div className="h-3 w-16 rounded-full bg-[#f7d8dd]" />
            <div className="h-3 w-16 rounded-full bg-[#f7e7a6]" />
          </div>

          {/* MAIN TEXT */}
          <p className="text-[24px] leading-[1.65] text-neutral-900 font-medium">
            Your <span className="font-bold">Mental health</span> is just <br />
            as important as <br />
            your physical health, <br />
            take care of both.
          </p>

          {/* wavyline */}
          <div className="mt-4">
            <svg
              className="w-60"
              height="20"
              viewBox="0 0 300 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="wavyShadow" x="-20" y="-20" width="400" height="80">
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="2"
                    floodColor="#c8b7a7"
                    floodOpacity="0.5"
                  />
                </filter>
              </defs>

              <path
                d="M0 10 
                   Q 40 0 80 10 
                   T 160 10 
                   T 240 10 
                   T 320 10"
                stroke="#d2c3b4"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#wavyShadow)"
              />
            </svg>
          </div>

          {/* Buttons row */}
          <div className="mt-6 flex gap-4">
            {/* Book Appointment */}
            <Link
              to="/BookAppointment"
              className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition"
            >
              Book Appointment
            </Link>

            {/* LOGIN DROPDOWN BUTTON */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLoginMenuOpen((prev) => !prev)}
                className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition"
              >
                Login
              </button>

              {loginMenuOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-lg bg-white shadow-lg border border-gray-200 z-20 text-sm">
                  <Link
                    to="/login"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setLoginMenuOpen(false)}
                  >
                    Login as User
                  </Link>
                  <Link
                    to="/counselor/login"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setLoginMenuOpen(false)}
                  >
                    Login as Counselor
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="flex justify-center md:justify-start ml-4">
          <div className="relative">
            {/* Outer white oval */}
            <div className="h-72 w-80 rounded-[50%] bg-white flex items-center justify-center shadow-sm animate-avatarFloat">
              {/* Inner peach oval */}
              <div className="h-64 w-72 rounded-[50%] bg-[#ffe1d6] flex items-center justify-center overflow-hidden">
                {/* Avatar */}
                <img
                  src="/src/assets/avatar1.jpg"
                  alt="Avatar"
                  className="h-full w-full object-contain bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About + Check-in sections remain same ... */}

      {/* ABOUT SECTION */}
      <section className="mt-24 px-6 flex justify-center">
        <div className="max-w-4xl w-full rounded-3xl bg-[#fff7f3] px-8 md:px-14 py-12 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-[#292521]">
            About MannSathi
          </h2>
          <div className="flex justify-center mt-2">
            <svg className="w-40" height="12" viewBox="0 0 200 12" fill="none">
              <path
                d="M0 6 Q 25 0 50 6 T 100 6 T 150 6 T 200 6"
                stroke="#d2c3b4"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mt-6 text-center text-[#5f5b57] text-sm md:text-base leading-relaxed">
            MannSathi is your safe, private, and judgment-free space to express
            how you feel. We connect you with certified mental health counselors
            and provide gentle AI support — helping you understand and navigate
            your emotions at your own pace.
            <br />
            <br />
            Whether you're dealing with stress, anxiety, overthinking, or
            feeling lost, MannSathi is here to guide you with compassion,
            warmth, and understanding.
          </p>
        </div>
      </section>

      {/* EMOTIONAL CHECK-IN SECTION */}
      <section className="mt-20 mb-24 flex flex-col items-center gap-10 px-4">
        <button className="w-full max-w-xl flex items-center justify-between rounded-md border border-[#2c7365] bg-[#5fb1a0] px-6 py-3 text-sm font-semibold text-[#0d1b1a] shadow-[0_6px_0_0_rgba(33,92,76,0.8)] hover:translate-y-[1px] hover:shadow-[0_4px_0_0_rgba(33,92,76,0.8)] transition">
          <span>Find out what’s really on your mind</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#0d1b1a] text-xs text-white">
            ?
          </span>
        </button>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative flex justify-center md:justify-start">
            <div className="h-64 w-56 rounded-md border border-[#f0e6d8] bg-[#f8f4ec]" />
            <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-[#dedede]" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-[2px] bg-[#c4b9aa] mt-1" />
              <p className="text-sm leading-relaxed text-neutral-800 max-w-sm">
                Feeling lost or overwhelmed? <br />
                <span className="font-semibold">MannSathi</span> helps you check
                in with your emotions, talk to experts, and find peace of mind.
              </p>
            </div>

            <button className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:gap-3 transition">
              Explore
              <span className="text-lg leading-none">›</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
