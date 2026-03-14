import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Home() {
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

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
    { title: "Stress-Related Disorders", to: "/topics/stress", color: "bg-[#f7e7a6]" },
    { title: "Psychotic Disorders", to: "/topics/psychotic", color: "bg-[#d7ecff]" },
    { title: "Depression", to: "/topics/depression", color: "bg-[#ffe1d6]" },
    { title: "Relationships", to: "/topics/relationships", color: "bg-[#e3f3e6]" },
    { title: "OCD", to: "/topics/ocd", color: "bg-[#efe6ff]" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="relative select-none">
            <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-800">
            {[
              { label: "Home", to: "/" },
              { label: "About Us", to: "/about" },
              { label: "Services", to: "/services" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="group relative hover:text-[#215c4c] transition"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#215c4c] transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}

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

      {/* PAGE */}
      <main className="px-6 pt-28 pb-14">
        {/* HERO */}
        <section className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="md:pl-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs text-neutral-700">
              <span className="h-2 w-2 rounded-full bg-[#215c4c]" />
              Private, supportive mental health care
            </div>

            <h1 className="mt-6 text-[34px] md:text-[44px] leading-[1.1] text-neutral-900 font-serif">
              Care for your mind,
              <br />
              with guidance that feels safe.
            </h1>

            <p className="mt-5 text-[15px] md:text-base text-neutral-600 leading-relaxed max-w-xl">
              MannSathi connects you with certified counselors and gives you space
              to check in, reflect, and move forward — gently and privately.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/BookAppointment"
                className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                           px-8 py-3 text-[15px] font-semibold
                           shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
              >
                Book appointment
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center rounded-full border border-[#e7e7e7] bg-white
                           px-8 py-3 text-[15px] font-semibold text-neutral-900
                           shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
              >
                Explore services
              </Link>

              {/* Login dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setLoginMenuOpen((p) => !p)}
                  className="inline-flex items-center rounded-full border border-[#e7e7e7] bg-white
                             px-8 py-3 text-[15px] font-semibold text-neutral-900
                             shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
                >
                  Login
                </button>

                {loginMenuOpen && (
                  <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white shadow-lg border border-gray-200 z-20 text-sm overflow-hidden">
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

            {/* Minimal trust row */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              {[
                { k: "Verified", v: "Counselors" },
                { k: "Private", v: "Sessions" },
                { k: "Simple", v: "Booking" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl border border-[#efefef] bg-white px-4 py-4"
                >
                  <p className="text-sm font-semibold text-neutral-900">{s.k}</p>
                  <p className="text-xs text-neutral-600 mt-1">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="absolute -inset-8 rounded-[40%] bg-[#ffe1d6]/40 blur-2xl" />

              <div
                className="relative h-[340px] w-[340px] rounded-[36%] bg-white border border-[#f0f0f0]
                              shadow-[0_18px_50px_rgba(0,0,0,0.08)] flex items-center justify-center"
              >
                <div className="h-[310px] w-[310px] rounded-[36%] bg-[#fff7f3] overflow-hidden border border-[#f2e7df]">
                  <img
                    src="/src/assets/avatar1.jpg"
                    alt="MannSathi"
                    className="h-full w-full object-contain bg-white"
                  />
                </div>

                <div
                  className="absolute -bottom-6 left-8 rounded-2xl bg-white border border-[#f0f0f0]
                                shadow-[0_16px_45px_rgba(0,0,0,0.10)] px-5 py-4 w-64"
                >
                  <p className="text-xs text-neutral-500">Today</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900 leading-snug">
                    A small step is still a step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT (minimal) */}
        <section className="mx-auto max-w-6xl mt-24">
          <div className="rounded-3xl border border-[#f0f0f0] bg-white px-8 md:px-12 py-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-serif text-neutral-900">
                About MannSathi
              </h2>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                MannSathi is a safe, private space to talk through stress, anxiety,
                overthinking, and emotional burnout. We connect you with certified
                counselors — with care designed to feel calm, respectful, and human.
              </p>
            </div>
          </div>
        </section>

        {/* TOPICS */}
        <section className="mx-auto max-w-6xl mt-18 md:mt-20">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-neutral-900">
                Explore by topic
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Start with what feels closest to your experience.
              </p>
            </div>
            <Link
              to="/services"
              className="text-sm font-semibold text-[#215c4c] hover:underline"
            >
              View services →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-3xl border border-[#ededed] bg-white px-7 py-7
                           shadow-sm hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)]
                           hover:-translate-y-[2px] transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{item.title}</p>
                  <span className={`h-2.5 w-12 rounded-full ${item.color}`} />
                </div>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  Learn symptoms, coping strategies, and how counseling can help.
                </p>
                <div className="mt-6 text-sm font-semibold text-[#215c4c] opacity-0 group-hover:opacity-100 transition">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SIMPLE QUIZ SECTION (ABOVE FINAL CTA) */}
        <section className="mx-auto max-w-6xl mt-16">
          <div className="rounded-3xl border border-[#f0f0f0] bg-white px-8 md:px-12 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-xl md:text-2xl font-serif text-neutral-900">
                Not sure where to start?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Take a short wellbeing quiz to get a gentle direction. Not a diagnosis.
              </p>
            </div>

            <Link
              to="/quiz"
              className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                         px-7 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition"
            >
              Take the quiz
            </Link>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-6xl mt-16">
          <div className="rounded-3xl border border-[#e6efe9] bg-[#e3f3e6] px-8 md:px-12 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-serif text-neutral-900">
                Ready when you are.
              </h3>
              <p className="mt-2 text-sm text-neutral-700">
                Book a session or explore services — no pressure, just support.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/BookAppointment"
                className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                           px-7 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition"
              >
                Book appointment
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center rounded-full border border-[#cfe2da] bg-white
                           px-7 py-2.5 text-sm font-semibold text-[#215c4c] shadow-sm hover:shadow-md transition"
              >
                Explore services
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
