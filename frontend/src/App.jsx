// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= PUBLIC PAGES =================
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookAppointment from "./pages/BookAppointment";

// ================= COUNSELOR PAGES =================
import CounselorSignup from "./pages/counselor/CounselorSignup";
import CounselorLogin from "./pages/counselor/CounselorLogin";

// ================= USER PAGES =================
import MoodCheckIn from "./pages/users/MoodCheckIn";
import UserDashboard from "./pages/users/UserDashboard";
import BookAppointmentUser from "./pages/users/BookAppointmentUser";
import Sessions from "./pages/users/Sessions";
import Payments from "./pages/users/Payments";
import UserSettings from "./pages/users/Settings";
import Chat from "./pages/users/Chat";
import SearchDoctor from "./pages/SearchDoctor";

// ================= TOPIC PAGES =================
import Anxiety from "./pages/topics/Anxiety";
import Stress from "./pages/topics/Stress";
import Psychotic from "./pages/topics/Psychotic";
import Depression from "./pages/topics/Depression";
import Relationships from "./pages/topics/Relationships";
import OCD from "./pages/topics/OCD";

// ================= PLATFORM ADMIN (MANNSATHI) =================
import PlatformLogin from "./pages/platform/PlatformLogin";
import PlatformDashboard from "./pages/platform/PlatformDashboard";
import PlatformAdminRoute from "./routes/PlatformAdminRoute";

// ================= HOSPITAL ADMIN =================
import HospitalAdminLogin from "./pages/hospitalAdmin/HospitalAdminLogin";
import HospitalAdminDashboard from "./pages/hospitalAdmin/HospitalAdminDashboard";
import HospitalAdminRoute from "./routes/HospitalAdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/counselor/signup" element={<CounselorSignup />} />
        <Route path="/counselor/login" element={<CounselorLogin />} />

        <Route path="/BookAppointment" element={<BookAppointment />} />

        {/* ================= USER ROUTES ================= */}
        <Route path="/users/mood-check" element={<MoodCheckIn />} />
        <Route path="/users/dashboard" element={<UserDashboard />} />
        <Route
          path="/users/BookAppointmentUser"
          element={<BookAppointmentUser />}
        />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/search-doctor" element={<SearchDoctor />} />

        {/* ================= TOPIC ROUTES ================= */}
        <Route path="/topics/anxiety" element={<Anxiety />} />
        <Route path="/topics/stress" element={<Stress />} />
        <Route path="/topics/psychotic" element={<Psychotic />} />
        <Route path="/topics/depression" element={<Depression />} />
        <Route path="/topics/relationships" element={<Relationships />} />
        <Route path="/topics/ocd" element={<OCD />} />

        {/* ================= PLATFORM ADMIN (MANNSATHI OWNER) ================= */}
        <Route path="/platform/login" element={<PlatformLogin />} />
        <Route element={<PlatformAdminRoute />}>
          <Route path="/platform/dashboard" element={<PlatformDashboard />} />
        </Route>

        {/* ================= HOSPITAL ADMIN (ONE HOSPITAL) ================= */}
        <Route path="/hospital-admin/login" element={<HospitalAdminLogin />} />
        <Route element={<HospitalAdminRoute />}>
          <Route
            path="/hospital-admin/dashboard"
            element={<HospitalAdminDashboard />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
