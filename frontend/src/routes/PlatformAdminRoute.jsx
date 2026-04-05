import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminRole, getAdminToken } from "../utils/adminAuth";

export default function PlatformAdminRoute() {
  const location = useLocation();
  const token = getAdminToken();
  const role = getAdminRole();

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (role !== "platform_admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}