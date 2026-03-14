import axios from "axios";

/**
 * Axios instance for all API requests.
 * - Base URL: http://127.0.0.1:8000/api (Laravel backend)
 * - Auth: Automatically attaches Bearer token from localStorage
 * - Headers: application/json
 */
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false, // ✅ Disable cookies, use Bearer token instead
});

/**
 * Request interceptor: Attach Bearer token to all requests
 * ✅ Includes: Authorization: Bearer <token>
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    // ✅ Attach Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: Log token attachment (remove in production)
      if (import.meta.env.DEV) {
        console.debug("📤 API Request:", {
          method: config.method.toUpperCase(),
          url: config.url,
          hasToken: true,
          tokenLength: token.length,
        });
      }
    } else if (config.url !== "/login" && config.url !== "/register") {
      // ⚠️ Warn if token is missing for protected routes
      console.warn("⚠️ No auth token found for request:", config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: Handle authentication errors
 * ✅ Only clear auth if /api/user or /api/me returns 401
 * ⚠️ For other 401s, show message but keep token (retry may succeed)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Handle 401 responses
    if (error?.response?.status === 401) {
      const message = error.response.data?.message || "";
      const failedUrl = error.config?.url || "";

      // Only logout if the /api/user or /api/me endpoint returns 401
      // These endpoints verify token validity
      const isUserCheckEndpoint = failedUrl === "/user" || failedUrl === "/me";

      if (isUserCheckEndpoint) {
        // Token is invalid - clear auth and redirect
        console.warn("[api] User validation failed (401). Clearing auth and redirecting.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        // Other endpoints returned 401 - show warning but keep token
        console.warn(
          "❌ Unauthorized (401) on endpoint:",
          failedUrl,
          "Message:",
          message || "No message"
        );
      }
    }

    // ✅ Handle 403 responses - user exists but lacks permissions
    if (error?.response?.status === 403) {
      console.error("❌ Forbidden (403):", error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

export const API = api;   // ✅ Supports: import { API } from "../../utils/api"
export default api;       // ✅ Supports: import api from "../../utils/api"
