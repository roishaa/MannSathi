import { api } from "./api";

export const hospitalCounselorService = {
  async list() {
    const { data } = await api.get("/hospital-admin/counselors");
    return data;
  },
  async approve(id) {
    const { data } = await api.put(`/hospital-admin/counselors/${id}/approve`);
    return data;
  },
  async reject(id) {
    const { data } = await api.put(`/hospital-admin/counselors/${id}/reject`);
    return data;
  },
};
