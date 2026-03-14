import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function BookAppointment() {
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [paying, setPaying] = useState(false);

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
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          nav("/login", { replace: true });
        } else {
          setError("Failed to load counselors. Please try again later.");
          setCounselors([]);
        }
      } finally {
        setLoadingCounselors(false);
      }
    };

    loadCounselors();
  }, [nav]);

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

  const generateDatesForMonth = () => {
    const monthIndex = months.indexOf(formData.month);
    const year = parseInt(formData.year, 10);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= daysInMonth; day++) {
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

  const selectedDateISO = useMemo(() => {
    const monthIndex = months.indexOf(formData.month);
    const year = parseInt(formData.year, 10);
    const day = parseInt(formData.date, 10);

    if (monthIndex < 0 || !year || !day) return "";

    const localDate = new Date(year, monthIndex, day);
    const yyyy = localDate.getFullYear();
    const mm = String(localDate.getMonth() + 1).padStart(2, "0");
    const dd = String(localDate.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }, [formData.month, formData.year, formData.date, months]);

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

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.counselor_id || !selectedDateISO) {
        setBookedSlots([]);
        return;
      }

      setLoadingSlots(true);

      try {
        const res = await api.get("/appointments/booked-slots", {
          params: {
            counselor_id: formData.counselor_id,
            date: selectedDateISO,
          },
        });

        setBookedSlots(res.data?.items || []);
      } catch (e) {
        console.error("Failed to fetch booked slots", e);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [formData.counselor_id, selectedDateISO]);

  useEffect(() => {
    if (selectedTime && bookedSlots.includes(selectedTime)) {
      setSelectedTime("");
      setFormData((p) => ({ ...p, time: "" }));
    }
  }, [bookedSlots, selectedTime]);

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
      time: "",
    }));
    setSelectedTime("");
  };

  const handleDayClick = (dateObj) => {
    setFormData((p) => ({
      ...p,
      date: dateObj.day.toString(),
      time: "",
    }));
    setSelectedTime("");
  };

  const handleTimeClick = (slot) => {
    setSelectedTime(slot.value);
    setFormData((p) => ({ ...p, time: slot.value }));
  };

  const canContinue = useMemo(() => {
    if (step === 1) return !!formData.counselor_id;
    if (step === 2) {
      return !!formData.date && !!formData.time && !bookedSlots.includes(formData.time);
    }
    if (step === 3) return !!formData.name && !!formData.email && !!formData.phone;
    return true;
  }, [step, formData, bookedSlots]);

  const handleEsewaPayment = async () => {
    if (paymentMethod !== "esewa") {
      setError("For now, only eSewa payment is enabled.");
      return;
    }

    try {
      setPaying(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        counselor_id: formData.counselor_id,
        appointment_date: selectedDateISO,
        appointment_time: formData.time,
        type: "chat",
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        phone: formData.phone,
        amount: 500,
      };

      const res = await api.post("/esewa/pay", payload);

      const { payment_url, form_fields } = res.data || {};

      if (!payment_url || !form_fields) {
        throw new Error("Invalid eSewa payment response.");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = payment_url;

      Object.entries(form_fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      console.error("Payment initiation failed", e);

      if (e?.response?.status === 422) {
        setError(e?.response?.data?.message || "This slot is already booked.");
      } else if (e?.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        nav("/login", { replace: true });
      } else {
        setError(e?.response?.data?.message || "Failed to initialize eSewa payment.");
      }
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    if (!paymentOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !paying) setPaymentOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paymentOpen, paying]);

  const handleNext = () => {
    setError("");

    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    if (step === 4) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f0] via-[#f5f8f5] to-[#f0f8f5]">
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

      {successMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-50 border-b-2 border-green-400 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span className="text-green-800 font-medium">{successMessage}</span>
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

          <div className="mt-6 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1e293b] mb-2">
              {stepTitles[step - 1].title}
            </h2>
            <p className="text-[#6b7280]">{stepTitles[step - 1].desc}</p>
          </div>

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

          {step === 2 && (
            <div className="space-y-8">
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

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-3">Choose Time</label>

                {loadingSlots && (
                  <p className="text-sm text-[#6b7280] mb-3">Checking available slots...</p>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.value;
                    const isBooked = bookedSlots.includes(slot.value);

                    return (
                      <button
                        key={slot.value}
                        onClick={() => !isBooked && handleTimeClick(slot)}
                        disabled={isBooked}
                        className={`p-4 rounded-xl border-2 transition-all text-left
                          ${
                            isBooked
                              ? "border-red-300 bg-red-50 text-red-400 cursor-not-allowed opacity-80"
                              : isSelected
                              ? "border-[#215c4c] bg-[#f2fbf5] shadow-md"
                              : "border-[#e5e7eb] hover:border-[#a8d4c3] hover:shadow-md"
                          }`}
                        type="button"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{slot.icon}</span>
                          <span className="font-semibold">
                            {slot.label}
                            {isBooked && " (Booked)"}
                          </span>
                        </div>
                        <p className="text-xs">{isBooked ? "Unavailable" : slot.subLabel}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
                  <strong>Privacy Notice:</strong> Your information is confidential and will only be
                  used to facilitate your counseling session.
                </p>
              </div>
            </div>
          )}

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
                  <strong>⏳ Pending Confirmation:</strong> Your appointment will remain pending until
                  confirmed by the counselor after successful payment verification.
                </p>
              </div>
            </div>
          )}

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

      {paymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40"
          onClick={() => !paying && setPaymentOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden
                       animate-in slide-in-from-bottom-5 md:slide-in-from-center
                       max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white px-6 py-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">💳 Confirm Payment</h2>
              <p className="text-white/80 text-sm mt-1">Complete your booking</p>

              <button
                type="button"
                onClick={() => !paying && setPaymentOpen(false)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                aria-label="Close payment modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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

              <div className="bg-white border-2 border-[#e5e7eb] rounded-xl p-4">
                <p className="text-sm text-[#6b7280] mb-1">Amount to Pay</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#215c4c]">₹500</span>
                  <span className="text-[#6b7280]">NPR</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#374151]">Select Payment Method</p>

                <div className="space-y-2">
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
                      <p className="text-xs text-[#6b7280]">Enabled for sandbox payment</p>
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="w-full p-4 rounded-xl border-2 border-[#e5e7eb] opacity-50 cursor-not-allowed flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-[#d1d5db] flex items-center justify-center flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-[#1e293b]">Khalti</div>
                      <p className="text-xs text-[#6b7280]">Coming next</p>
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="w-full p-4 rounded-xl border-2 border-[#e5e7eb] opacity-50 cursor-not-allowed flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-[#d1d5db] flex items-center justify-center flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-[#1e293b]">Credit/Debit Card</div>
                      <p className="text-xs text-[#6b7280]">Not enabled yet</p>
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-800">
                  <strong>🧪 Sandbox Mode:</strong> You will be redirected to eSewa's test payment
                  page. The appointment slot will only be booked after successful payment callback.
                </p>
              </div>
            </div>

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
                onClick={handleEsewaPayment}
                disabled={paying}
                className={`flex-1 px-4 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2
                  ${
                    paying
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white hover:shadow-lg hover:scale-105"
                  }`}
              >
                {paying ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>💳 Pay with eSewa</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}