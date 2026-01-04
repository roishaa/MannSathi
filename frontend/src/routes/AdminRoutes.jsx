import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersList from "../pages/admin/UsersList";

// create these later (can be placeholder pages for now)
import CounselorsList from "../pages/admin/CounselorsList";
import AppointmentsList from "../pages/admin/AppointmentsList";

import AdminProtectedRoute from "./AdminProtectedRoute";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public admin route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/counselors" element={<CounselorsList />} />
        <Route path="/admin/appointments" element={<AppointmentsList />} />
      </Route>
    </Routes>
  );
}
