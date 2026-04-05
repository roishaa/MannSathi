import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Resources() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_data")) || {};
    } catch {
      return {};
    }
  }, []);

  const userName = user?.pseudonym || user?.name || user?.full_name || "LotusMind 🌸";
  const userEmail = user?.email || "user@email.com";

  const loadResources = async () => {
    setResourcesLoading(true);
    try {
      const res = await api.get("/resources");
      setResources(res.data?.items || []);
    } catch (e) {
      console.log("Resources fetch failed:", e?.response?.status, e?.response?.data || e.message);
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", to: "/users/dashboard", icon: "🏠" },
    { label: "Search Counselor", to: "/search-doctor", icon: "🧑‍⚕️" },
    { label: "Sessions", to: "/sessions", icon: "📅" },
    { label: "Resources", to: "/resources", icon: "📚" },
    { label: "Payments", to: "/payments", icon: "💳" },
    { label: "Settings", to: "/settings", icon: "⚙️" },
  ];

  const isActive = (to) => location.pathname === to;

  const getResourceIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "video") return "🎥";
    if (t === "exercise") return "🧘";
    if (t === "article") return "📖";
    if (t === "audio") return "🎧";
    return "📚";
  };

  const getResourceIconBg = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "video") return "bg-gradient-to-br from-[#fcefdc] to-[#f7e3be]";
    if (t === "exercise") return "bg-gradient-to-br from-[#e3f3e6] to-[#d5e8e4]";
    if (t === "article") return "bg-gradient-to-br from-[#ede7fb] to-[#ddd6f9]";
    if (t === "audio") return "bg-gradient-to-br from-[#ffe5ec] to-[#ffd6e0]";
    return "bg-gradient-to-br from-[#eef2f7] to-[#dde7f2]";
  };

  const typeOptions = ["all", ...new Set(resources.map((r) => (r.type || "").toLowerCase()).filter(Boolean))];
  const categoryOptions = ["all", ...new Set(resources.map((r) => (r.category || "").toLowerCase()).filter(Boolean))];

  const filteredResources = resources.filter((resource) => {
    const typeMatch =
      selectedType === "all" || (resource.type || "").toLowerCase() === selectedType;
    const categoryMatch =
      selectedCategory === "all" || (resource.category || "").toLowerCase() === selectedCategory;

    return typeMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex">
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-[#e6e5df] bg-white/90 backdrop-blur-xl">
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dadbd3] bg-white text-[#1f4e43] shadow-sm transition hover:bg-[#f7f8f5]"
          >
            ☰
          </button>
          <div className="text-center">
            <p className="font-serif text-lg font-semibold tracking-wide text-[#1f4e43]">MannSathi</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-[#dadbd3] bg-white px-3.5 py-2 text-xs font-semibold text-[#27584d] shadow-sm transition hover:bg-[#f7f8f5]"
          >
            Logout
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[#1f4e43]/35 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#215c4c] via-[#2b6557] to-[#3f7164] text-white px-6 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="font-serif font-semibold text-xl tracking-wide">MannSathi</div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="mt-1 text-xs text-[#d6ebe2]">{userEmail}</p>
            </div>

            <nav className="mt-7 space-y-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive(item.to)
                      ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_8px_24px_rgba(20,43,37,0.18)]"
                      : "text-white/95 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-8 inline-flex rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#e4efe9]"
            >
              Logout
            </button>
          </aside>
        </div>
      )}

      <aside className="w-80 hidden md:flex bg-gradient-to-b from-[#255b4e] via-[#2d6154] to-[#466f64] text-white px-7 py-8 flex-col justify-between">
        <div>
          <div className="mb-10 rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">🌿</div>
              <div>
                <p className="font-serif text-2xl font-semibold tracking-wide">MannSathi</p>
                <p className="text-[11px] text-[#d6ebe2]">Mental wellness space</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-5 mb-8 border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">🧑</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-[#d6ebe2] truncate">{userEmail}</p>
              </div>
            </div>

            <Link
              to="/users/dashboard"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white text-[#1f4e43] text-xs font-semibold px-4 py-2.5 shadow-[0_6px_20px_rgba(16,30,26,0.2)] transition hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(16,30,26,0.24)]"
            >
              Back to dashboard
            </Link>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive(item.to)
                    ? "bg-[#f8f6f0] text-[#1f4e43] font-semibold shadow-[0_10px_24px_rgba(20,43,37,0.18)]"
                    : "text-white/95 hover:bg-white/10"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-left text-[#e2efe8] hover:text-white"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 px-4 md:px-10 xl:px-14 py-6 md:py-10 pt-24 md:pt-10 bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f8f6f0_45%,_#f3f0eb_100%)]">
        <div className="mb-8 rounded-3xl border border-[#e7e5de] bg-white/75 p-5 md:p-7 shadow-[0_14px_40px_rgba(24,45,38,0.08)] backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f877f] font-semibold">Resource Library</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1f4e43] to-[#2a6b5e] bg-clip-text text-transparent leading-tight">
                Mental Health Resources 📚
              </h1>
              <p className="mt-3 text-sm md:text-base text-[#5f6d68] font-medium">
                Explore videos, exercises, articles, and wellness tools
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6f877f] mb-2">
                Filter by type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-2xl border border-[#d7d9d0] bg-white px-4 py-3 text-sm text-[#1f4e43] outline-none"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6f877f] mb-2">
                Filter by category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl border border-[#d7d9d0] bg-white px-4 py-3 text-sm text-[#1f4e43] outline-none"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="rounded-2xl border border-[#e7e5de] bg-white p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1f4e43]">All Resources</h3>
                <p className="text-sm text-[#6a7772]">
                  {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {resourcesLoading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[#e8e6df] bg-[#fbfbf9] p-5 shadow-sm animate-pulse"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#e8ece7]" />
                      <div className="mt-4 h-4 w-40 rounded bg-[#e8ece7]" />
                      <div className="mt-3 h-3 w-full rounded bg-[#e8ece7]" />
                      <div className="mt-2 h-3 w-3/4 rounded bg-[#e8ece7]" />
                    </div>
                  ))}
                </>
              ) : filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="rounded-2xl border border-[#e8e6df] bg-[#fbfbf9] p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${getResourceIconBg(resource.type)} flex items-center justify-center text-2xl`}
                    >
                      {getResourceIcon(resource.type)}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <h4 className="text-base font-bold text-[#1f4e43] leading-snug">
                        {resource.title}
                      </h4>
                      <span className="shrink-0 rounded-full border border-[#d8ddd7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#60706a]">
                        {resource.type || "resource"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#66706b] leading-relaxed">
                      {resource.description || "Helpful self-support resource for mental wellness."}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {resource.category && (
                        <span className="rounded-full bg-[#eef7f3] px-2.5 py-1 text-[11px] font-medium text-[#27584d]">
                          {resource.category}
                        </span>
                      )}
                      {resource.duration && (
                        <span className="rounded-full bg-[#f6f7f3] px-2.5 py-1 text-[11px] font-medium text-[#6a7772]">
                          {resource.duration}
                        </span>
                      )}
                    </div>

                    {resource.type === "video" && resource.embed_url ? (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e6df]">
                        <iframe
                          className="w-full h-52"
                          src={resource.embed_url}
                          title={resource.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-[#dfe5de] bg-white px-4 py-3">
                        <p className="text-xs text-[#66706b]">
                          {resource.type === "exercise"
                            ? "Open this resource to follow the exercise steps."
                            : resource.type === "article"
                            ? "Open this guide to read more."
                            : resource.type === "audio"
                            ? "Play this audio resource for relaxation."
                            : "Open this resource to explore more."}
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      {resource.resource_url ? (
                        <a
                          href={resource.resource_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-xs font-semibold text-[#1f4e43] hover:underline"
                        >
                          Open resource →
                        </a>
                      ) : (
                        <span className="inline-flex text-xs font-semibold text-[#1f4e43]">
                          Resource available
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-[#d6dbd2] bg-[#fbfcfa] px-6 py-10 text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <h4 className="text-lg font-bold text-[#1f4e43]">No resources found</h4>
                  <p className="mt-2 text-sm text-[#66706b]">
                    Try changing the filters or add more resources in the database.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}