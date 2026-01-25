const KEY = "counselors_v1";

// toggle this later when backend is ready
const USE_BACKEND = false;

// ---------- Local storage implementation (for now) ----------
function lsRead() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function lsWrite(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// ---------- Backend implementation placeholders (later) ----------
async function apiCreateCounselor(payload) {
  // example later:
  // return (await axios.post("/counselors", payload)).data;
  throw new Error("Backend not connected yet");
}

async function apiListCounselors() {
  // example later:
  // return (await axios.get("/hospital-admin/counselors")).data;
  throw new Error("Backend not connected yet");
}

async function apiUpdateStatus(id, status) {
  // example later:
  // return (await axios.put(`/hospital-admin/counselors/${id}/status`, { status })).data;
  throw new Error("Backend not connected yet");
}

// ---------- Public service used by UI ----------
export const counselorService = {
  async createCounselor(payload) {
    if (USE_BACKEND) return apiCreateCounselor(payload);

    const list = lsRead();
    const newItem = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      specialization: payload.specialization,
      licenseNo: payload.licenseNo,
      experienceYears: Number(payload.experienceYears || 0),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...list];
    lsWrite(updated);
    return newItem;
  },

  async listCounselors() {
    if (USE_BACKEND) return apiListCounselors();
    return lsRead();
  },

  async approveCounselor(id) {
    if (USE_BACKEND) return apiUpdateStatus(id, "APPROVED");

    const list = lsRead();
    const updated = list.map((c) => (c.id === id ? { ...c, status: "APPROVED" } : c));
    lsWrite(updated);
    return updated.find((c) => c.id === id);
  },

  async rejectCounselor(id) {
    if (USE_BACKEND) return apiUpdateStatus(id, "REJECTED");

    const list = lsRead();
    const updated = list.map((c) => (c.id === id ? { ...c, status: "REJECTED" } : c));
    lsWrite(updated);
    return updated.find((c) => c.id === id);
  },

  async getCounselorByEmail(email) {
    const list = await this.listCounselors();
    return list.find((c) => c.email?.toLowerCase() === email?.toLowerCase()) || null;
  },
};
