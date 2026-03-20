import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { API } from "../utils/api";

export default function GuestSession() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const sessionLink = useMemo(() => {
    if (!id || !token) return "";
    return `${window.location.origin}/guest-session/${id}?token=${encodeURIComponent(
      token
    )}`;
  }, [id, token]);

  useEffect(() => {
    const fetchGuestSession = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(
          `/guest-session/${id}?token=${encodeURIComponent(token || "")}`
        );
        setBooking(res.data?.booking || null);
      } catch (err) {
        console.error("Failed to load guest session:", err);
        setError(
          err?.response?.data?.message ||
            "Could not load guest session. The link may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchGuestSession();
    } else {
      setLoading(false);
      setError("Missing session token.");
    }
  }, [id, token]);

  const handleCopyLink = async () => {
    if (!sessionLink) return;

    try {
      await navigator.clipboard.writeText(sessionLink);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Could not copy the private session link. Please copy it manually.");
    }
  };

  const handleAiSupportClick = () => {
    alert(
      "AI support will be connected next. For now, please use the calming exercises and grounding tips below while you wait."
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-[#efe7dc] shadow-[0_18px_60px_rgba(0,0,0,0.08)] px-8 py-10 text-center max-w-lg w-full">
          <h2 className="text-xl font-semibold text-neutral-900">
            Loading session...
          </h2>
          <p className="mt-3 text-sm text-neutral-500">
            Please wait while we fetch your booking details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-[#efe7dc] shadow-[0_18px_60px_rgba(0,0,0,0.08)] px-8 py-10 text-center max-w-lg w-full">
          <h2 className="text-xl font-semibold text-red-600">
            Session unavailable
          </h2>
          <p className="mt-3 text-sm text-neutral-600">{error}</p>

          <Link
            to="/book-appointment"
            className="inline-flex mt-6 items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                       px-6 py-2.5 text-sm font-semibold text-[#305b39]
                       shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                       hover:shadow-[0_3px_0_0_#89ad8f] transition"
          >
            Book Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#efe7dc] shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-8 py-6 border-b border-[#f0f0f0]">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Guest Session Waiting Room
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Your booking is confirmed. Please stay on this page until your
              counselor joins.
            </p>
          </div>

          <div className="px-8 py-8 grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#e8e1d6] bg-[#fffdf7] px-5 py-5">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Session Details
                </h2>

                <div className="mt-4 space-y-3 text-sm text-neutral-700">
                  <div>
                    <span className="text-neutral-500">Guest Name:</span>{" "}
                    {booking.guest_name}
                  </div>
                  <div>
                    <span className="text-neutral-500">Email:</span>{" "}
                    {booking.guest_email}
                  </div>
                  <div>
                    <span className="text-neutral-500">Phone:</span>{" "}
                    {booking.guest_phone || "Not provided"}
                  </div>
                  <div>
                    <span className="text-neutral-500">Date:</span>{" "}
                    {booking.date}
                  </div>
                  <div>
                    <span className="text-neutral-500">Time:</span>{" "}
                    {booking.time}
                  </div>
                  <div>
                    <span className="text-neutral-500">Session Type:</span>{" "}
                    {booking.session_type}
                  </div>
                  <div>
                    <span className="text-neutral-500">Payment:</span>{" "}
                    <span className="font-medium text-green-700">Paid</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Booking Status:</span>{" "}
                    <span className="font-medium text-[#215c4c]">
                      {booking.booking_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#dfe7df] bg-[#f8fcf9] px-5 py-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Private Session Link
                  </h2>

                  {copied && (
                    <span className="inline-flex items-center rounded-full bg-[#e3f3e6] border border-[#89ad8f] px-3 py-1 text-xs font-semibold text-[#215c4c]">
                      Link copied
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  Save this private link. If you close the tab, you can use this
                  same link to reopen your waiting room later.
                </p>

                <div className="mt-4 rounded-2xl border border-[#e5ece6] bg-white px-4 py-3 break-all text-sm text-neutral-700">
                  {sessionLink}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                               px-5 py-2.5 text-sm font-semibold text-[#305b39]
                               shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                               hover:shadow-[0_3px_0_0_#89ad8f] transition"
                  >
                    Copy Session Link
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8e1d6] bg-white px-5 py-5">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Counselor
                </h2>

                <div className="mt-4 space-y-3 text-sm text-neutral-700">
                  <div>
                    <span className="text-neutral-500">Name:</span>{" "}
                    {booking.counselor?.name || "Assigned counselor"}
                  </div>
                  <div>
                    <span className="text-neutral-500">Status:</span>{" "}
                    <span className="font-medium text-amber-700">
                      Waiting to join
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[#f6faf7] border border-[#dfeee3] px-4 py-4">
                  <div className="text-sm font-medium text-[#215c4c]">
                    What happens next?
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    Your counselor will see this booking in their dashboard. When
                    they join, this page can later be extended into your chat or
                    video session room.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex items-center rounded-full border border-[#d7dfd9] bg-[#f3f6f4]
                             px-6 py-2.5 text-sm font-semibold text-[#6a746d]
                             cursor-not-allowed"
                >
                  Waiting for Counselor
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[#dce8df] bg-[linear-gradient(135deg,_#f7fbf8,_#ffffff)] px-5 py-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      AI Support
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                      Gentle emotional support while you wait. This can later be
                      connected to your AI companion or chatbot.
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-[#cfe2d4] bg-[#edf7f0] px-3 py-1 text-xs font-semibold text-[#2d5e4c]">
                    Coming soon
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-[#e4ece6] bg-white px-4 py-4">
                  <div className="text-sm font-medium text-neutral-900">
                    What this section can do later
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    <li>• Offer kind check-ins and supportive conversation</li>
                    <li>• Suggest calming exercises based on mood</li>
                    <li>• Share safe coping tips before the session starts</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleAiSupportClick}
                  className="mt-4 inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6]
                             px-5 py-2.5 text-sm font-semibold text-[#305b39]
                             shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px]
                             hover:shadow-[0_3px_0_0_#89ad8f] transition"
                >
                  Try AI Support
                </button>
              </div>

              <div className="rounded-2xl border border-[#e4ece6] bg-[#fbfdfb] px-5 py-5">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Breathing Exercise
                </h2>

                <div className="mt-4 rounded-2xl border border-[#dde9df] bg-white px-4 py-4">
                  <div className="text-sm font-medium text-[#215c4c]">
                    4-4-4 Breathing
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl bg-[#f4faf5] px-3 py-4">
                      <div className="text-xs text-neutral-500">Step 1</div>
                      <div className="mt-1 text-sm font-semibold text-neutral-900">
                        Inhale
                      </div>
                      <div className="text-xs text-neutral-500">4 seconds</div>
                    </div>
                    <div className="rounded-2xl bg-[#f4faf5] px-3 py-4">
                      <div className="text-xs text-neutral-500">Step 2</div>
                      <div className="mt-1 text-sm font-semibold text-neutral-900">
                        Hold
                      </div>
                      <div className="text-xs text-neutral-500">4 seconds</div>
                    </div>
                    <div className="rounded-2xl bg-[#f4faf5] px-3 py-4">
                      <div className="text-xs text-neutral-500">Step 3</div>
                      <div className="mt-1 text-sm font-semibold text-neutral-900">
                        Exhale
                      </div>
                      <div className="text-xs text-neutral-500">4 seconds</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                    Repeat this cycle slowly 4 to 5 times. Let your shoulders
                    relax and try not to rush your breathing.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e4ece6] bg-[#fbfdfb] px-5 py-5">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Grounding Technique
                </h2>

                <div className="mt-4 rounded-2xl border border-[#dde9df] bg-white px-4 py-4">
                  <div className="text-sm font-medium text-[#215c4c]">
                    5-4-3-2-1 Method
                  </div>

                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    <li>• Notice 5 things you can see</li>
                    <li>• Notice 4 things you can touch</li>
                    <li>• Notice 3 things you can hear</li>
                    <li>• Notice 2 things you can smell</li>
                    <li>• Notice 1 thing you can taste</li>
                  </ul>

                  <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                    This can help bring your attention back to the present moment
                    if you feel overwhelmed or anxious while waiting.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e4ece6] bg-[#fbfdfb] px-5 py-5">
                <h2 className="text-lg font-semibold text-neutral-900">
                  While You Wait
                </h2>

                <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                  <li>• Sit somewhere quiet and comfortable if possible.</li>
                  <li>• Take a few slow breaths before the session begins.</li>
                  <li>• Keep some water nearby.</li>
                  <li>• Think about one or two things you want to talk about.</li>
                  <li>• Be gentle with yourself. You do not need to explain everything perfectly.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#f0d7d7] bg-[#fff8f8] px-5 py-5">
                <h2 className="text-lg font-semibold text-[#8a2f2f]">
                  Important Support Note
                </h2>

                <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
                  This waiting room and future AI support are not emergency
                  services. If you feel that you may harm yourself or someone
                  else, please contact local emergency support, a trusted person,
                  or the nearest hospital immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}