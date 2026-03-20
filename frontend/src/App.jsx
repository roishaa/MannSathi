// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= PUBLIC PAGES =================
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookAppointment from "./pages/BookAppointment";
import Services from "./pages/Services";
import About from "./pages/About";
import Quiz from "./pages/Quiz";
import GuestSession from "./pages/GuestSession";


// ================= COUNSELOR PAGES =================
import CounselorSignup from "./pages/counselor/CounselorSignup";
import CounselorLogin from "./pages/counselor/CounselorLogin";
import CounselorDashboard from "./pages/counselor/CounselorDashboard";

// ================= USER PAGES =================
import MoodCheckIn from "./pages/users/MoodCheckIn";
import UserDashboard from "./pages/users/UserDashboard";
import AppointmentBooking from "./pages/users/AppointmentBooking";
import Payments from "./pages/users/Payments";
import UserSettings from "./pages/users/Settings";
import Chat from "./pages/users/Chat";
import SearchDoctor from "./pages/SearchDoctor";
import TestAuth from "./pages/TestAuth";
import DebugAuth from "./pages/DebugAuth";
import PaymentSuccess from "./pages/users/PaymentSuccess";
import PaymentFailed from "./pages/users/PaymentFailed";
import Sessions from "./pages/users/Sessions";

// ================= TOPIC PAGES =================
import Anxiety from "./pages/topics/Anxiety";
import Stress from "./pages/topics/Stress";
import Psychotic from "./pages/topics/Psychotic";
import Depression from "./pages/topics/Depression";
import Relationships from "./pages/topics/Relationships";
import OCD from "./pages/topics/OCD";

// ================= ADMIN LOGIN (ONE PAGE FOR BOTH) =================
import AdminLogin from "./pages/admin/AdminLogin";

// ================= PLATFORM ADMIN =================
import PlatformAdminDashboard from "./pages/platform/PlatformAdminDashboard";
import PlatformAdminRoute from "./routes/PlatformAdminRoute";

// ================= HOSPITAL ADMIN =================
import HospitalAdminDashboard from "./pages/hospitalAdmin/HospitalAdminDashboard";
import HospitalAdminRoute from "./routes/HospitalAdminRoute";
import CounselorApproval from "./pages/hospitalAdmin/CounselorApproval";
import UserRoute from "./routes/UserRoute";

// Optional: Unauthorized page (recommended)
function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow max-w-md w-full text-center">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p className="text-gray-600 mt-2">You don&apos;t have access to this page.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/guest-session/:id" element={<GuestSession />} />

        

        {/* ================= COUNSELOR ROUTES ================= */}
        <Route path="/counselor/signup" element={<CounselorSignup />} />
        <Route path="/counselor/login" element={<CounselorLogin />} />
        <Route path="/counselor/dashboard" element={<CounselorDashboard />} />

        {/* ================= USER ROUTES (PROTECTED) ================= */}
        <Route element={<UserRoute />}>
          <Route path="/users/mood-check" element={<MoodCheckIn />} />
          <Route path="/users/dashboard" element={<UserDashboard />} />
          <Route path="/users/appointments/book" element={<AppointmentBooking />} />
          <Route path="/users/BookAppointmentUser" element={<AppointmentBooking />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/search-doctor" element={<SearchDoctor />} />
          <Route path="/test-auth" element={<TestAuth />} />
          <Route path="/debug-auth" element={<DebugAuth />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/sessions" element={<Sessions />} />
        </Route>

        {/* ================= TOPIC ROUTES ================= */}
        <Route path="/topics/anxiety" element={<Anxiety />} />
        <Route path="/topics/stress" element={<Stress />} />
        <Route path="/topics/psychotic" element={<Psychotic />} />
        <Route path="/topics/depression" element={<Depression />} />
        <Route path="/topics/relationships" element={<Relationships />} />
        <Route path="/topics/ocd" element={<OCD />} />

        {/* ================= ADMIN (ONE LOGIN) ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ================= PLATFORM ADMIN (PROTECTED) ================= */}
        <Route element={<PlatformAdminRoute />}>
          <Route path="/platform-admin/dashboard" element={<PlatformAdminDashboard />} />
        </Route>

        {/* ================= HOSPITAL ADMIN (PROTECTED) ================= */}
        <Route element={<HospitalAdminRoute />}>
          <Route path="/hospital-admin/dashboard" element={<HospitalAdminDashboard />} />
          <Route path="/hospital-admin/counselors" element={<CounselorApproval />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
