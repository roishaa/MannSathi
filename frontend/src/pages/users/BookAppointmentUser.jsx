import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export default function BookAppointmentUser() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    counselor: "",
    counselorVerified: false,
    month: "December",
    year: "2025",
    date: "1",
    time: "",
    name: "",
    nickname: "",
    email: "",
    phone: "",
    paymentMethod: "",
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Mon
  const [selectedTime, setSelectedTime] = useState("");

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const years = ["2024", "2025", "2026"];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDates = ["1", "2", "3", "4", "5", "6", "7"];

  const timeSlots = [
    "9:30 am - 10:20 am",
    "10:30 am - 11:20 am",
    "12:00 pm - 12:50 pm",
    "1:00 pm - 1:50 pm",
    "2:00 pm - 2:50 pm",
    "3:00 pm - 3:50 pm",
    "4:00 pm - 4:50 pm",
    "5:00 pm - 5:50 pm",
  ];

  // Demo counselor data (later you’ll fetch this from backend)
  const counselors = [
  { name: "Dr. Anjana Shrestha", verified: true },
  { name: "Ms. Sita Lama", verified: true },
];


  const stepsMeta = [
    { id: 1, label: "Counselor" },
    { id: 2, label: "Date & Time" },
    { id: 3, label: "Your Info" },
    { id: 4, label: "Payment" },
  ];

  const stepTitle = ["Select Counselor", "Select Date and Time", "Your Information", "Payment"][step - 1];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayClick = (index) => {
    setSelectedDayIndex(index);
    setFormData((prev) => ({ ...prev, date: weekDates[index] }));
  };

  const handleTimeClick = (slot) => {
    setSelectedTime(slot);
    setFormData((prev) => ({ ...prev, time: slot }));
  };

  const handlePickCounselor = (c) => {
    setFormData((prev) => ({
      ...prev,
      counselor: c.name,
      counselorVerified: c.verified,
    }));
  };

  const canContinue = useMemo(() => {
    if (step === 1) return !!formData.counselor;
    if (step === 2) return !!formData.date && !!formData.time;
    if (step === 3) return !!formData.name && !!formData.email && !!formData.phone;
    if (step === 4) return !!formData.paymentMethod;
    return true;
  }, [step, formData]);

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      console.log("Submit:", formData);
      alert("Appointment booked (demo)!");
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-white pt-28">
      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/users/dashboard" className="relative block select-none">
            <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* Page heading */}
        <div className="text-center mt-6">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-800">
            Book An Appointment
          </h2>
          <div className="mt-2 h-[2px] w-24 bg-[#215c4c]/20 mx-auto rounded-full" />
        </div>

        {/* Stepper + progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
            {stepsMeta.map((s) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-semibold ${
                      active
                        ? "bg-[#215c4c] text-white border-[#215c4c]"
                        : done
                        ? "bg-[#e3f3e6] text-[#215c4c] border-[#89ad8f]"
                        : "bg-white text-neutral-500 border-[#e5e5e5]"
                    }`}
                  >
                    {s.id}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm ${active ? "text-[#215c4c]" : "text-neutral-700"}`}>
                      {s.label}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {done ? "Done" : active ? "Current" : "Upcoming"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto mt-4 h-2 rounded-full bg-[#efefef] overflow-hidden">
            <div className="h-full bg-[#215c4c] transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-4xl bg-white border border-[#efe7dc] rounded-3xl shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Card header */}
            <div className="px-8 py-6 border-b border-[#f0f0f0] bg-white flex items-center gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl border border-[#e6e6e6]
                             bg-white hover:bg-[#fafafa] shadow-sm text-neutral-700 transition"
                  aria-label="Go back"
                >
                  <span className="text-lg -ml-[2px]">‹</span>
                </button>
              )}

              <div className="flex-1">
                <div className="text-lg font-semibold text-neutral-900">{stepTitle}</div>
                <div className="text-sm text-neutral-500 mt-1">
                  {step === 1 && "Choose a counselor you feel comfortable talking with."}
                  {step === 2 && "Pick a date and time slot that works for you."}
                  {step === 3 && "Use your real name or a nickname you feel safe with."}
                  {step === 4 && "Choose your payment method to confirm."}
                </div>
              </div>

              {/* Small status pill */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#e8e1d6] bg-[#fffdf7] px-4 py-2 text-xs text-neutral-700">
                Step {step} of 4
              </div>
            </div>

            {/* Card body */}
            <div className="px-8 py-8 min-h-[280px]">
 {/* STEP 1 */}
{step === 1 && (
  <div className="w-full space-y-6">
    <p className="text-sm text-neutral-500">
      Choose a counselor you feel comfortable talking with.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4 items-start">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800">
          Counselor <span className="text-red-500">*</span>
        </label>

        <select
          name="counselor"
          value={formData.counselor}
          onChange={(e) => {
            const selectedName = e.target.value;
            const c = counselors.find((x) => x.name === selectedName);
            setFormData((prev) => ({
              ...prev,
              counselor: selectedName,
              counselorVerified: c ? c.verified : false,
            }));
          }}
          className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                     px-4 py-3 text-sm outline-none
                     focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
        >
          <option value="">Select counselor</option>
          {counselors.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right side: status + small note */}
      <div className="rounded-2xl border border-[#e8e1d6] bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-neutral-900">
            {formData.counselor ? formData.counselor : "No counselor selected"}
          </div>

          {formData.counselor && (
            formData.counselorVerified ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e3f3e6] border border-[#89ad8f] px-3 py-1 text-xs font-semibold text-[#215c4c]">
                ✔ Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff7e6] border border-[#f3d6a4] px-3 py-1 text-xs font-semibold text-[#7a5a18]">
                ⏳ Pending
              </span>
            )
          )}
        </div>

        <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
          Only <span className="font-semibold text-neutral-700">Verified</span> counselors should be available
          for real bookings. Pending accounts are shown here only for demo/testing.
        </p>
      </div>
    </div>
  </div>
)}


              {/* STEP 2: Calendar + time */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-full bg-[#f3f2ff] p-1 text-xs">
                        <button type="button" className="px-4 py-1 rounded-full bg-[#215c4c] text-white">
                          Week
                        </button>
                        <button type="button" className="px-4 py-1 rounded-full text-[#4b4b4b]">
                          Month
                        </button>
                      </span>
                      <span className="text-xs text-neutral-500 hidden sm:inline">
                        Dec 1, 2025 - Dec 7, 2025
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        className="bg-[#fffdf7] border border-[#efe7dc] rounded-2xl px-4 py-2 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                      >
                        {months.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>

                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="bg-[#fffdf7] border border-[#efe7dc] rounded-2xl px-4 py-2 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                      >
                        {years.map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="w-10 h-10 rounded-2xl border border-[#efe7dc] bg-white hover:bg-[#fafafa] transition"
                        aria-label="Previous"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="w-10 h-10 rounded-2xl border border-[#efe7dc] bg-white hover:bg-[#fafafa] transition"
                        aria-label="Next"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                    {weekDays.map((day, idx) => {
                      const active = idx === selectedDayIndex;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayClick(idx)}
                          className={`flex flex-col items-center justify-center rounded-2xl border py-3 transition ${
                            active
                              ? "border-[#215c4c] bg-[#f2fbf5] text-[#215c4c] shadow-sm"
                              : "border-[#efe7dc] bg-white text-neutral-600 hover:bg-[#fafafa]"
                          }`}
                        >
                          <span className="text-[11px]">{day}</span>
                          <span className="text-sm font-semibold mt-1">{weekDates[idx]}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">
                      Choose Time
                    </h4>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {timeSlots.map((slot) => {
                        const active = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimeClick(slot)}
                            className={`rounded-2xl border px-4 py-3 text-sm text-left transition ${
                              active
                                ? "border-[#215c4c] bg-[#f2fbf5] text-[#215c4c] shadow-sm"
                                : "border-[#efe7dc] bg-white text-neutral-800 hover:bg-[#fafafa]"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Your info */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Name" required>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                                   px-4 py-3 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="Enter your name"
                      />
                    </Field>

                    <Field label="Nickname (optional)">
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                                   px-4 py-3 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="Optional"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Email" required>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                                   px-4 py-3 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="example@gmail.com"
                      />
                    </Field>

                    <Field label="Phone Number" required>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                                   px-4 py-3 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="98XXXXXXXX"
                      />
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#fffdf7] px-5 py-4 text-sm text-neutral-600">
                    Your information stays private. You can use a nickname if you feel more comfortable.
                  </div>
                </div>
              )}

              {/* STEP 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#fffdf7] px-5 py-4 text-sm text-neutral-700">
                    <div className="font-semibold text-neutral-900">Booking Summary</div>
                    <div className="mt-2 space-y-1">
                      <div><span className="text-neutral-500">Counselor:</span> {formData.counselor} {formData.counselorVerified ? "✔" : "⏳"}</div>
                      <div><span className="text-neutral-500">Date:</span> {formData.month} {formData.date}, {formData.year}</div>
                      <div><span className="text-neutral-500">Time:</span> {formData.time}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-neutral-900">Payment Method</div>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full sm:w-72 rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                                 px-4 py-3 text-sm outline-none
                                 focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                    >
                      <option value="">Select</option>
                      <option value="esewa">eSewa</option>
                      <option value="khalti">Khalti</option>
                    </select>
                  </div>

                  <div className="text-xs text-neutral-500">
                    Demo note: Payment gateway integration can be added later (eSewa/Khalti).
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-[#f0f0f0] bg-white flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                {step === 1 && "Pick a counselor to continue."}
                {step === 2 && "Select a date and time slot."}
                {step === 3 && "Fill required details to continue."}
                {step === 4 && "Select payment method to confirm."}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue}
                className="px-7 py-3 text-sm rounded-full font-semibold transition
                           border border-[#89ad8f] bg-[#e3f3e6] text-[#305b39]
                           shadow-[0_4px_0_0_#89ad8f]
                           hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f]
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {step < 4 ? "Continue" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
