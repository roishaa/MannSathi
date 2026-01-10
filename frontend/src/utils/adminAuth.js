export const ADMIN_SESSION_KEY = "admin_session";

/**
 * session shape:
 * {
 *   role: "platform_admin" | "hospital_admin",
 *   name: string,
 *   email: string,
 *   hospitalId?: string,
 *   hospitalName?: string,
 *   loggedInAt?: string
 * }
 */

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isRole(role) {
  const s = getAdminSession();
  return s?.role === role;
}
