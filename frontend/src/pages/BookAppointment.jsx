import { useState } from "react";
import { Link } from "react-router-dom";

export default function BookAppointment() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    counselor: "",
    month: "December",
    year: "2025",
    date: "1",
    time: "",
    name: "",
    nickname: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      console.log("Submit:", formData);
      alert("Appointment booked (demo)!");
    }
  };

  const handleDayClick = (index) => {
    setSelectedDayIndex(index);
    setFormData((prev) => ({ ...prev, date: weekDates[index] }));
  };

  const handleTimeClick = (slot) => {
    setSelectedTime(slot);
    setFormData((prev) => ({ ...prev, time: slot }));
  };

  const stepTitle = [
    "Select Counselor",
    "Select Date and Time",
    "Your Information",
    "Payment",
  ][step - 1];

  const stepsMeta = [
    { id: 1, label: "Counselor" },
    { id: 2, label: "Date & Time" },
    { id: 3, label: "Your Info" },
    { id: 4, label: "Payment" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ec] flex flex-col">
      {/* HEADER / NAVBAR */}
      <header className="flex items-center justify-between px-6 py-8">
        <div className="relative">
          <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Link to="/">
              <span className="text-white font-semibold text-xl font-serif tracking-wide cursor-pointer">
                MannSathi
              </span>
            </Link>
          </div>
        </div>

        <nav className="flex items-center gap-10 text-[15px] font-medium text-neutral-800">
          <Link to="/" className="hover:text-[#215c4c] cursor-pointer">
            Home
          </Link>
          <a className="hover:text-[#215c4c] cursor-pointer">About Us</a>
          <a className="hover:text-[#215c4c] cursor-pointer">Services</a>

          <button
            className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition"
            onClick={() => (window.location.href = "/signup")}
          >
            Signup
          </button>
        </nav>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-6 pb-16">
        {/* heading */}
        <div className="text-center mt-2">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-800">
            Book An Appointment
          </h2>
          <div className="mt-1 h-[1px] w-24 bg-gray-300 mx-auto" />
        </div>

        {/* steps */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-6 text-xs sm:text-sm font-medium text-neutral-500">
            {stepsMeta.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border text-[11px] ${
                    step === s.id
                      ? "bg-[#215c4c] text-white border-[#215c4c]"
                      : step > s.id
                      ? "bg-[#e3f3e6] text-[#215c4c] border-[#89ad8f]"
                      : "bg-white text-neutral-500 border-gray-300"
                  }`}
                >
                  {s.id}
                </div>
                <span
                  className={`hidden sm:inline ${
                    step === s.id ? "text-[#215c4c]" : ""
                  }`}
                >
                  {s.label}
                </span>
                {i < stepsMeta.length - 1 && (
                  <div className="hidden sm:block w-10 h-px bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* single main card only */}
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-md shadow-[#0000000d] overflow-hidden">
            {/* card header */}
            <div className="px-8 py-5 border-b border-gray-200 bg-[#fbfaf7] flex items-center gap-4">
  
  {/* Back Button */}
  {step > 1 && (
    <button
      onClick={() => setStep(step - 1)}
      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-300 bg-white hover:bg-gray-50 shadow-sm text-neutral-600 transition"
    >
      <span className="text-lg -ml-[2px]">&lt;</span>
    </button>
  )}

  {/* Heading */}
  <span className="text-base font-semibold text-neutral-900">
    {stepTitle}
  </span>
</div>

            

            {/* card body */}
            <div className="px-8 py-8 min-h-[260px]">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="flex flex-col gap-6 w-full">
                  <p className="text-xs text-neutral-500">
                    Choose a counselor you feel comfortable talking with.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="text-sm text-neutral-700">
                      Counselor:
                    </label>
                    <select
                      name="counselor"
                      value={formData.counselor}
                      onChange={handleChange}
                      className="w-56 bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/50 focus:border-[#215c4c]"
                    >
                      <option value="">Select</option>
                      <option value="Dr. Anjana Shrestha">
                        Dr. Anjana Shrestha
                      </option>
                      <option value="Mr. Kiran Gurung">Mr. Kiran Gurung</option>
                      <option value="Ms. Sita Lama">Ms. Sita Lama</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2 – your “only this” calendar/time UI */}
              {step === 2 && (
                <div className="space-y-8">
                  {/* top row */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Choose Date &amp; Time
                      </h3>
                      <div className="inline-flex rounded-full bg-[#f3f2ff] p-1 text-xs">
                        <button className="px-4 py-1 rounded-full bg-[#215c4c] text-white">
                          Week
                        </button>
                        <button className="px-4 py-1 rounded-full text-[#4b4b4b]">
                          Month
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline text-xs text-neutral-500">
                        Dec 1, 2025 - Dec 7, 2025
                      </span>
                      <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        className="bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/50 focus:border-[#215c4c]"
                      >
                        {months.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/50 focus:border-[#215c4c]"
                      >
                        {years.map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                      <button className="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center text-xs bg-white hover:bg-gray-50">
                        {"<"}
                      </button>
                      <button className="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center text-xs bg-white hover:bg-gray-50">
                        {">"}
                      </button>
                    </div>
                  </div>

                  {/* days row */}
                  <div>
                    <div className="grid grid-cols-7 gap-3">
                      {weekDays.map((day, idx) => {
                        const active = idx === selectedDayIndex;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayClick(idx)}
                            className={`flex flex-col items-center justify-center rounded-xl border text-xs py-3 transition ${
                              active
                                ? "border-[#215c4c] bg-[#f2fbf5] text-[#215c4c] shadow-sm"
                                : "border-gray-200 bg-white text-neutral-600 hover:bg-gray-50"
                            }`}
                          >
                            <span className="mb-1 text-[11px]">{day}</span>
                            <span className="text-sm font-medium">
                              {weekDates[idx]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* time slots */}
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
                            className={`rounded-xl border px-3 py-2 text-xs sm:text-sm text-left transition ${
                              active
                                ? "border-[#215c4c] bg-[#f2fbf5] text-[#215c4c] shadow-sm"
                                : "border-gray-200 bg-white text-neutral-700 hover:bg-gray-50"
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

            
              {/* STEP 3 — Your Information */}
              {step === 3 && (
                <div className="w-full space-y-8">
                <p className="text-sm text-neutral-500">
      You can use your real name or a nickname you feel safe with.
    </p>

    {/* 2-column grid (Name + Nickname) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm text-neutral-700">Name :</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/40"
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-700">Nickname :</label>
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          className="w-full bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/40"
          placeholder="Optional"
        />
      </div>
    </div>

    {/* 2-column grid (Email + Phone) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm text-neutral-700">Email :</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/40"
          placeholder="example@gmail.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-700">Phone Number :</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/40"
          placeholder="98XXXXXXXX"
        />
      </div>
    </div>
  </div>
)}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="w-full space-y-6">
                  <p className="text-xs text-neutral-500">
                    Choose how you’d like to complete your payment.
                  </p>
                  <div className="space-y-3">
                    <label className="text-sm text-neutral-700">
                      Payment Method:
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-56 bg-[#fafafa] border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#215c4c]/50 focus:border-[#215c4c]"
                    >
                      <option value="">Select</option>
                      <option value="esewa">eSewa</option>
                      <option value="khalti">Khalti</option>
                      
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="px-8 py-4 border-t border-gray-200 bg-[#fbfaf7] flex justify-end">
              <button
                onClick={handleNext}
                className="px-7 py-2 text-sm rounded-full bg-[#215c4c] text-white font-medium shadow-md shadow-[#215c4c33] hover:bg-[#1b4a3e] transition"
              >
                {step < 4 ? "Continue" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>

        {/* bottom strip */}
        <div className="mt-16 h-32 w-full bg-[#e9f2c8]" />
      </main>
    </div>
  );
}
