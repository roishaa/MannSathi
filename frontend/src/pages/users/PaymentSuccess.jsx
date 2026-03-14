import { Link, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointment_id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f0] via-[#f5f8f5] to-[#f0f8f5] flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center text-4xl mb-6">
          ✓
        </div>

        <h1 className="text-3xl font-bold text-[#1e293b] mb-3">
          Payment Successful
        </h1>

        <p className="text-[#6b7280] mb-6">
          Your appointment has been booked successfully.
        </p>

        {appointmentId && (
          <div className="bg-[#f2fbf5] border border-[#a8d4c3] rounded-2xl p-4 mb-6">
            <p className="text-sm text-[#6b7280]">Appointment ID</p>
            <p className="text-lg font-semibold text-[#215c4c]">
              #{appointmentId}
            </p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
          <p className="text-sm text-amber-800">
            Your booking is now <strong>pending counselor confirmation</strong>.
            The selected slot is no longer available for others.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/users/dashboard"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white font-semibold hover:scale-105 transition"
          >
            Go to Dashboard
          </Link>

          <Link
            to="/users/BookAppointmentUser"
            className="px-6 py-3 rounded-full border-2 border-[#e5e7eb] text-[#374151] font-semibold hover:border-[#215c4c] hover:text-[#215c4c] transition"
          >
            View Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}