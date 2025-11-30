// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CounselorSignup from "./pages/CounselorSignup";
import CounselorLogin from "./pages/CounselorLogin";
import BookAppointment from "./pages/BookAppointment";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* when path is "/", show Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/counselor/signup" element={<CounselorSignup />} />
        <Route path="/counselor/login" element={<CounselorLogin />} />
        <Route path="/BookAppointment" element={<BookAppointment />} />
        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
