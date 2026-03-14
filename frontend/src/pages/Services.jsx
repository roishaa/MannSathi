// src/pages/Services.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Services() {
  const services = [
    {
      title: "Chat Counseling",
      desc: "Private 1:1 text session with a certified counselor.",
      meta: "30–45 mins • Best for quick support",
      to: "/BookAppointment",
      accent: "bg-[#e3f3e6]",
    },
    {
      title: "Anxiety Support",
      desc: "Overthinking, panic symptoms, constant worry and fear.",
      meta: "Coping plans • Breathing tools",
      to: "/BookAppointment",
      accent: "bg-[#f7d8dd]",
    },
    {
      title: "Stress & Burnout",
      desc: "Study/work pressure, fatigue, sleep issues, mental overload.",
      meta: "Boundaries • Routine reset",
      to: "/BookAppointment",
      accent: "bg-[#f7e7a6]",
    },
    {
      title: "Depression Support",
      desc: "Low mood, loss of motivation, emotional heaviness.",
      meta: "Gentle steps • Long-term care",
      to: "/BookAppointment",
      accent: "bg-[#ffe1d6]",
    },
    {
      title: "Relationships",
      desc: "Communication, trust, conflict, family pressure.",
      meta: "Clarity • Healthier connections",
      to: "/BookAppointment",
      accent: "bg-[#e3f3e6]",
    },
    {
      title: "Self-Esteem & Confidence",
      desc: "Self-doubt, people-pleasing, confidence building.",
      meta: "Mindset • Self-worth",
      to: "/BookAppointment",
      accent: "bg-[#efe6ff]",
    },
    {
      title: "OCD & Intrusive Thoughts",
      desc: "Compulsions, intrusive thoughts, reassurance cycles.",
      meta: "Evidence-based support",
      to: "/BookAppointment",
      accent: "bg-[#f8f4ec]",
    },
  ];

  const steps = [
    {
      title: "Check in",
      desc: "Share how you’re feeling with a short mood check-in.",
      to: "/users/moodcheckin",
      cta: "Mood Check-In",
    },
    {
      title: "Choose support",
      desc: "Select a service that feels right for you.",
      to: "/services",
      cta: "View Services",
    },
    {
      title: "Book a session",
      desc: "Pick a counselor and time — chat or video.",
      to: "/BookAppointment",
      cta: "Book Now",
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 pt-28 pb-16">
      <div className="mx-auto max-w-6xl">

        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700
                     hover:text-[#215c4c] transition mb-6"
        >
          ← Back to home
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8]
                            bg-white px-4 py-2 text-xs text-neutral-700">
              <span className="h-2 w-2 rounded-full bg-[#215c4c]" />
              Calm, private mental health support
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-serif text-neutral-900">
              Explore services
            </h1>

            <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">
              Choose the support that fits your needs. Start with chat,
              move to video anytime, and switch counselors freely.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              to="/BookAppointment"
              className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                         px-7 py-2.5 text-sm font-semibold
                         shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
            >
              Book appointment
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <section className="mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s.title}
                className="group rounded-3xl border border-[#ededed] bg-white p-7 shadow-sm
                           hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)]
                           hover:-translate-y-[2px] transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-neutral-900">{s.title}</h3>
                  <span className={`h-2.5 w-14 rounded-full ${s.accent}`} />
                </div>

                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {s.desc}
                </p>

                <p className="mt-4 text-xs text-neutral-500">{s.meta}</p>

                <div className="mt-6">
                  <Link
                    to={s.to}
                    className="text-sm font-semibold text-[#215c4c] hover:underline"
                  >
                    Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-serif text-neutral-900">
            How it works
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            A simple, pressure-free flow.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((st, idx) => (
              <div
                key={st.title}
                className="rounded-3xl border border-[#f0f0f0] bg-white p-7 shadow-sm"
              >
                <p className="text-xs font-semibold text-neutral-500">
                  Step {idx + 1}
                </p>

                <h3 className="mt-4 font-semibold text-neutral-900">
                  {st.title}
                </h3>

                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  {st.desc}
                </p>

                <Link
                  to={st.to}
                  className="mt-6 inline-flex items-center rounded-full border border-[#e7e7e7]
                             bg-white px-5 py-2 text-sm font-semibold text-neutral-900
                             shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
                >
                  {st.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20">
          <div className="rounded-3xl border border-[#e6efe9] bg-[#e3f3e6]
                          px-8 md:px-12 py-10 flex flex-col md:flex-row
                          md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-serif text-neutral-900">
                Not sure what to choose?
              </h3>
              <p className="mt-2 text-sm text-neutral-700">
                Start with a mood check-in or a short chat session.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/BookAppointment"
                className="inline-flex items-center rounded-full bg-[#215c4c]
                           text-white px-7 py-2.5 text-sm font-semibold
                           shadow-sm hover:shadow-md transition"
              >
                Book appointment
              </Link>
            </div>
          </div>

          <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
            If you are in immediate danger, please contact local emergency services
            or visit the nearest hospital. MannSathi is not an emergency service.
          </p>
        </section>
      </div>
    </div>
  );
}
