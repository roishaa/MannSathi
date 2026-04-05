import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SearchDoctor() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");

  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeCounselor = (item) => {
    if (!item) return null;

    return {
      id: item.id,
      name: item.name || item.full_name || "Counselor Name",
      specialization:
        item.specialization ||
        item.spec ||
        item.expertise ||
        item.category ||
        "General Counseling",
      mode:
        item.mode ||
        item.session_mode ||
        item.type ||
        "Online",
      rating:
        item.rating ||
        item.average_rating ||
        item.reviews_avg ||
        null,
      bio:
        item.bio ||
        item.description ||
        item.about ||
        "Professional counselor available for support and guidance.",
      experience:
        item.experience ||
        item.years_of_experience ||
        null,
      profile_image:
        item.profile_image ||
        item.image ||
        item.avatar ||
        null,
      hospital:
        item.hospital_name ||
        item.hospital?.name ||
        null,
      is_available:
        item.is_available ?? item.available ?? true,
    };
  };

  const loadCounselors = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/counselors");
      const rawItems =
        res.data?.items ||
        res.data?.counselors ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      const normalized = (rawItems || [])
        .map(normalizeCounselor)
        .filter(Boolean);

      console.log("COUNSELORS RAW:", rawItems);
      console.log("COUNSELORS NORMALIZED:", normalized);

      setCounselors(normalized);
    } catch (e) {
      console.log(
        "Counselors fetch failed:",
        e?.response?.status,
        e?.response?.data || e.message
      );
      setError("Failed to load counselors from backend.");
      setCounselors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounselors();
  }, []);

  const specializations = useMemo(() => {
    const list = counselors.map((c) => c.specialization).filter(Boolean);
    return ["all", ...new Set(list)];
  }, [counselors]);

  const filteredCounselors = useMemo(() => {
    return counselors.filter((c) => {
      const text =
        `${c.name} ${c.specialization} ${c.bio} ${c.hospital || ""}`.toLowerCase();

      const matchesSearch = text.includes(q.toLowerCase());
      const matchesMode =
        selectedMode === "all" ||
        (c.mode || "").toLowerCase() === selectedMode.toLowerCase();

      const matchesSpecialization =
        selectedSpecialization === "all" ||
        c.specialization === selectedSpecialization;

      return matchesSearch && matchesMode && matchesSpecialization;
    });
  }, [counselors, q, selectedMode, selectedSpecialization]);

  const availableCount = counselors.filter((c) => c.is_available).length;

  const getInitials = (name) => {
    return (name || "C")
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleBook = (counselor) => {
    navigate("/users/appointments/book", {
      state: {
        counselorId: counselor.id,
        counselorName: counselor.name,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)] px-4 md:px-10 xl:px-14 py-6 md:py-10">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to="/users/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f4e43] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent">
            Search Counselor
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#5f6d68] font-medium">
            Find the right counselor based on specialization, availability, and session mode.
          </p>
        </div>

        <Link
          to="/users/appointments/book"
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          ➕ Book session
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">
            Total Counselors
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1f4e43]">{counselors.length}</p>
        </div>

        <div className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-[#83918b] font-semibold">
            Available
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1f4e43]">{availableCount}</p>
        </div>

        <div className="rounded-3xl border border-[#d5e8e4] bg-gradient-to-br from-[#f0f9f7] to-[#e8f4f1] p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-[#1f4e43] font-semibold">
            Results
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1f4e43]">{filteredCounselors.length}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e7e5de] bg-white/80 p-5 md:p-6 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7f8c87] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, specialization, or keyword..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-2xl border border-[#dcded6] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#88b2a6] focus:ring-2 focus:ring-[#d7ebe4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7f8c87] mb-2">
              Mode
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full rounded-2xl border border-[#dcded6] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#88b2a6] focus:ring-2 focus:ring-[#d7ebe4]"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="in-person">In-person</option>
              <option value="chat">Chat</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7f8c87] mb-2">
              Specialization
            </label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full rounded-2xl border border-[#dcded6] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#88b2a6] focus:ring-2 focus:ring-[#d7ebe4]"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === "all" ? "All" : spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm"
              >
                <div className="animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-[#ecefe8]" />
                    <div className="flex-1">
                      <div className="h-5 w-40 rounded bg-[#ecefe8]" />
                      <div className="mt-3 h-4 w-28 rounded bg-[#ecefe8]" />
                      <div className="mt-2 h-4 w-20 rounded bg-[#ecefe8]" />
                    </div>
                  </div>
                  <div className="mt-5 h-16 rounded-2xl bg-[#f2f4ee]" />
                  <div className="mt-5 h-10 w-full rounded-2xl bg-[#ecefe8]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-red-900">Could not load counselors</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadCounselors}
              className="mt-4 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : filteredCounselors.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d6dbd2] bg-[#fbfcfa] px-6 py-12 text-center">
            <div className="text-6xl mb-4">🔎</div>
            <h3 className="text-xl font-bold text-[#1f4e43]">No counselors found</h3>
            <p className="mt-2 text-sm text-[#66706b]">
              Try changing your search text or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCounselors.map((c) => (
              <div
                key={c.id || c.name}
                className="group rounded-3xl border border-[#e7e5de] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(24,45,38,0.12)]"
              >
                <div className="flex items-start gap-4">
                  {c.profile_image ? (
                    <img
                      src={c.profile_image}
                      alt={c.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-[#e7e5de]"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4] text-lg font-bold text-[#1f4e43]">
                      {getInitials(c.name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-[#1c2522]">
                          {c.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-[#1f4e43]">
                          {c.specialization}
                        </p>
                      </div>

                      {c.rating && (
                        <span className="inline-flex shrink-0 rounded-full border border-[#d5e4da] bg-[#e3f3e6] px-3 py-1 text-[11px] font-semibold text-[#1f4e43]">
                          ⭐ {c.rating}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#e3e6de] bg-[#f8faf7] px-3 py-1 text-[11px] font-semibold text-[#5f6d68]">
                        {c.mode}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${
                          c.is_available
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {c.is_available ? "Available" : "Unavailable"}
                      </span>

                      {c.experience && (
                        <span className="rounded-full border border-[#e3e6de] bg-[#f8faf7] px-3 py-1 text-[11px] font-semibold text-[#5f6d68]">
                          {c.experience} yrs exp
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#edf0e8] bg-[#fbfcfa] p-4">
                  <p className="text-sm leading-relaxed text-[#66706b]">
                    {c.bio}
                  </p>

                  {c.hospital && (
                    <p className="mt-3 text-xs font-medium text-[#7b8782]">
                      Hospital: <span className="text-[#1f4e43]">{c.hospital}</span>
                    </p>
                  )}
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => handleBook(c)}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  >
                    Book session
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-[#d7d9d0] bg-white px-4 py-3 text-sm font-semibold text-[#1f4e43] transition hover:bg-[#f7f8f5]"
                  >
                    View profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}