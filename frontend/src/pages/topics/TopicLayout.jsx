import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function TopicLayout({
  title,
  accent = "#e3f3e6",
  intro,
  symptoms = [],
  whyItHappens = [],
  tips = [],
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* top buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#e7e7e7] bg-white px-4 py-2
                       text-sm font-semibold text-neutral-700 shadow-sm hover:shadow-md transition"
          >
            <span className="text-lg leading-none">‹</span> Back
          </button>

          <Link
            to="/BookAppointment"
            className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                       px-6 py-2.5 text-sm font-semibold text-[#305b39]
                       shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                       hover:shadow-[0_3px_0_0_#89ad8f] transition"
          >
            Book Appointment
          </Link>
        </div>

        {/* header */}
        <div className="mt-8 rounded-3xl border border-[#e8ded0] bg-[#fff7f3] p-8 shadow-[0_14px_60px_rgba(0,0,0,0.08)] relative overflow-hidden">
          <div
            className="absolute top-6 right-6 h-2 w-16 rounded-full"
            style={{ backgroundColor: accent }}
          />

          <h1 className="text-3xl md:text-4xl font-serif text-[#292521]">{title}</h1>

          <div className="mt-2">
            <svg className="w-48" height="12" viewBox="0 0 200 12" fill="none">
              <path
                d="M0 6 Q 25 0 50 6 T 100 6 T 150 6 T 200 6"
                stroke="#d2c3b4"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="mt-5 text-neutral-700 leading-relaxed max-w-3xl">{intro}</p>
        </div>

        {/* content */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Common signs / symptoms" items={symptoms} />
          <Card title="Why it can happen" items={whyItHappens} />
        </div>

        <div className="mt-8">
          <div className="rounded-3xl border border-[#dbeae4] bg-white p-7 shadow-sm">
            <h3 className="font-serif text-xl text-neutral-900">Helpful tips</h3>
            <ul className="mt-4 space-y-3 text-neutral-700">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#2c7365]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/BookAppointment"
                className="inline-flex items-center rounded-full border border-[#215c4c] bg-[#5fb1a0]
                           px-6 py-3 text-sm font-semibold text-[#0d1b1a]
                           shadow-[0_6px_0_0_rgba(33,92,76,0.85)]
                           hover:translate-y-[1px] hover:shadow-[0_5px_0_0_rgba(33,92,76,0.85)] transition"
              >
                Talk to a counselor
              </Link>
              <Link
                to="/"
                className="inline-flex items-center rounded-full border border-[#e7e7e7] bg-white
                           px-6 py-3 text-sm font-semibold text-neutral-700 hover:shadow-sm transition"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, items }) {
  return (
    <div className="rounded-3xl border border-[#dbeae4] bg-white p-7 shadow-sm">
      <h3 className="font-serif text-xl text-neutral-900">{title}</h3>
      <ul className="mt-4 space-y-3 text-neutral-700">
        {items.map((x, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[#2c7365]" />
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
