import { Navigate, Outlet } from "react-router-dom";
import { isRole } from "../utils/adminAuth";

export default function PlatformAdminRoute() {
  if (!isRole("platform_admin")) return <Navigate to="/platform/login" replace />;
  return <Outlet />;
}
