import { Navigate, Outlet } from "react-router-dom";
import { getAuthRole, isLoggedIn } from "../utils/adminAuth";

export default function PlatformAdminRoute() {
  if (!isLoggedIn()) return <Navigate to="/admin/login" replace />;
  if (getAuthRole() !== "platform_admin")
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
