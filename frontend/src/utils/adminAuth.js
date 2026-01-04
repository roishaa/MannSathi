// src/utils/adminAuth.js

export const ADMIN_KEY = "admin_auth";

export function isAdminLoggedIn() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data?.role === "admin";
  } catch {
    return false;
  }
}

export function setAdminSession(adminObj) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(adminObj));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY);
}
