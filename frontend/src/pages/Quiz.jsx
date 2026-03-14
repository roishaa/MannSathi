// src/pages/Quiz.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const QUESTIONS = [
  {
    id: "overwhelmed",
    q: "In the last 7 days, how often have you felt overwhelmed?",
    options: ["Never", "Sometimes", "Often", "Almost always"],
  },
  {
    id: "sleep",
    q: "How has your sleep been recently?",
    options: ["Good", "Okay", "Poor", "Very poor"],
  },
  {
    id: "overthinking",
    q: "Do you find yourself overthinking the same things repeatedly?",
    options: ["Rarely", "Sometimes", "Often", "All the time"],
  },
  {
    id: "energy",
    q: "How is your energy level during the day?",
    options: ["High", "Normal", "Low", "Very low"],
  },
  {
    id: "supported",
    q: "How supported do you feel right now?",
    options: ["Very supported", "Somewhat", "Not much", "Not at all"],
  },
];

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));

  const completed = useMemo(
    () => answers.every((a) => a !== null),
    [answers]
  );

  const score = useMemo(() => {
    // score = sum of selected option index (0..3)
    return answers.reduce((sum, a) => sum + (a ?? 0), 0);
  }, [answers]);

  const result = useMemo(() => {
    const max = 3 * QUESTIONS.length;
    const pct = (score / max) * 100;

    if (pct < 30) {
      return {
        title: "You seem fairly balanced lately",
        desc:
          "You may still benefit from small habits like consistent sleep, gentle routines, and short check-ins.",
        primaryCta: { label: "Explore services", to: "/services" },
      };
    }
    if (pct < 60) {
      return {
        title: "You might be carrying some stress",
        desc:
          "It could help to slow down, set boundaries, and talk things through. Tracking your mood for a week can also help.",
        primaryCta: { label: "Take a short session", to: "/BookAppointment" },
      };
    }
    return {
      title: "You may be feeling quite overwhelmed",
      desc:
        "You don’t have to handle it alone. Consider booking a short session or reaching out to someone you trust today.",
      primaryCta: { label: "Book appointment", to: "/BookAppointment" },
    };
  }, [score]);

  const current = QUESTIONS[step];

  const selectOption = (optIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optIndex;
      return next;
    });

    if (step < QUESTIONS.length - 1) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const reset = () => {
    setStep(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-28 pb-16">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700
                     hover:text-[#215c4c] transition mb-6"
        >
          ← Back to home
        </Link>

        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs text-neutral-700">
            <span className="h-2 w-2 rounded-full bg-[#215c4c]" />
            Quick self-check (not a diagnosis)
          </div>

          <h1 className="mt-6 text-3xl md:text-4xl font-serif text-neutral-900">
            What’s really on your mind?
          </h1>
          <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">
            Answer a few questions to get a gentle direction. This is a wellbeing
            check, not a medical diagnosis.
          </p>
        </div>

        {/* Card */}
        <div className="mt-10 rounded-3xl border border-[#ededed] bg-white p-8 shadow-sm">
          {!completed ? (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between gap-6">
                <p className="text-xs font-semibold text-neutral-500">
                  Question {step + 1} of {QUESTIONS.length}
                </p>

                <div className="flex gap-2">
                  {QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-8 rounded-full ${
                        i <= step ? "bg-[#215c4c]" : "bg-[#e8e8e8]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <p className="mt-6 text-lg font-semibold text-neutral-900">
                {current.q}
              </p>

              {/* Options */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => selectOption(idx)}
                    className="text-left rounded-2xl border border-[#e7e7e7] bg-white px-5 py-4
                               text-sm font-semibold text-neutral-900 shadow-sm
                               hover:shadow-md hover:-translate-y-[1px] transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Footer actions */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="text-sm font-semibold text-neutral-600 disabled:opacity-40"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="text-sm font-semibold text-[#215c4c] hover:underline"
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Result */}
              <p className="text-xs font-semibold text-neutral-500">Your result</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-serif text-neutral-900">
                {result.title}
              </h2>
              <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">
                {result.desc}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={result.primaryCta.to}
                  className="inline-flex items-center rounded-full bg-[#215c4c] text-white
                             px-7 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition"
                >
                  {result.primaryCta.label}
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center rounded-full border border-[#e7e7e7] bg-white
                             px-7 py-2.5 text-sm font-semibold text-neutral-900
                             shadow-sm hover:shadow-md transition"
                >
                  Explore services
                </Link>

                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center rounded-full border border-[#e7e7e7] bg-white
                             px-7 py-2.5 text-sm font-semibold text-neutral-900
                             shadow-sm hover:shadow-md transition"
                >
                  Take again
                </button>
              </div>

              <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
                If you feel unsafe or in immediate danger, please contact local
                emergency services or visit the nearest hospital. MannSathi is not
                an emergency service.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
