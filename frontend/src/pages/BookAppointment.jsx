import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../utils/api";

function Field({ label, required, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-neutral-800">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function formatDateParts(date) {
  return {
    dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: String(date.getDate()),
    month: date.toLocaleDateString("en-US", { month: "long" }),
    year: String(date.getFullYear()),
  };
}

export default function BookAppointment() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = ["2024", "2025", "2026"];

  const today = new Date();
  const currentMonth = months[today.getMonth()];
  const currentYear = String(today.getFullYear());
  const currentDate = String(today.getDate());

  const weekData = useMemo(() => {
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      days.push({
        fullDate: d,
        ...formatDateParts(d),
      });
    }

    return days;
  }, []);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCounselors, setLoadingCounselors] = useState(false);
  const [counselorsError, setCounselorsError] = useState("");
  const [counselors, setCounselors] = useState([]);

  const [formData, setFormData] = useState({
    counselor: "",
    counselorId: "",
    counselorVerified: false,
    month: currentMonth,
    year: currentYear,
    date: currentDate,
    time: "",
    name: "",
    nickname: "",
    email: "",
    phone: "",
    paymentMethod: "",
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");

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

  const stepsMeta = [
    { id: 1, label: "Date & Time" },
    { id: 2, label: "Counselor" },
    { id: 3, label: "Guest Info" },
    { id: 4, label: "Payment" },
  ];

  const stepTitle = [
    "Choose Date and Time",
    "Choose Your Counselor",
    "Guest Information",
    "Guest Payment",
  ][step - 1];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatTimeForBackend = (slot) => {
    if (!slot) return "";

    const startPart = slot.split(" - ")[0].trim();
    const [time, period] = startPart.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (period.toLowerCase() === "am" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const formatDateForBackend = (
    month = formData.month,
    year = formData.year,
    date = formData.date
  ) => {
    const monthIndex = months.indexOf(month) + 1;
    return `${year}-${String(monthIndex).padStart(2, "0")}-${String(
      date
    ).padStart(2, "0")}`;
  };

  const fetchAvailableCounselors = async (date, time) => {
    try {
      setLoadingCounselors(true);
      setCounselorsError("");
      setCounselors([]);

      const res = await API.get("/guest-counselors/available", {
        params: { date, time },
      });

      const counselorList = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.data || [];

      const normalized = counselorList.map((item) => ({
        id: item.id,
        name: item.name || item.full_name || "Unnamed Counselor",
        verified: true,
      }));

      setCounselors(normalized);

      if (normalized.length === 0) {
        setCounselorsError(
          "No counselors are available for this selected time slot."
        );
      }
    } catch (err) {
      console.error("Failed to fetch available counselors:", err);
      setCounselors([]);
      setCounselorsError(
        err?.response?.data?.message ||
          "Could not load available counselors for this time."
      );
    } finally {
      setLoadingCounselors(false);
    }
  };

  const handleDayClick = async (index) => {
    const selected = weekData[index];

    setSelectedDayIndex(index);
    setCounselors([]);
    setCounselorsError("");

    setFormData((prev) => ({
      ...prev,
      date: selected.date,
      month: selected.month,
      year: selected.year,
      counselor: "",
      counselorId: "",
      counselorVerified: false,
    }));

    if (selectedTime) {
      const backendDate = formatDateForBackend(
        selected.month,
        selected.year,
        selected.date
      );
      const backendTime = formatTimeForBackend(selectedTime);
      await fetchAvailableCounselors(backendDate, backendTime);
    }
  };

  const handleTimeClick = async (slot) => {
    setSelectedTime(slot);
    setCounselors([]);
    setCounselorsError("");

    setFormData((prev) => ({
      ...prev,
      time: slot,
      counselor: "",
      counselorId: "",
      counselorVerified: false,
    }));

    const backendDate = formatDateForBackend(
      formData.month,
      formData.year,
      formData.date
    );
    const backendTime = formatTimeForBackend(slot);

    await fetchAvailableCounselors(backendDate, backendTime);
  };

  const handleMonthYearChange = async (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...formData,
      [name]: value,
      counselor: "",
      counselorId: "",
      counselorVerified: false,
    };

    setFormData(updatedForm);
    setCounselors([]);
    setCounselorsError("");

    if (selectedTime) {
      const backendDate = formatDateForBackend(
        updatedForm.month,
        updatedForm.year,
        updatedForm.date
      );
      const backendTime = formatTimeForBackend(selectedTime);
      await fetchAvailableCounselors(backendDate, backendTime);
    }
  };

  const canContinue = useMemo(() => {
    if (step === 1) return !!formData.date && !!formData.time;
    if (step === 2)
      return (
        !!formData.counselor && !!formData.counselorId && !loadingCounselors
      );
    if (step === 3)
      return !!formData.name && !!formData.email && !!formData.phone;
    if (step === 4) return !!formData.paymentMethod && !loading;
    return true;
  }, [step, formData, loading, loadingCounselors]);

  const submitEsewaForm = (paymentUrl, formFields) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(formFields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    if (formData.paymentMethod !== "esewa") {
      alert("Currently only eSewa is connected for guest booking.");
      return;
    }

    try {
      setLoading(true);

      const bookingPayload = {
        counselor_id: Number(formData.counselorId),
        date: formatDateForBackend(),
        time: formatTimeForBackend(formData.time),
        session_type: "chat",
        guest_name: formData.name,
        guest_email: formData.email,
        guest_phone: formData.phone,
        reason: formData.nickname || null,
        amount: 500,
      };

      const bookingRes = await API.post("/guest-bookings", bookingPayload);
      const booking = bookingRes.data?.booking;

      if (!booking?.id) {
        throw new Error("Guest booking created but booking id missing.");
      }

      const paymentRes = await API.post("/esewa/guest-pay", {
        guest_booking_id: booking.id,
      });

      const { payment_url, form_fields } = paymentRes.data || {};

      if (!payment_url || !form_fields) {
        throw new Error("Invalid payment response from server.");
      }

      submitEsewaForm(payment_url, form_fields);
    } catch (err) {
      console.error("Guest booking failed:", err);
      const message =
        err?.response?.data?.message ||
        "Booking failed. Please check the slot and try again.";
      alert(message);
      setLoading(false);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));
  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4fbf6,_#f8f8f4_45%,_#ffffff_75%)] pt-28">
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="relative block select-none">
            <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">
                MannSathi
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-800">
            <Link to="/" className="hover:text-[#215c4c] transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-[#215c4c] transition">
              About Us
            </Link>
            <Link to="/services" className="hover:text-[#215c4c] transition">
              Services
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                         px-7 py-2.5 text-[15px] font-semibold text-[#305b39]
                         shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                         hover:shadow-[0_3px_0_0_#89ad8f] transition"
            >
              Signup
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="mt-6 rounded-3xl border border-[#d7e7db] bg-[linear-gradient(140deg,_#f6fbf7_0%,_#ffffff_55%,_#f2f8f3_100%)] px-6 py-7 sm:px-8 sm:py-9 shadow-[0_14px_50px_rgba(22,67,54,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-[#a8c7b0] bg-[#e8f4eb] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2a5f4f]">
                No account required
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-[#153f34] leading-tight">
                Book as a Guest
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#47665c] leading-relaxed">
                Schedule a counseling session without creating an account. Choose
                a time first, then select from counselors available in that slot,
                share your details, and complete secure eSewa payment.
              </p>
            </div>

            <div className="w-full sm:w-auto rounded-2xl border border-[#dbeadf] bg-white/80 px-4 py-3 text-sm text-[#35584c]">
              <div className="font-semibold text-[#21493d]">
                Guest Session Booking
              </div>
              <div className="mt-1 text-xs sm:text-sm">
                Fast public booking flow for first-time visitors.
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[#deece2] bg-white px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5b7c71]">
                Step 1
              </div>
              <div className="mt-1 text-sm font-medium text-[#1e473b]">
                Select date and time
              </div>
            </div>
            <div className="rounded-2xl border border-[#deece2] bg-white px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5b7c71]">
                Step 2
              </div>
              <div className="mt-1 text-sm font-medium text-[#1e473b]">
                Choose counselor
              </div>
            </div>
            <div className="rounded-2xl border border-[#deece2] bg-white px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5b7c71]">
                Step 3
              </div>
              <div className="mt-1 text-sm font-medium text-[#1e473b]">
                Enter guest details
              </div>
            </div>
            <div className="rounded-2xl border border-[#deece2] bg-white px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5b7c71]">
                Step 4
              </div>
              <div className="mt-1 text-sm font-medium text-[#1e473b]">
                Pay securely with eSewa
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center">
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2e6151]">
            Complete Guest Booking
          </h2>
          <div className="mt-2 h-[2px] w-28 bg-[#215c4c]/25 mx-auto rounded-full" />
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 max-w-4xl mx-auto rounded-3xl border border-[#dce9df] bg-white/90 px-4 py-4 shadow-[0_12px_32px_rgba(36,69,56,0.08)]">
            {stepsMeta.map((s) => {
              const active = step === s.id;
              const done = step > s.id;

              return (
                <div key={s.id} className="flex items-center gap-3 min-w-[140px]">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border text-xs font-semibold ${
                      active
                        ? "bg-[#215c4c] text-white border-[#215c4c] shadow-md"
                        : done
                        ? "bg-[#e3f3e6] text-[#215c4c] border-[#89ad8f]"
                        : "bg-white text-neutral-500 border-[#e5e5e5]"
                    }`}
                  >
                    {s.id}
                  </div>
                  <div className="block">
                    <div
                      className={`text-sm font-medium ${
                        active ? "text-[#215c4c]" : "text-neutral-700"
                      }`}
                    >
                      {s.label}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {done ? "Completed" : active ? "In progress" : "Upcoming"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-4xl mx-auto mt-4 h-2 rounded-full bg-[#e8efe9] overflow-hidden">
            <div
              className="h-full bg-[linear-gradient(90deg,_#215c4c,_#5c927e)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-5xl bg-white/95 border border-[#dfe8df] rounded-3xl shadow-[0_22px_70px_rgba(24,62,49,0.12)] overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-[#edf2ed] bg-[linear-gradient(120deg,_#ffffff,_#f7fbf8)] flex items-center gap-4">
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
                <div className="text-lg font-semibold text-neutral-900">
                  {stepTitle}
                </div>
                <div className="text-sm text-neutral-500 mt-1">
                  {step === 1 &&
                    "Choose your preferred guest session slot. Available counselors will load automatically."}
                  {step === 2 &&
                    "Choose from counselors available in your selected date and time."}
                  {step === 3 &&
                    "Enter your guest details. Your information stays private."}
                  {step === 4 &&
                    "Review your guest booking and payment before continuing."}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#d6e5d9] bg-[#f4faf5] px-4 py-2 text-xs text-neutral-700">
                Step {step} of 4
              </div>
            </div>

            <div className="px-6 sm:px-8 py-8 min-h-[280px]">
              {step === 1 && (
                <div className="space-y-8">
                  <p className="text-sm text-neutral-600">
                    Choose your preferred guest session slot. After selecting
                    time, available counselors will be loaded automatically.
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-full bg-[#edf5ef] p-1 text-xs">
                        <button
                          type="button"
                          className="px-4 py-1 rounded-full bg-[#215c4c] text-white"
                        >
                          Week
                        </button>
                        <button
                          type="button"
                          className="px-4 py-1 rounded-full text-[#4b4b4b]"
                        >
                          Month
                        </button>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        name="month"
                        value={formData.month}
                        onChange={handleMonthYearChange}
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
                        onChange={handleMonthYearChange}
                        className="bg-[#fffdf7] border border-[#efe7dc] rounded-2xl px-4 py-2 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                      >
                        {years.map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                    {weekData.map((item, idx) => {
                      const active = idx === selectedDayIndex;

                      return (
                        <button
                          key={`${item.dayName}-${item.date}-${idx}`}
                          type="button"
                          onClick={() => handleDayClick(idx)}
                          className={`flex flex-col items-center justify-center rounded-2xl border py-3 transition ${
                            active
                              ? "border-[#215c4c] bg-[#f2fbf5] text-[#215c4c] shadow-sm"
                              : "border-[#efe7dc] bg-white text-neutral-600 hover:bg-[#fafafa]"
                          }`}
                        >
                          <span className="text-[11px]">{item.dayName}</span>
                          <span className="text-sm font-semibold mt-1">
                            {item.date}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">
                      Choose Guest Session Time
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

                  {loadingCounselors && (
                    <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-4 text-sm text-neutral-600">
                      Loading available counselors...
                    </div>
                  )}

                  {!loadingCounselors && formData.time && (
                    <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-4 text-sm text-neutral-700">
                      <div>
                        <span className="text-neutral-500">Selected Date:</span>{" "}
                        {formData.month} {formData.date}, {formData.year}
                      </div>
                      <div className="mt-1">
                        <span className="text-neutral-500">Selected Time:</span>{" "}
                        {formData.time}
                      </div>
                      <div className="mt-1">
                        <span className="text-neutral-500">
                          Available Counselors:
                        </span>{" "}
                        {counselors.length}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="w-full space-y-6">
                  <p className="text-sm text-neutral-600">
                    Only counselors available for your selected date and time are
                    shown here.
                  </p>

                  <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-4 text-sm text-neutral-700">
                    <div>
                      <span className="text-neutral-500">Selected Date:</span>{" "}
                      {formData.month} {formData.date}, {formData.year}
                    </div>
                    <div className="mt-1">
                      <span className="text-neutral-500">Selected Time:</span>{" "}
                      {formData.time || "Not selected yet"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4 items-start">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-800">
                        Guest Counselor Selection{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <select
                        name="counselor"
                        value={formData.counselorId}
                        disabled={!formData.time || loadingCounselors}
                        onChange={(e) => {
                          const selectedId = Number(e.target.value);
                          const c = counselors.find((x) => x.id === selectedId);

                          setFormData((prev) => ({
                            ...prev,
                            counselor: c ? c.name : "",
                            counselorId: c ? c.id : "",
                            counselorVerified: c ? c.verified : false,
                          }));
                        }}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                                   px-4 py-3 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]
                                   disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!formData.time
                            ? "Select date and time first"
                            : loadingCounselors
                            ? "Loading counselors..."
                            : counselors.length > 0
                            ? "Select a counselor"
                            : "No counselors available"}
                        </option>

                        {counselors.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {counselorsError && (
                        <p className="text-xs text-red-500">{counselorsError}</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#dce8df] bg-[#fbfdfb] px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-neutral-900">
                          {formData.counselor
                            ? formData.counselor
                            : "No guest counselor selected"}
                        </div>

                        {formData.counselor && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#e3f3e6] border border-[#89ad8f] px-3 py-1 text-xs font-semibold text-[#215c4c]">
                            ✔ Available
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
                        These counselors are filtered by the selected guest slot.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <p className="text-sm text-neutral-600">
                    Enter your guest details so we can send updates related to
                    your counseling session.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Guest Name" required>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7]
                                   px-4 py-3 text-sm outline-none
                                   focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="Enter guest name"
                      />
                    </Field>

                    <Field label="Preferred Name (optional)">
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
                    <Field label="Guest Email" required>
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

                    <Field label="Guest Phone" required>
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

                  <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-4 text-sm text-neutral-600">
                    Your information is kept private and used only for your
                    session. You may use a preferred name if that feels safer.
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-neutral-600">
                    Review your guest booking and payment before proceeding to
                    eSewa.
                  </p>

                  <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-4 text-sm text-neutral-700">
                    <div className="font-semibold text-neutral-900">
                      Guest Booking Summary
                    </div>
                    <div className="mt-2 space-y-1">
                      <div>
                        <span className="text-neutral-500">Counselor:</span>{" "}
                        {formData.counselor}
                      </div>
                      <div>
                        <span className="text-neutral-500">Date:</span>{" "}
                        {formData.month} {formData.date}, {formData.year}
                      </div>
                      <div>
                        <span className="text-neutral-500">Time:</span>{" "}
                        {formData.time}
                      </div>
                      <div>
                        <span className="text-neutral-500">Guest Name:</span>{" "}
                        {formData.name || "-"}
                      </div>
                      <div>
                        <span className="text-neutral-500">Guest Email:</span>{" "}
                        {formData.email || "-"}
                      </div>
                      <div>
                        <span className="text-neutral-500">Guest Phone:</span>{" "}
                        {formData.phone || "-"}
                      </div>
                      <div>
                        <span className="text-neutral-500">Amount:</span> Rs. 500
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-neutral-900">
                      Guest Payment Method
                    </div>
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
                    </select>
                  </div>

                  <div className="rounded-2xl border border-[#e3ebdf] bg-white px-4 py-3 text-xs text-neutral-500">
                    After successful payment, your guest booking confirmation and
                    follow-up details continue through the payment flow.
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 sm:px-8 py-5 border-t border-[#f0f0f0] bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {step === 1 && "Choose your preferred guest session slot."}
                {step === 2 &&
                  "Choose an available counselor for the selected slot."}
                {step === 3 && "Enter your guest details to continue."}
                {step === 4 &&
                  "Your guest booking will be confirmed after successful payment."}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue || loading}
                className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                           px-7 py-3 text-sm font-semibold text-[#305b39]
                           shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                           hover:shadow-[0_3px_0_0_#89ad8f] transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Processing..."
                  : step === 4
                  ? "Confirm & Pay"
                  : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}