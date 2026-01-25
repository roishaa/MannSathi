import { api } from "./api";

export const adminService = {
  async platformLogin(email, password) {
    const { data } = await api.post("/platform/login", { email, password });
    return data;
  },
  async hospitalLogin(email, password) {
    const { data } = await api.post("/hospital-admin/login", { email, password });
    return data;
  },
};
