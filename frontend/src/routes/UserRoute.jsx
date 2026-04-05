import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function UserRoute() {
  const location = useLocation();
  const token = localStorage.getItem("user_token");
  const userData = localStorage.getItem("user_data");

  if (!token || !userData) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}