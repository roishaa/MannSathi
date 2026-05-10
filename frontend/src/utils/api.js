import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: "application/json",
  },
});

function getTokenByRequest(config) {
  const url = config?.url || "";

  const userToken = localStorage.getItem("user_token");
  const counselorToken = localStorage.getItem("counselor_token");
  const adminToken = localStorage.getItem("admin_token");
  const authToken = localStorage.getItem("auth_token");

  // counselor routes
  if (url.startsWith("/counselor/")) {
    return counselorToken;
  }

  // admin routes
  if (
    url.startsWith("/admin/") ||
    url.includes("hospital-admin") ||
    url.includes("platform-admin")
  ) {
    return adminToken;
  }

  // shared appointment routes (user + counselor) — prefer counselor token so
  // ChatPanel requests are never sent with a stale user token
  if (url.startsWith("/appointments")) {
    return counselorToken || userToken;
  }

  // user routes
  if (
    url.startsWith("/user/") ||
    url.startsWith("/esewa/pay") ||
    url.startsWith("/logout")
  ) {
    return userToken || authToken;
  }

  // fallback
  return userToken || counselorToken || adminToken || authToken || "";
}

api.interceptors.request.use(
  (config) => {
    // If the caller already set an Authorization header explicitly, respect it
    if (config.headers?.Authorization) {
      return config;
    }

    const token = getTokenByRequest(config);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// IMPORTANT:
// export both default and named API so old files keep working
export const API = api;
export default api;