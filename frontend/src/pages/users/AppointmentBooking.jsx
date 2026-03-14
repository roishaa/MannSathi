import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function BookAppointment() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Demo mode for FYP fallback when backend is unavailable
  const [isDemoMode, setIsDemoMode] = useState(false);

  /* ================= REAL DATA ================= */
  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);

  /* ================= PAYMENT MODAL STATE ================= */
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      nav("/login", { replace: true });
    }
  }, [nav]);

  useEffect(() => {
    const loadCounselors = async () => {
      setLoadingCounselors(true);
      setError("");
      try {
        const res = await api.get("/counselors");
        setCounselors(res.data?.items || []);
      } catch (e) {
        console.error("Failed to load counselors", e);

        if (e?.response?.status === 401) {
          // Clear auth state and redirect to login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          nav("/login", { replace: true });
        } else {
          // Set error message for display instead of alert
          setError("Failed to load counselors. Please try again later.");
          setCounselors([]);
        }
      } finally {
        setLoadingCounselors(false);
      }
    };
    loadCounselors();
  }, [nav]);

  /* ================= FORM ================= */
  const [formData, setFormData] = useState({
    counselor_id: "",
    counselorName: "",
    counselorSpecialization: "",
    month: new Date().toLocaleString("default", { month: "long" }),
    year: new Date().getFullYear().toString(),
    date: new Date().getDate().toString(),
    time: "",
    name: "",
    nickname: "",
    email: "",
    phone: "",
  });

  const [selectedTime, setSelectedTime] = useState("");

  /* ================= STATIC UI DATA ================= */
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
  const currentYear = new Date().getFullYear();
  const years = [currentYear.toString(), (currentYear + 1).toString()];

  // Generate actual dates for the selected month/year (first 14 days)
  const generateDatesForMonth = () => {
    const monthIndex = months.indexOf(formData.month);
    const year = parseInt(formData.year, 10);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= Math.min(daysInMonth, 14); day++) {
      const date = new Date(year, monthIndex, day);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      dates.push({ day, dayName, date });
    }

    return dates;
  };

  const availableDates = useMemo(
    () => generateDatesForMonth(),
    [formData.month, formData.year]
  );

  // BACKEND-SAFE TIME SLOTS (HH:mm)
  const timeSlots = [
    { label: "9:30 AM", subLabel: "Morning", value: "09:30", icon: "🌅" },
    { label: "10:30 AM", subLabel: "Morning", value: "10:30", icon: "🌅" },
    { label: "12:00 PM", subLabel: "Noon", value: "12:00", icon: "☀️" },
    { label: "1:00 PM", subLabel: "Afternoon", value: "13:00", icon: "☀️" },
    { label: "2:00 PM", subLabel: "Afternoon", value: "14:00", icon: "🌤️" },
    { label: "3:00 PM", subLabel: "Afternoon", value: "15:00", icon: "🌤️" },
    { label: "4:00 PM", subLabel: "Evening", value: "16:00", icon: "🌆" },
    { label: "5:00 PM", subLabel: "Evening", value: "17:00", icon: "🌆" },
  ];

  /* ================= HELPERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePickCounselor = (counselor) => {
    setFormData((p) => ({
      ...p,
      counselor_id: counselor.id,
      counselorName: counselor.name,
      counselorSpecialization: counselor.specialization || "",
    }));
  };

  const handleDayClick = (dateObj) => {
    setFormData((p) => ({ ...p, date: dateObj.day.toString() }));
  };

  const handleTimeClick = (slot) => {
    setSelectedTime(slot.value);
    setFormData((p) => ({ ...p, time: slot.value }));
  };

  const canContinue = useMemo(() => {
    if (step === 1) return !!formData.counselor_id;
    if (step === 2) return !!formData.date && !!formData.time;
    if (step === 3) return !!formData.name && !!formData.email && !!formData.phone;
    return true;
  }, [step, formData]);

  /* ================= PAYMENT HANDLING (DEMO ONLY) ================= */
  const handlePayNowDemo = async () => {
    setPaying(true);
    setPaySuccess(false);
    setError("");
    setIsDemoMode(true);

    // Demo-only: no backend calls for FYP presentation
    await new Promise((resolve) => setTimeout(resolve, 1300));

    setPaySuccess(true);
    setSuccessMessage("Payment successful. Appointment booked (Pending confirmation).");

    // Auto navigate after brief success display
    setTimeout(() => {
      setPaymentOpen(false);
      nav("/users/dashboard", { replace: true });
    }, 1000);

    setPaying(false);
  };

  // Close modal on ESC for better UX
  useEffect(() => {
    if (!paymentOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPaymentOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paymentOpen]);

  /* ================= FORM SUBMISSION ================= */
  const handleNext = async () => {
    setError("");

    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    // On step 4 (review), open payment modal instead of directly booking
    if (step === 4) {
      setPaySuccess(false);
      setPaying(false);
      setPaymentOpen(true);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const progressPercent = ((step - 1) / 3) * 100;

  const stepTitles = [
    { num: 1, title: "Choose Counselor", desc: "Select your preferred counselor" },
    { num: 2, title: "Pick Date & Time", desc: "Choose a convenient slot" },
    { num: 3, title: "Your Information", desc: "Tell us about yourself" },
    { num: 4, title: "Review & Confirm", desc: "Double-check your booking" },
  ];

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f0] via-[#f5f8f5] to-[#f0f8f5]">
      {/* Error Alert Banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b-2 border-red-400 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 font-bold"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Message Banner */}
      {successMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-50 border-b-2 border-green-400 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span className="text-green-800 font-medium">{successMessage}</span>
              {isDemoMode && (
                <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Pending (Demo Mode)
                </span>
              )}
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800 font-bold"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white px-6 py-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/users/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-4 transition"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Book Your Session</h1>
          <p className="text-white/90">Let's find the perfect time for your counseling session</p>

          {/* Progress Bar */}
          <div className="mt-6 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="mt-6 flex justify-between items-center">
            {stepTitles.map((s) => (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                    ${
                      step >= s.num
                        ? "bg-white text-[#215c4c] shadow-lg scale-110"
                        : "bg-white/20 text-white/60"
                    }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <p
                  className={`text-xs mt-2 hidden md:block ${
                    step === s.num ? "text-white font-semibold" : "text-white/60"
                  }`}
                >
                  {s.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {/* Step Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1e293b] mb-2">
              {stepTitles[step - 1].title}
            </h2>
            <p className="text-[#6b7280]">{stepTitles[step - 1].desc}</p>
          </div>

          {/* STEP 1: Choose Counselor */}
          {step === 1 && (
            <div className="space-y-4">
              {loadingCounselors ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-[#215c4c] border-t-transparent rounded-full animate-spin" />
                  <p className="mt-4 text-[#6b7280]">Loading counselors...</p>
                </div>
              ) : counselors.length === 0 ? (
                <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-amber-800">No counselors available at the moment.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {counselors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handlePickCounselor(c)}
                      className={`text-left p-6 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1
                        ${
                          formData.counselor_id === c.id
                            ? "border-[#215c4c] bg-[#f2fbf5] shadow-md"
                            : "border-[#e5e7eb] hover:border-[#a8d4c3]"
                        }`}
                      type="button"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#215c4c] to-[#2a7a66] flex items-center justify-center text-white text-xl font-bold shadow-md">
                          {c.name?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#1e293b] text-lg mb-1">{c.name}</h3>
                          {c.specialization && (
                            <p className="text-sm text-[#6b7280] mb-2">{c.specialization}</p>
                          )}
                          {c.experience_years && (
                            <p className="text-xs text-[#215c4c] font-medium">
                              {c.experience_years}+ years experience
                            </p>
                          )}
                        </div>
                        {formData.counselor_id === c.id && (
                          <div className="text-[#215c4c] text-2xl">✓</div>
                        )}
                      </div>
                      {c.bio && (
                        <p className="mt-4 text-sm text-[#6b7280] line-clamp-2">{c.bio}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-8">
              {/* Month & Year Selector */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Month</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-[#e5e7eb] px-4 py-3 focus:border-[#215c4c] focus:outline-none transition"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-[#e5e7eb] px-4 py-3 focus:border-[#215c4c] focus:outline-none transition"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-3">Select Date</label>
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.map((dateObj) => {
                    const isSelected = formData.date === dateObj.day.toString();
                    return (
                      <button
                        key={`${dateObj.dayName}-${dateObj.day}`}
                        onClick={() => handleDayClick(dateObj)}
                        className={`p-3 rounded-xl border-2 transition-all hover:shadow-md
                          ${
                            isSelected
                              ? "border-[#215c4c] bg-[#215c4c] text-white shadow-lg scale-105"
                              : "border-[#e5e7eb] hover:border-[#a8d4c3]"
                          }`}
                        type="button"
                      >
                        <div className="text-xs font-medium mb-1">{dateObj.dayName}</div>
                        <div className="text-lg font-bold">{dateObj.day}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-3">Choose Time</label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.value;
                    return (
                      <button
                        key={slot.value}
                        onClick={() => handleTimeClick(slot)}
                        className={`p-4 rounded-xl border-2 transition-all hover:shadow-md text-left
                          ${
                            isSelected
                              ? "border-[#215c4c] bg-[#f2fbf5] shadow-md"
                              : "border-[#e5e7eb] hover:border-[#a8d4c3]"
                          }`}
                        type="button"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{slot.icon}</span>
                          <span className="font-semibold text-[#1e293b]">{slot.label}</span>
                        </div>
                        <p className="text-xs text-[#6b7280]">{slot.subLabel}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: User Information */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border-2 border-[#e5e7eb] px-4 py-3 focus:border-[#215c4c] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Preferred Name / Nickname <span className="text-[#6b7280] text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="How would you like to be called?"
                  className="w-full rounded-xl border-2 border-[#e5e7eb] px-4 py-3 focus:border-[#215c4c] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border-2 border-[#e5e7eb] px-4 py-3 focus:border-[#215c4c] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border-2 border-[#e5e7eb] px-4 py-3 focus:border-[#215c4c] focus:outline-none transition"
                />
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Privacy Notice:</strong> Your information is confidential and will only be used to
                  facilitate your counseling session.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#f2fbf5] to-[#e8f5e9] rounded-2xl p-6 border-2 border-[#a8d4c3]">
                <h3 className="font-semibold text-[#1e293b] mb-4 text-lg">Session Summary</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#215c4c] flex items-center justify-center text-white flex-shrink-0">
                      👤
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Counselor</p>
                      <p className="font-semibold text-[#1e293b]">{formData.counselorName}</p>
                      {formData.counselorSpecialization && (
                        <p className="text-xs text-[#6b7280]">{formData.counselorSpecialization}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#215c4c] flex items-center justify-center text-white flex-shrink-0">
                      📅
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Date & Time</p>
                      <p className="font-semibold text-[#1e293b]">
                        {formData.month} {formData.date}, {formData.year}
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        {timeSlots.find((t) => t.value === formData.time)?.label || formData.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#215c4c] flex items-center justify-center text-white flex-shrink-0">
                      💬
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Session Type</p>
                      <p className="font-semibold text-[#1e293b]">Online Chat Session</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#215c4c] flex items-center justify-center text-white flex-shrink-0">
                      📧
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Contact Information</p>
                      <p className="font-semibold text-[#1e293b]">{formData.name}</p>
                      <p className="text-sm text-[#6b7280]">{formData.email}</p>
                      <p className="text-sm text-[#6b7280]">{formData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>⏳ Pending Confirmation:</strong> Your appointment will be pending until confirmed by
                  the counselor. You'll receive a notification once confirmed.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#e5e7eb]">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-full border-2 border-[#e5e7eb] text-[#374151] font-medium hover:border-[#215c4c] hover:text-[#215c4c] transition"
                type="button"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={!canContinue || loading}
              className={`px-8 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg
                ${
                  !canContinue || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white hover:scale-105"
                }`}
              type="button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : step < 4 ? (
                "Continue →"
              ) : (
                "Proceed to Payment →"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      {paymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40"
          onClick={() => !paying && setPaymentOpen(false)}
        >
          {/* MODAL CARD */}
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden
                       animate-in slide-in-from-bottom-5 md:slide-in-from-center
                       max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (relative for close button) */}
            <div className="relative bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white px-6 py-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">💳 Confirm Payment</h2>
              <p className="text-white/80 text-sm mt-1">Complete your booking</p>

              {/* Close X */}
              <button
                type="button"
                onClick={() => !paying && setPaymentOpen(false)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                aria-label="Close payment modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable modal content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Booking Summary */}
              <div className="bg-gradient-to-br from-[#f2fbf5] to-[#e8f5e9] rounded-2xl p-4 border border-[#a8d4c3]">
                <h3 className="font-semibold text-[#1e293b] mb-3 text-sm">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#6b7280]">📋 Counselor:</span>
                    <span className="font-semibold text-[#1e293b]">{formData.counselorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#6b7280]">📅 Date:</span>
                    <span className="font-semibold text-[#1e293b]">
                      {formData.month} {formData.date}, {formData.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#6b7280]">🕐 Time:</span>
                    <span className="font-semibold text-[#1e293b]">
                      {timeSlots.find((t) => t.value === formData.time)?.label || formData.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#6b7280]">💬 Type:</span>
                    <span className="font-semibold text-[#1e293b]">Online Chat</span>
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              <div className="bg-white border-2 border-[#e5e7eb] rounded-xl p-4">
                <p className="text-sm text-[#6b7280] mb-1">Amount to Pay</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#215c4c]">₹500</span>
                  <span className="text-[#6b7280]">NPR</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#374151]">Select Payment Method</p>

                <div className="space-y-2">
                  {/* eSewa */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("esewa")}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3
                      ${
                        paymentMethod === "esewa"
                          ? "border-[#215c4c] bg-[#f2fbf5] shadow-md"
                          : "border-[#e5e7eb] hover:border-[#a8d4c3]"
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${
                        paymentMethod === "esewa"
                          ? "border-[#215c4c] bg-[#215c4c]"
                          : "border-[#d1d5db]"
                      }`}
                    >
                      {paymentMethod === "esewa" && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span className="text-left">
                      <div className="font-semibold text-[#1e293b]">eSewa</div>
                      <p className="text-xs text-[#6b7280]">Popular in Nepal</p>
                    </span>
                  </button>

                  {/* Khalti */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("khalti")}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3
                      ${
                        paymentMethod === "khalti"
                          ? "border-[#215c4c] bg-[#f2fbf5] shadow-md"
                          : "border-[#e5e7eb] hover:border-[#a8d4c3]"
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${
                        paymentMethod === "khalti"
                          ? "border-[#215c4c] bg-[#215c4c]"
                          : "border-[#d1d5db]"
                      }`}
                    >
                      {paymentMethod === "khalti" && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span className="text-left">
                      <div className="font-semibold text-[#1e293b]">Khalti</div>
                      <p className="text-xs text-[#6b7280]">Digital Wallet</p>
                    </span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3
                      ${
                        paymentMethod === "card"
                          ? "border-[#215c4c] bg-[#f2fbf5] shadow-md"
                          : "border-[#e5e7eb] hover:border-[#a8d4c3]"
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${
                        paymentMethod === "card"
                          ? "border-[#215c4c] bg-[#215c4c]"
                          : "border-[#d1d5db]"
                      }`}
                    >
                      {paymentMethod === "card" && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span className="text-left">
                      <div className="font-semibold text-[#1e293b]">Credit/Debit Card</div>
                      <p className="text-xs text-[#6b7280]">Visa, Mastercard</p>
                    </span>
                  </button>
                </div>
              </div>

              {/* Demo Success Message */}
              {paySuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-sm text-green-800 font-semibold">
                    ✅ Payment successful. Appointment booked (Pending confirmation).
                  </p>
                </div>
              )}

              {/* Demo Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-800">
                  <strong>🧪 </strong> No real charges will be made. Click "Pay Now" to
                  simulate a successful payment.
                </p>
              </div>
            </div>

            {/* Modal Footer / Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[#e5e7eb] flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentOpen(false)}
                disabled={paying}
                className="flex-1 px-4 py-3 rounded-full border-2 border-[#e5e7eb] text-[#374151] font-semibold hover:border-[#215c4c] hover:text-[#215c4c] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handlePayNowDemo}
                disabled={paying || paySuccess}
                className={`flex-1 px-4 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2
                  ${
                    paying || paySuccess
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white hover:shadow-lg hover:scale-105"
                  }`}
              >
                {paying ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : paySuccess ? (
                  <>Done</>
                ) : (
                  <>💳 Pay Now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
