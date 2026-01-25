import { Navigate, Outlet } from "react-router-dom";
import { getAuthRole, isLoggedIn } from "../utils/adminAuth";

export default function HospitalAdminRoute() {
  if (!isLoggedIn()) return <Navigate to="/admin/login" replace />;
  if (getAuthRole() !== "hospital_admin")
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
