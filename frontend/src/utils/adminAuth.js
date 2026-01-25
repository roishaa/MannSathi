export const getAuthToken = () => localStorage.getItem("auth_token");

export const getAuthRole = () => localStorage.getItem("auth_role");

export const getAdminInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("admin_info"));
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getAuthToken();

export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("admin_info");
};
