export function getAdminInfo() {
  try {
    return JSON.parse(localStorage.getItem("admin_data")) || {};
  } catch {
    return {};
  }
}

export function getAdminToken() {
  return localStorage.getItem("admin_token");
}

export function getAdminRole() {
  return localStorage.getItem("admin_role");
}

// backward-compatible old name
export function getAuthRole() {
  return getAdminRole();
}

export function isHospitalAdmin() {
  return getAdminRole() === "hospital_admin";
}

export function isPlatformAdmin() {
  return getAdminRole() === "platform_admin";
}

export function logout() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_role");
  localStorage.removeItem("admin_data");

  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("admin_info");
}