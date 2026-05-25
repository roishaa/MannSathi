import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { API } from "../utils/api";

// ─── Rolling slot helpers ─────────────────────────────────────────────────────
const generateRollingSlots = () => {
  const now = new Date();
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const firstSlotMins = Math.ceil(totalMins / 10) * 10;
  const endMins = 19 * 60; // 7:00 PM (realistic counselor end time)
  const slots = [];
  for (let mins = firstSlotMins; mins <= endMins; mins += 10) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const suffix = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    const label = `${displayH}:${String(m).padStart(2, "0")} ${suffix}`;
    const minsFromNow = mins - totalMins;
    slots.push({ value, label, minsFromNow });
  }
  return slots;
};

const getTodayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatWaitTime = (minsFromNow) => {
  if (minsFromNow <= 0) return "Now";
  if (minsFromNow < 60) return `${minsFromNow} min${minsFromNow !== 1 ? "s" : ""}`;
  const hrs = Math.floor(minsFromNow / 60);
  const mins = minsFromNow % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hr`;
};

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

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [slots, setSlots] = useState(() => generateRollingSlots());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(false);
  const [counselorsError, setCounselorsError] = useState("");

  // ── NEW: track slots confirmed to have no counselors available ──
  const [unavailableSlots, setUnavailableSlots] = useState(new Set());

  const [autoFinding, setAutoFinding] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const autoFindRef = useRef(false);

  const [paymentData, setPaymentData] = useState(null);
  const [guestBookingId, setGuestBookingId] = useState(null);
  const [guestTransactionUuid, setGuestTransactionUuid] = useState("");

  const [sessionType, setSessionType] = useState("chat");

  const [formData, setFormData] = useState({
    counselor: "",
    counselorId: "",
    name: "",
    nickname: "",
    email: "",
    phone: "",
    paymentMethod: "",
  });

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  });

  const stepsMeta = [
    { id: 1, label: "Pick Time" },
    { id: 2, label: "Counselor" },
    { id: 3, label: "Your Info" },
    { id: 4, label: "Payment" },
  ];

  const stepTitle = [
    "Next Available Session",
    "Choose Your Counselor",
    "Guest Information",
    "Guest Payment",
  ][step - 1];

  // Refresh slots every minute and clear stale unavailable slots
  useEffect(() => {
    const interval = setInterval(() => {
      const freshSlots = generateRollingSlots();
      setSlots(freshSlots);
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));

      // Keep only unavailable slots that are still in the fresh list
      const freshValues = new Set(freshSlots.map((s) => s.value));
      setUnavailableSlots((prev) => {
        const next = new Set([...prev].filter((v) => freshValues.has(v)));
        return next;
      });

      setSelectedSlot((prev) => {
        if (!prev) return prev;
        const still = freshSlots.find((s) => s.value === prev.value);
        return still || null;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCounselorsForSlot = useCallback(async (slot) => {
    if (!slot) return [];
    try {
      const res = await API.get("/guest-counselors/available", {
        params: { date: getTodayISO(), time: slot.value },
      });
      const list = Array.isArray(res.data) ? res.data : res.data?.items || res.data?.data || [];
      return list.map((item) => ({
        id: item.id,
        name: item.name || item.full_name || "Unnamed Counselor",
        specialization: item.specialization || "",
        experience_years: item.experience_years || null,
        bio: item.bio || "",
      }));
    } catch {
      return [];
    }
  }, []);

  const autoFindNextSlot = useCallback(async () => {
    if (autoFindRef.current) return;
    autoFindRef.current = true;
    setAutoFinding(true);
    setCheckedCount(0);
    setCounselors([]);
    setCounselorsError("");
    setSelectedSlot(null);
    setPageError("");

    const freshSlots = generateRollingSlots();
    // ── CHANGED: check up to 12 slots (~2 hrs) instead of 6 ──
    for (let i = 0; i < Math.min(freshSlots.length, 12); i++) {
      if (!autoFindRef.current) break;
      setCheckedCount(i + 1);
      const slot = freshSlots[i];
      const found = await fetchCounselorsForSlot(slot);
      if (found.length > 0) {
        setSelectedSlot(slot);
        setCounselors(found);
        setAutoFinding(false);
        autoFindRef.current = false;
        return;
      } else {
        // ── NEW: mark this slot as unavailable while we scan ──
        setUnavailableSlots((prev) => new Set([...prev, slot.value]));
      }
    }

    setCounselorsError("No counselors are available in the next 2 hours. Please try again soon.");
    setAutoFinding(false);
    autoFindRef.current = false;
  }, [fetchCounselorsForSlot]);

  useEffect(() => {
    autoFindNextSlot();
    return () => { autoFindRef.current = false; };
  }, []);

  const handleSlotClick = async (slot) => {
    // ── NEW: ignore clicks on confirmed unavailable slots ──
    if (unavailableSlots.has(slot.value)) return;

    autoFindRef.current = false;
    setAutoFinding(false);
    setSelectedSlot(slot);
    setCounselors([]);
    setCounselorsError("");
    setFormData((p) => ({ ...p, counselor: "", counselorId: "" }));
    setLoadingCounselors(true);
    const found = await fetchCounselorsForSlot(slot);
    setCounselors(found);
    if (found.length === 0) {
      // ── NEW: mark slot unavailable so it greys out in the grid ──
      setUnavailableSlots((prev) => new Set([...prev, slot.value]));
      setCounselorsError("No counselors available for this slot. Try another time.");
      setSelectedSlot(null); // deselect since it's not bookable
    }
    setLoadingCounselors(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canContinue = useMemo(() => {
    if (step === 1) return !!selectedSlot && counselors.length > 0 && !autoFinding;
    if (step === 2) return !!formData.counselor && !!formData.counselorId;
    if (step === 3) return !!formData.name && !!formData.email && !!formData.phone;
    if (step === 4) return !!formData.paymentMethod && !loading;
    return true;
  }, [step, selectedSlot, counselors, autoFinding, formData, loading]);

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

  const initializeGuestEsewaPayment = async () => {
    if (formData.paymentMethod !== "esewa") {
      alert("Currently only eSewa is connected for guest booking.");
      return;
    }
    try {
      setLoading(true);
      setPageError("");
      setSuccessMessage("");
      setPaymentData(null);
      setGuestBookingId(null);
      setGuestTransactionUuid("");

      const bookingPayload = {
        counselor_id: Number(formData.counselorId),
        date: getTodayISO(),
        time: selectedSlot.value,
        session_type: sessionType,
        guest_name: formData.name,
        guest_email: formData.email,
        guest_phone: formData.phone,
        reason: formData.nickname || null,
        amount: 500,
      };

      const bookingRes = await API.post("/guest-bookings", bookingPayload);
      const booking = bookingRes.data?.booking;
      if (!booking?.id) throw new Error("Guest booking created but booking id missing.");

      const paymentRes = await API.post("/esewa/guest-pay", { guest_booking_id: booking.id });
      const { payment_url, form_fields } = paymentRes.data || {};
      if (!payment_url || !form_fields) throw new Error("Invalid payment response from server.");

      setGuestBookingId(booking.id);
      setGuestTransactionUuid(form_fields.transaction_uuid || booking.transaction_uuid || "");
      setPaymentData({ payment_url, form_fields });
      setSuccessMessage("Payment initialized! Continue to eSewa to complete booking.");
    } catch (err) {
      setPageError(err?.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSimulateSuccess = () => {
    if (!guestBookingId) { setPageError("No guest booking found. Please initialize payment first."); return; }
    window.location.href = `http://127.0.0.1:8000/api/guest-simulate-success/${guestBookingId}`;
  };

  const handleNext = async () => {
    if (step < 4) { setStep((s) => s + 1); return; }
    await initializeGuestEsewaPayment();
  };

  const handleBack = () => { setStep((s) => Math.max(1, s - 1)); setPageError(""); };
  const progressPercent = ((step - 1) / 3) * 100;

  const sessionTypeLabel = sessionType === "video" ? "Video Call Session" : "Chat Session";
  const sessionTypeIcon  = sessionType === "video" ? "🎥" : "💬";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4fbf6,_#f8f8f4_45%,_#ffffff_75%)] pt-28">

      {pageError && (
        <div className="mx-auto max-w-6xl px-6 mb-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{pageError}</span>
            <button onClick={() => setPageError("")} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mx-auto max-w-6xl px-6 mb-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>
        </div>
      )}

      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="relative block select-none">
            <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xl font-serif tracking-wide">MannSathi</span>
            </div>
          </Link>
          <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-800">
            <Link to="/" className="hover:text-[#215c4c] transition">Home</Link>
            <Link to="/about" className="hover:text-[#215c4c] transition">About Us</Link>
            <Link to="/services" className="hover:text-[#215c4c] transition">Services</Link>
            <Link to="/signup" className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-7 py-2.5 text-[15px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition">
              Signup
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* Hero */}
        <section className="mt-6 rounded-3xl border border-[#d7e7db] bg-[linear-gradient(140deg,_#f6fbf7_0%,_#ffffff_55%,_#f2f8f3_100%)] px-6 py-7 sm:px-8 sm:py-9 shadow-[0_14px_50px_rgba(22,67,54,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#a8c7b0] bg-[#e8f4eb] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2a5f4f]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Instant Booking — No account required
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-[#153f34] leading-tight">Talk to a Counselor Now</h1>
              <p className="mt-3 text-sm sm:text-base text-[#47665c] leading-relaxed">
                We find the next available counselor automatically. Pick your nearest time slot, choose a counselor, and start your session today.
              </p>
            </div>
            <div className="w-full sm:w-auto rounded-2xl border border-[#dbeadf] bg-white/80 px-5 py-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#5b7c71]">Current Time</div>
              <div className="mt-1 text-2xl font-bold text-[#1e473b]">{currentTime}</div>
              <div className="mt-1 text-xs text-[#6b8c7e]">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {["See next available slot", "Choose counselor", "Enter your details", "Pay & start session"].map((text, i) => (
              <div key={i} className="rounded-2xl border border-[#deece2] bg-white px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#5b7c71]">Step {i + 1}</div>
                <div className="mt-1 text-sm font-medium text-[#1e473b]">{text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Step indicator */}
        <div className="mt-8">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 max-w-4xl mx-auto rounded-3xl border border-[#dce9df] bg-white/90 px-4 py-4 shadow-[0_12px_32px_rgba(36,69,56,0.08)]">
            {stepsMeta.map((s) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-3 min-w-[100px]">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border text-xs font-semibold ${active ? "bg-[#215c4c] text-white border-[#215c4c] shadow-md" : done ? "bg-[#e3f3e6] text-[#215c4c] border-[#89ad8f]" : "bg-white text-neutral-500 border-[#e5e5e5]"}`}>
                    {done ? "✓" : s.id}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${active ? "text-[#215c4c]" : "text-neutral-700"}`}>{s.label}</div>
                    <div className="text-xs text-neutral-400">{done ? "Done" : active ? "In progress" : "Upcoming"}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="max-w-4xl mx-auto mt-4 h-2 rounded-full bg-[#e8efe9] overflow-hidden">
            <div className="h-full bg-[linear-gradient(90deg,_#215c4c,_#5c927e)] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Main card */}
        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-5xl bg-white/95 border border-[#dfe8df] rounded-3xl shadow-[0_22px_70px_rgba(24,62,49,0.12)] overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-[#edf2ed] bg-[linear-gradient(120deg,_#ffffff,_#f7fbf8)] flex items-center gap-4">
              {step > 1 && (
                <button type="button" onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-2xl border border-[#e6e6e6] bg-white hover:bg-[#fafafa] shadow-sm text-neutral-700 transition">
                  <span className="text-lg">‹</span>
                </button>
              )}
              <div className="flex-1">
                <div className="text-lg font-semibold text-neutral-900">{stepTitle}</div>
                <div className="text-sm text-neutral-500 mt-1">
                  {step === 1 && "We automatically find the nearest slot with an available counselor."}
                  {step === 2 && "These counselors are available and ready at your selected time."}
                  {step === 3 && "Enter your details. Your information stays private."}
                  {step === 4 && "Review and complete your booking."}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#d6e5d9] bg-[#f4faf5] px-4 py-2 text-xs text-neutral-700">
                Step {step} of 4
              </div>
            </div>

            <div className="px-6 sm:px-8 py-8 min-h-[320px]">

              {/* ── STEP 1: Pick Time + Session Type ── */}
              {step === 1 && (
                <div className="space-y-6">

                  {/* Auto-finding spinner */}
                  {autoFinding && (
                    <div className="rounded-2xl border border-[#dce8df] bg-[#f4fbf6] px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-[3px] border-[#215c4c] border-t-transparent animate-spin flex-shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#1e473b]">Finding nearest available counselor...</div>
                          {/* ── CHANGED: shows out of 12 now ── */}
                          <div className="text-xs text-neutral-500 mt-0.5">Checking slot {checkedCount} of 12</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommended slot */}
                  {!autoFinding && selectedSlot && counselors.length > 0 && (
                    <div className="rounded-2xl border-2 border-[#215c4c] bg-[#f2fbf5] px-5 py-5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#5b7c71] mb-1">⚡ Recommended Slot</div>
                          <div className="text-3xl font-bold text-[#1e473b]">{selectedSlot.label}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm text-[#2d6151] font-medium">
                              {selectedSlot.minsFromNow <= 0 ? "Available right now!" : `Starts in ${formatWaitTime(selectedSlot.minsFromNow)}`}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#c9e2cf] bg-white px-4 py-3 text-center">
                          <div className="text-2xl font-bold text-[#215c4c]">{counselors.length}</div>
                          <div className="text-xs text-[#5b7c71] font-medium">counselor{counselors.length !== 1 ? "s" : ""} available</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Session Type Selector */}
                  {!autoFinding && (
                    <div>
                      <div className="text-sm font-semibold text-neutral-700 mb-3">
                        Session Type <span className="text-red-500">*</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setSessionType("chat")}
                          className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${sessionType === "chat" ? "border-[#215c4c] bg-[#f2fbf5] shadow-md" : "border-[#e5e7eb] hover:border-[#a8d4c3]"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">💬</span>
                            <span className="font-semibold text-sm text-[#1e293b]">Chat Session</span>
                            {sessionType === "chat" && <span className="ml-auto text-[#215c4c] font-bold text-sm">✓</span>}
                          </div>
                          <p className="text-xs text-[#6b7280]">Text-based session. Great for privacy.</p>
                        </button>
                        <button type="button" onClick={() => setSessionType("video")}
                          className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${sessionType === "video" ? "border-[#215c4c] bg-[#f2fbf5] shadow-md" : "border-[#e5e7eb] hover:border-[#a8d4c3]"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">🎥</span>
                            <span className="font-semibold text-sm text-[#1e293b]">Video Call</span>
                            {sessionType === "video" && <span className="ml-auto text-[#215c4c] font-bold text-sm">✓</span>}
                          </div>
                          <p className="text-xs text-[#6b7280]">Face-to-face video session.</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {!autoFinding && counselorsError && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                      <div className="text-sm font-semibold text-amber-800">😔 {counselorsError}</div>
                      <button type="button" onClick={autoFindNextSlot}
                        className="mt-3 inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-5 py-2 text-sm font-semibold text-[#305b39] shadow-[0_3px_0_0_#89ad8f] hover:translate-y-[1px] transition">
                        🔄 Try Again
                      </button>
                    </div>
                  )}

                  {/* ── UPDATED: Manual slot picker with unavailable slot handling ── */}
                  {!autoFinding && slots.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-neutral-700">Or choose a different time:</div>
                        {/* Legend */}
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border border-[#efe7dc] bg-white inline-block" />
                            Available
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border border-neutral-200 bg-neutral-100 inline-block" />
                            Unavailable
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                        {slots.slice(0, 24).map((slot) => {
                          const isSelected = selectedSlot?.value === slot.value;
                          const isUnavailable = unavailableSlots.has(slot.value);

                          return (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => handleSlotClick(slot)}
                              disabled={loadingCounselors || isUnavailable}
                              title={isUnavailable ? "No counselors available for this slot" : undefined}
                              className={`rounded-2xl border px-3 py-3 text-sm text-left transition relative
                                ${isSelected
                                  ? "border-[#215c4c] bg-[#f2fbf5] text-[#215c4c] shadow-sm"
                                  : isUnavailable
                                  ? "border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed opacity-60"
                                  : "border-[#efe7dc] bg-white text-neutral-800 hover:bg-[#fafafa] hover:border-[#89ad8f]"
                                }`}
                            >
                              <div className={`font-semibold ${isUnavailable ? "line-through" : ""}`}>
                                {slot.label}
                              </div>
                              <div className={`text-xs mt-0.5 ${isUnavailable ? "text-neutral-300" : "text-neutral-400"}`}>
                                {isUnavailable ? "No counselors" : formatWaitTime(slot.minsFromNow)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {loadingCounselors && (
                        <div className="mt-3 rounded-xl border border-[#dce8df] bg-[#f8fcf9] px-4 py-3 text-sm text-neutral-600 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#215c4c] border-t-transparent rounded-full animate-spin" />
                          Checking counselor availability...
                        </div>
                      )}
                    </div>
                  )}

                  {/* No slots today */}
                  {!autoFinding && slots.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-6 text-center">
                      <div className="text-2xl mb-2">🌙</div>
                      <div className="text-sm font-semibold text-neutral-700">No more slots available today</div>
                      <div className="text-xs text-neutral-500 mt-1">Sessions run until 7:00 PM. Please come back tomorrow!</div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: Counselor ── */}
              {step === 2 && (
                <div className="space-y-6">
                  {selectedSlot && (
                    <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-3 flex items-center justify-between">
                      <div className="text-sm text-neutral-600">
                        <span className="font-semibold text-[#1e473b]">⏰ {selectedSlot.label}</span>
                        <span className="ml-2 text-neutral-400">·</span>
                        <span className="ml-2">{formatWaitTime(selectedSlot.minsFromNow)} away</span>
                        <span className="ml-2 text-neutral-400">·</span>
                        <span className="ml-2">{sessionTypeIcon} {sessionTypeLabel}</span>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-[#215c4c] hover:underline font-medium">Change</button>
                    </div>
                  )}
                  <p className="text-sm text-neutral-600">These counselors are available and ready at your selected time.</p>
                  {counselors.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl border border-dashed border-[#d6dbd2] bg-[#fbfcfa]">
                      <p className="text-sm text-neutral-500">No counselors available. Please go back and select a different time.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {counselors.map((c) => (
                        <button key={c.id} type="button"
                          onClick={() => setFormData((p) => ({ ...p, counselor: c.name, counselorId: c.id }))}
                          className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${formData.counselorId === c.id ? "border-[#215c4c] bg-[#f2fbf5] shadow-md" : "border-[#e5e7eb] hover:border-[#a8d4c3]"}`}>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#215c4c] to-[#2a7a66] flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0">
                              {c.name?.charAt(0) || "C"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold text-[#1e293b]">{c.name}</h3>
                                {formData.counselorId === c.id && <span className="text-[#215c4c] text-lg">✓</span>}
                              </div>
                              {c.specialization && <p className="text-xs text-[#6b7280] mt-0.5">{c.specialization}</p>}
                              {c.experience_years && <p className="text-xs text-[#215c4c] font-medium mt-1">{c.experience_years}+ years experience</p>}
                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Available now
                              </div>
                            </div>
                          </div>
                          {c.bio && <p className="mt-3 text-xs text-[#6b7280] line-clamp-2">{c.bio}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: Guest Info ── */}
              {step === 3 && (
                <div className="space-y-6">
                  <p className="text-sm text-neutral-600">Enter your details. Your information stays private.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Full Name" required>
                      <input type="text" name="name" value={formData.name} onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7] px-4 py-3 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="Enter your name" />
                    </Field>
                    <Field label="Preferred Name (optional)">
                      <input type="text" name="nickname" value={formData.nickname} onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7] px-4 py-3 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="Optional" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Email" required>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7] px-4 py-3 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="example@gmail.com" />
                    </Field>
                    <Field label="Phone" required>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full rounded-2xl border border-[#efe7dc] bg-[#fffdf7] px-4 py-3 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]"
                        placeholder="98XXXXXXXX" />
                    </Field>
                  </div>
                  <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-4 text-sm text-neutral-600">
                    🔒 Your information is kept private and only used for your session.
                  </div>
                </div>
              )}

              {/* ── STEP 4: Payment ── */}
              {step === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-neutral-600">Review your booking and complete payment to confirm.</p>
                  <div className="rounded-2xl border border-[#dce8df] bg-[#f8fcf9] px-5 py-5">
                    <div className="font-semibold text-neutral-900 mb-3">Booking Summary</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-neutral-500">Counselor</span><span className="font-semibold text-neutral-800">{formData.counselor}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-500">Date</span><span className="font-semibold text-neutral-800">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-500">Time</span><span className="font-semibold text-[#215c4c]">{selectedSlot?.label} — in {formatWaitTime(selectedSlot?.minsFromNow)}</span></div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Session Type</span>
                        <span className="font-semibold text-neutral-800">{sessionTypeIcon} {sessionTypeLabel}</span>
                      </div>
                      <div className="flex justify-between"><span className="text-neutral-500">Name</span><span className="font-semibold text-neutral-800">{formData.name}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-500">Email</span><span className="font-semibold text-neutral-800">{formData.email}</span></div>
                      <div className="flex justify-between border-t border-[#e5ece6] pt-2 mt-2">
                        <span className="font-semibold text-neutral-500">Amount</span>
                        <span className="font-bold text-[#215c4c] text-lg">Rs. 500</span>
                      </div>
                    </div>
                    {sessionType === "video" && (
                      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        🎥 A video room link will be sent after payment confirmation.
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-neutral-900">Payment Method</div>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
                      className="w-full sm:w-72 rounded-2xl border border-[#efe7dc] bg-[#fffdf7] px-4 py-3 text-sm outline-none focus:border-[#89ad8f] focus:ring-2 focus:ring-[#c9e2cf]">
                      <option value="">Select payment method</option>
                      <option value="esewa">eSewa</option>
                    </select>
                  </div>
                  {!paymentData ? (
                    <button type="button" onClick={initializeGuestEsewaPayment} disabled={!canContinue || loading}
                      className="inline-flex items-center gap-2 rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-7 py-3 text-sm font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? (<><span className="w-4 h-4 border-2 border-[#305b39] border-t-transparent rounded-full animate-spin" />Initializing...</>) : "💳 Initialize eSewa Payment"}
                    </button>
                  ) : (
                    <div className="space-y-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                      <div className="text-sm font-semibold text-green-800">✅ Payment initialized!</div>
                      <div className="text-xs text-green-700">Booking ID: <span className="font-semibold">{guestBookingId}</span></div>
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => submitEsewaForm(paymentData.payment_url, paymentData.form_fields)}
                          className="inline-flex items-center rounded-full bg-[#215c4c] px-6 py-3 text-sm font-semibold text-white hover:opacity-95">Continue to eSewa →</button>
                        <button type="button" onClick={handleGuestSimulateSuccess}
                          className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">Simulate Success</button>
                        <button type="button" onClick={() => { setPaymentData(null); setGuestBookingId(null); setGuestTransactionUuid(""); }}
                          className="inline-flex items-center rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-semibold text-neutral-700">Re-initialize</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-[#f0f0f0] bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {step === 1 && selectedSlot && `Selected: ${selectedSlot.label} · ${sessionTypeIcon} ${sessionTypeLabel} · ${counselors.length} counselor${counselors.length !== 1 ? "s" : ""} available`}
                {step === 1 && !selectedSlot && (autoFinding ? "Finding next available slot..." : "Select a time slot to continue.")}
                {step === 2 && "Choose a counselor to continue."}
                {step === 3 && "All fields marked * are required."}
                {step === 4 && "Session starts after payment confirmation."}
              </div>
              {step < 4 && (
                <button type="button" onClick={handleNext} disabled={!canContinue || loading}
                  className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-7 py-3 text-sm font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}