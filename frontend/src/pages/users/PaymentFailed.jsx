import { Link, useSearchParams } from "react-router-dom";

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  const getMessage = () => {
    if (reason === "slot-taken") {
      return "That slot was just booked by someone else. Please choose another available time.";
    }

    if (reason === "missing-session") {
      return "Your payment session could not be completed. Please try booking again.";
    }

    return "Your payment was not completed. Please try again.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f0] via-[#f5f8f5] to-[#f0f8f5] flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center text-4xl mb-6">
          ✕
        </div>

        <h1 className="text-3xl font-bold text-[#1e293b] mb-3">
          Payment Failed
        </h1>

        <p className="text-[#6b7280] mb-8">
          {getMessage()}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/users/BookAppointmentUser"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#215c4c] to-[#2a7a66] text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </Link>

          <Link
            to="/users/dashboard"
            className="px-6 py-3 rounded-full border-2 border-[#e5e7eb] text-[#374151] font-semibold hover:border-[#215c4c] hover:text-[#215c4c] transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}