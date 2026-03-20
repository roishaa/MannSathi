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

  const supportHighlights = [
    {
      title: "Confidential by design",
      description: "Private sessions and secure communication built for emotional safety.",
      icon: "🔒",
      bg: "bg-[#F5F3FF]",
    },
    {
      title: "Certified professionals",
      description: "Connect with experienced counselors for guided, compassionate care.",
      icon: "🧠",
      bg: "bg-[#E0F2FE]",
    },
    {
      title: "Simple booking flow",
      description: "Book, reschedule, and follow up in a few calm, clear steps.",
      icon: "📅",
      bg: "bg-[#DCFCE7]",
    },
    {
      title: "Gentle AI check-ins",
      description: "Use short check-ins and guided prompts when you need immediate support.",
      icon: "✨",
      bg: "bg-[#FCE7F3]",
    },
  ];

  const howItWorks = [
    {
      step: "Step 1",
      title: "Choose what support you need",
      description: "Explore services or start with a topic that matches how you feel today.",
    },
    {
      step: "Step 2",
      title: "Book with ease",
      description: "Pick a suitable slot and confirm your appointment in a few clicks.",
    },
    {
      step: "Step 3",
      title: "Begin your healing journey",
      description: "Join your session, track your progress, and build healthy momentum.",
    },
  ];

  const trustCards = [
    {
      title: "4.9/5 care experience",
      text: "People value the calm environment, respectful listening, and practical guidance.",
      color: "bg-[#F5F3FF]",
    },
    {
      title: "Human-first approach",
      text: "Every session is centered around your pace, your comfort, and your goals.",
      color: "bg-[#E0F2FE]",
    },
    {
      title: "Support that feels safe",
      text: "From your first click to ongoing care, MannSathi is designed to reduce stress.",
      color: "bg-[#DCFCE7]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF]/60 via-white to-[#E0F2FE]/30 text-neutral-900">
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
      <main className="px-6 pt-28 pb-20 space-y-8">
        {/* HERO */}
        <section className="mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/80 shadow-[0_16px_60px_rgba(15,23,42,0.08)] backdrop-blur p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs text-neutral-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#215c4c]" />
              Private, supportive mental health care
            </div>

            <h1 className="text-4xl md:text-5xl leading-[1.08] text-neutral-900 font-serif">
              Care for your mind,
              <br />
              with guidance that feels safe.
            </h1>

            <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-xl">
              MannSathi connects you with certified counselors and gives you space
              to check in, reflect, and move forward — gently and privately.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/book-appointment"
                className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                           px-8 py-3 text-[15px] font-semibold
                           shadow-sm hover:shadow-md hover:-translate-y-[1px] transition duration-200"
              >
                Guest Booking
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center rounded-full border border-[#e7e7e7] bg-white
                           px-8 py-3 text-[15px] font-semibold text-neutral-900
                           shadow-sm hover:shadow-md hover:-translate-y-[1px] transition duration-200"
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
                             shadow-sm hover:shadow-md hover:-translate-y-[1px] transition duration-200"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {[
                { k: "Verified", v: "Counselors" },
                { k: "Private", v: "Sessions" },
                { k: "Simple", v: "Booking" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl border border-[#efefef] bg-white px-4 py-4 shadow-sm hover:shadow-md transition duration-200"
                >
                  <p className="text-sm font-semibold text-neutral-900">{s.k}</p>
                  <p className="text-xs text-neutral-600 mt-1">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-[#FCE7F3] blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#DCFCE7] blur-3xl" />

            <div className="relative rounded-2xl border border-[#eef1f4] bg-white p-5 sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <div className="rounded-2xl bg-gradient-to-br from-[#F5F3FF] via-[#E0F2FE] to-[#DCFCE7] p-6">
                <div className="h-[260px] sm:h-[300px] rounded-2xl bg-white/85 border border-white shadow-inner flex items-center justify-center overflow-hidden">
                  <img
                    src="/src/assets/avatar1.jpg"
                    alt="MannSathi"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#F5F3FF] p-4 border border-white shadow-sm">
                  <p className="text-xs text-neutral-500">Active counselors</p>
                  <p className="mt-1 text-xl font-semibold text-neutral-900">120+</p>
                </div>
                <div className="rounded-2xl bg-[#DCFCE7] p-4 border border-white shadow-sm">
                  <p className="text-xs text-neutral-500">Care satisfaction</p>
                  <p className="mt-1 text-xl font-semibold text-neutral-900">98%</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#f0f0f0] bg-white px-5 py-4 shadow-sm">
                <p className="text-xs text-neutral-500">Today</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900 leading-snug">
                  A small step is still a step.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES / SUPPORT */}
        <section className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {supportHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white bg-white p-6 shadow-sm hover:shadow-md transition duration-200"
            >
              <div className={`h-11 w-11 rounded-xl ${item.bg} flex items-center justify-center text-lg`}>
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </section>

        {/* ABOUT */}
        <section className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#f0f0f0] bg-white p-6 md:p-8 shadow-sm">
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">
                About MannSathi
              </h2>
              <p className="mt-4 text-neutral-600 leading-relaxed text-base md:text-lg">
                MannSathi is a safe, private space to talk through stress, anxiety,
                overthinking, and emotional burnout. We connect you with certified
                counselors — with care designed to feel calm, respectful, and human.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-r from-[#F5F3FF] via-[#E0F2FE] to-[#DCFCE7] p-6 md:p-8 border border-white shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">How it works</h2>
            <p className="mt-3 text-neutral-700 leading-relaxed">
              A clear, low-stress journey designed to help you start and stay consistent.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((item, index) => (
              <div
                key={item.step}
                className="rounded-2xl bg-white/95 p-6 border border-white shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-[#215c4c] text-white px-3 py-1 text-xs font-semibold">
                    {item.step}
                  </span>
                  <span className="text-sm text-neutral-500">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TOPICS */}
        <section className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">
                Explore by topic
              </h2>
              <p className="mt-2 text-base text-neutral-600">
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
                className="group rounded-2xl border border-[#ededed] bg-white p-6
                           shadow-sm hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)]
                           hover:-translate-y-[2px] transition duration-200"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{item.title}</p>
                  <span className={`h-2.5 w-12 rounded-full ${item.color}`} />
                </div>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  Learn symptoms, coping strategies, and how counseling can help.
                </p>
                <div className="mt-6 text-sm font-semibold text-[#215c4c] opacity-0 group-hover:opacity-100 transition duration-200">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* COUNSELOR / SUPPORT HIGHLIGHTS */}
        <section className="mx-auto max-w-6xl rounded-2xl border border-[#f0f0f0] bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">Support that meets you where you are</h2>
              <p className="mt-3 text-neutral-600 leading-relaxed">
                Whether you need structured counseling, gentle check-ins, or practical coping tools,
                MannSathi helps you move at a pace that feels right.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center rounded-full border border-[#dfe8e3] bg-[#DCFCE7] px-6 py-2.5 text-sm font-semibold text-[#215c4c] shadow-sm hover:shadow-md transition duration-200"
            >
              Explore care options
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#F5F3FF] p-6">
              <p className="text-sm text-neutral-700">Counseling Sessions</p>
              <p className="mt-2 text-xl font-semibold text-neutral-900">Personalized 1:1 support</p>
            </div>
            <div className="rounded-2xl bg-[#E0F2FE] p-6">
              <p className="text-sm text-neutral-700">Emotional Safety</p>
              <p className="mt-2 text-xl font-semibold text-neutral-900">Judgment-free conversations</p>
            </div>
            <div className="rounded-2xl bg-[#FCE7F3] p-6">
              <p className="text-sm text-neutral-700">Progressive Care</p>
              <p className="mt-2 text-xl font-semibold text-neutral-900">Small steps, consistent growth</p>
            </div>
          </div>
        </section>

        {/* TRUST / TESTIMONIAL STYLE */}
        <section className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustCards.map((item) => (
              <div key={item.title} className={`rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition duration-200 ${item.color}`}>
                <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-3 text-sm text-neutral-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SIMPLE QUIZ SECTION (ABOVE FINAL CTA) */}
        <section className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#f0f0f0] bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
            <div className="max-w-xl">
              <h3 className="text-2xl md:text-3xl font-serif text-neutral-900">
                Not sure where to start?
              </h3>
              <p className="mt-2 text-base text-neutral-600 leading-relaxed">
                Take a short wellbeing quiz to get a gentle direction. Not a diagnosis.
              </p>
            </div>

            <Link
              to="/quiz"
              className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                         px-7 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition duration-200"
            >
              Take the quiz
            </Link>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#e6efe9] bg-gradient-to-r from-[#DCFCE7] via-[#E0F2FE] to-[#F5F3FF] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif text-neutral-900">
                Ready when you are.
              </h3>
              <p className="mt-2 text-base text-neutral-700">
                Book a session or explore services — no pressure, just support.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/BookAppointment"
                className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                           px-7 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition duration-200"
              >
                Book appointment
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center rounded-full border border-[#cfe2da] bg-white
                           px-7 py-2.5 text-sm font-semibold text-[#215c4c] shadow-sm hover:shadow-md transition duration-200"
              >
                Explore services
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center rounded-full border border-[#d9e3ee] bg-white
                           px-7 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:shadow-md transition duration-200"
              >
                Talk to AI support
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
