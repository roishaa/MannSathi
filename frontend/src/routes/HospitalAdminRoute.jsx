import { Navigate, Outlet } from "react-router-dom";
import { isRole } from "../utils/adminAuth";

export default function HospitalAdminRoute() {
  if (!isRole("hospital_admin")) return <Navigate to="/hospital-admin/login" replace />;
  return <Outlet />;
}
