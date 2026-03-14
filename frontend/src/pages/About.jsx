// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  const values = [
    {
      title: "Privacy first",
      desc: "We treat your emotions and conversations with respect. Your data is handled carefully and access is role-based.",
    },
    {
      title: "Human support",
      desc: "A calm space where you feel heard. We prioritize empathy, clarity, and non-judgmental care.",
    },
    {
      title: "Qualified counselors",
      desc: "We work with certified mental health professionals and aim for consistent, ethical support.",
    },
    {
      title: "Designed for Nepal",
      desc: "Built with the Nepali context in mind — language, accessibility, and comfort.",
    },
  ];

  const steps = [
    {
      title: "Check in",
      desc: "Start with a short mood check-in to understand what you’re feeling.",
      to: "/users/moodcheckin",
      cta: "Mood Check-In",
    },
    {
      title: "Find support",
      desc: "Browse services and choose what feels right for you.",
      to: "/services",
      cta: "Explore Services",
    },
    {
      title: "Talk privately",
      desc: "Book a session and talk to a counselor through chat or video.",
      to: "/BookAppointment",
      cta: "Book Appointment",
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
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs text-neutral-700">
            <span className="h-2 w-2 rounded-full bg-[#215c4c]" />
            About MannSathi
          </div>

          <h1 className="mt-6 text-3xl md:text-4xl font-serif text-neutral-900 leading-tight">
            A calmer space to understand your mind.
          </h1>

          <p className="mt-4 text-sm md:text-base text-neutral-600 leading-relaxed">
            MannSathi is a mental wellbeing platform built to help people talk
            openly, safely, and privately. We connect users with certified mental
            health counselors and provide gentle tools like mood check-ins to help
            you notice patterns and feel supported over time.
          </p>
        </div>

        {/* Mission card */}
        <section className="mt-12">
          <div className="rounded-3xl border border-[#f0f0f0] bg-white px-8 md:px-12 py-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-serif text-neutral-900">
                Our mission
              </h2>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                To make mental health support more accessible and comfortable —
                especially for people who feel unsure about where to start.
                We believe support should feel safe, respectful, and easy to reach.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#e3f3e6] text-[#215c4c] border border-[#cfe2da] px-4 py-2 text-xs font-semibold">
                  Confidential
                </span>
                <span className="rounded-full bg-white text-neutral-800 border border-[#e7e7e7] px-4 py-2 text-xs font-semibold">
                  Non-judgmental
                </span>
                <span className="rounded-full bg-[#fff7f3] text-neutral-800 border border-[#f0d7cc] px-4 py-2 text-xs font-semibold">
                  Supportive
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mt-16">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-neutral-900">
                What we stand for
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Simple values, strong care.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-3xl border border-[#ededed] bg-white p-7 shadow-sm"
              >
                <h3 className="font-semibold text-neutral-900">{v.title}</h3>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-serif text-neutral-900">
            How MannSathi works
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            A calm flow — no pressure, just support.
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
        <section className="mt-16">
          <div className="rounded-3xl border border-[#e6efe9] bg-[#e3f3e6] px-8 md:px-12 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-serif text-neutral-900">
                You don’t have to figure it out alone.
              </h3>
              <p className="mt-2 text-sm text-neutral-700">
                Start small — a mood check-in or a short session is enough.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/users/moodcheckin"
                className="inline-flex items-center rounded-full border border-[#cfe2da] bg-white px-7 py-2.5 text-sm font-semibold text-[#215c4c]
                           shadow-sm hover:shadow-md transition"
              >
                Mood check-in
              </Link>
              <Link
                to="/BookAppointment"
                className="inline-flex items-center rounded-full bg-[#215c4c] text-white px-7 py-2.5 text-sm font-semibold
                           shadow-sm hover:shadow-md transition"
              >
                Book appointment
              </Link>
            </div>
          </div>

          <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
            MannSathi is not an emergency service. If you are in immediate danger,
            contact local emergency services or visit the nearest hospital.
          </p>
        </section>
      </div>
    </div>
  );
}
