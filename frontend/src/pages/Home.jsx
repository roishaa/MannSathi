import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Home() {
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  // close dropdown when clicking outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const topics = [
    { title: "Anxiety Disorders", to: "/topics/anxiety", color: "bg-[#f7d8dd]" },
    {
      title: "Stress-Related Disorders",
      to: "/topics/stress",
      color: "bg-[#f7e7a6]",
    },
    {
      title: "Psychotic Disorders",
      to: "/topics/psychotic",
      color: "bg-[#d7ecff]",
    },
    { title: "Depression", to: "/topics/depression", color: "bg-[#ffe1d6]" },
    {
      title: "Relationships",
      to: "/topics/relationships",
      color: "bg-[#e3f3e6]",
    },
    { title: "OCD", to: "/topics/ocd", color: "bg-[#efe6ff]" },
  ];

  return (
    <div className="min-h-screen bg-white px-6 pt-28 pb-10">
      {/* NAVBAR (FIXED) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          {/* Left Logo Ribbon */}
          <Link to="/" className="relative select-none">
            <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </Link>

          {/* NAV LINKS */}
          <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-800">
            {[
              { label: "Home", to: "/" },
              { label: "About Us", to: "/about" },
              { label: "Services", to: "/services" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="group cursor-pointer relative hover:text-[#215c4c] transition"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#215c4c] transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}

            {/* Search icon */}
            <button
              type="button"
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-[#e7e7e7]
                         shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
              aria-label="Search"
            >
              🔍
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-6xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-2 md:px-4">
        {/* LEFT TEXT AREA */}
        <div className="md:ml-6">
          {/* pastel chips */}
          <div className="flex gap-4 mb-6">
            <div className="h-3 w-16 rounded-full bg-[#f7d8dd]" />
            <div className="h-3 w-16 rounded-full bg-[#f7e7a6]" />
          </div>

          {/* MAIN TEXT */}
          <p className="text-[26px] md:text-[30px] leading-[1.5] text-neutral-900 font-medium">
            Your <span className="font-bold">Mental health</span> is just <br />
            as important as <br />
            your physical health, <br />
            take care of both.
          </p>

          {/* wavyline */}
          <div className="mt-4">
            <svg className="w-60" height="20" viewBox="0 0 300 20" fill="none">
              <path
                d="M0 10 Q 40 0 80 10 T 160 10 T 240 10 T 320 10"
                stroke="#d2c3b4"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Buttons row */}
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              to="/BookAppointment"
              className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                         px-8 py-3 text-[16px] font-semibold text-[#305b39]
                         shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                         hover:shadow-[0_3px_0_0_#89ad8f] transition"
            >
              Book Appointment
            </Link>

            {/* LOGIN DROPDOWN BUTTON */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLoginMenuOpen((prev) => !prev)}
                className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                           px-8 py-3 text-[16px] font-semibold text-[#305b39]
                           shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                           hover:shadow-[0_3px_0_0_#89ad8f] transition"
              >
                Login
              </button>

              {loginMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200 z-20 text-sm overflow-hidden">
                  <Link
                    to="/login"
                    className="block px-4 py-3 hover:bg-gray-50"
                    onClick={() => setLoginMenuOpen(false)}
                  >
                    Login as User
                  </Link>
                  <Link
                    to="/counselor/login"
                    className="block px-4 py-3 hover:bg-gray-50"
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
        <div className="flex justify-center md:justify-end">
          <div className="relative">
            {/* soft glow */}
            <div className="absolute -inset-6 rounded-[40%] bg-[#ffe1d6]/50 blur-2xl" />

            <div className="relative h-72 w-80 rounded-[50%] bg-white flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="h-64 w-72 rounded-[50%] bg-[#ffe1d6] overflow-hidden">
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

      {/* ABOUT SECTION */}
      <section className="mt-24 px-6 flex justify-center">
        <div className="max-w-4xl w-full rounded-3xl bg-[#fff7f3] px-8 md:px-14 py-12 shadow-[0_14px_60px_rgba(0,0,0,0.08)]">
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

      {/* WHAT BRINGS YOU HERE SECTION */}
      <section className="mt-20 px-4">
        <div className="mx-auto max-w-6xl flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">
            What brings you here today?
          </h2>
          <div className="mt-2 h-[2px] w-24 bg-[#2c7365]/80 rounded-full" />

          <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group relative w-full rounded-3xl border border-[#dbeae4]
                           bg-white/70 backdrop-blur px-7 py-7 text-left
                           shadow-sm transition-all duration-200
                           hover:-translate-y-[2px] hover:shadow-[0_18px_60px_rgba(0,0,0,0.10)]
                           focus:outline-none focus:ring-2 focus:ring-[#2c7365]/40"
              >
                <span
                  className={`absolute top-5 right-6 h-2 w-12 rounded-full ${item.color}`}
                />
                <p className="font-serif text-lg text-neutral-900 leading-snug">
                  {item.title}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#2c7365] opacity-0 group-hover:opacity-100 transition">
                  Explore <span className="text-lg leading-none">›</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EMOTIONAL CHECK-IN SECTION */}
      <section className="mt-20 mb-24 flex flex-col items-center gap-10 px-4">
        <button
          type="button"
          className="group w-full max-w-3xl flex items-center justify-between rounded-2xl
                     border border-[#2c7365] bg-[#5fb1a0] px-8 py-5
                     text-sm md:text-base font-semibold text-[#0d1b1a]
                     shadow-[0_10px_0_0_rgba(33,92,76,0.85)]
                     hover:translate-y-[1px] hover:shadow-[0_8px_0_0_rgba(33,92,76,0.85)]
                     transition"
        >
          <span>Find out what’s really on your mind</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d1b1a] text-sm text-white transition group-hover:scale-[1.03]">
            ?
          </span>
        </button>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left visual – abstract calm design */}
          <div className="relative flex justify-center md:justify-start">
            <div
              className="relative h-72 w-72 md:w-80 rounded-3xl bg-gradient-to-br
                         from-[#f8f4ec] to-[#fff7f3]
                         border border-[#e8ded0]
                         shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[#f7d8dd]/60 blur-2xl" />
              <div className="absolute bottom-0 -right-10 h-44 w-44 rounded-full bg-[#e3f3e6]/70 blur-2xl" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="h-14 w-14 rounded-full bg-[#215c4c]/10 flex items-center justify-center mb-4">
                  🌱
                </div>
                <p className="font-serif text-lg text-[#292521]">
                  A safe space to <br /> understand your emotions
                </p>
              </div>
            </div>

            <div
              className="absolute -bottom-10 left-10 h-32 w-32 rounded-2xl
                         bg-white border border-[#e8ded0]
                         shadow-[0_16px_40px_rgba(0,0,0,0.12)]
                         flex items-center justify-center text-center px-4"
            >
              <p className="text-xs font-semibold text-[#215c4c]">
                You’re not alone
              </p>
            </div>
          </div>

          {/* Right text */}
          <div className="flex flex-col gap-6">
            <div className="flex gap-5">
              <div className="w-[3px] rounded-full bg-[#c4b9aa] mt-1" />
              <p className="text-base leading-relaxed text-neutral-800 max-w-md">
                Feeling lost or overwhelmed? <br />
                <span className="font-semibold">MannSathi</span> helps you check
                in with your emotions, talk to experts, and find peace of mind.
              </p>
            </div>

            <Link
              to="/services"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cfe2da]
                         bg-white px-6 py-2.5 text-sm font-semibold text-[#215c4c]
                         shadow-sm hover:shadow-md hover:gap-3 transition"
            >
              Explore <span className="text-lg leading-none">›</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
