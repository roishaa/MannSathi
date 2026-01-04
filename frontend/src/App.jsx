// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookAppointment from "./pages/BookAppointment";

// Counselor pages
import CounselorSignup from "./pages/counselor/CounselorSignup";
import CounselorLogin from "./pages/counselor/CounselorLogin";

// User pages
import MoodCheckIn from "./pages/users/MoodCheckIn";
import UserDashboard from "./pages/users/UserDashboard";
import BookAppointmentUser from "./pages/users/BookAppointmentUser";
import Sessions from "./pages/users/Sessions";
import Payments from "./pages/users/Payments";
import UserSettings from "./pages/users/Settings";
import Chat from "./pages/users/Chat";
import SearchDoctor from "./pages/SearchDoctor";

// Topic pages
import Anxiety from "./pages/topics/Anxiety";
import Stress from "./pages/topics/Stress";
import Psychotic from "./pages/topics/Psychotic";
import Depression from "./pages/topics/Depression";
import Relationships from "./pages/topics/Relationships";
import OCD from "./pages/topics/OCD";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Admin route protection
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

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
        <Route path="/users/BookAppointmentUser" element={<BookAppointmentUser />} />
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

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
