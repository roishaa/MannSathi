import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function CounselorRoute() {
  const location = useLocation();
  const token = localStorage.getItem("counselor_token");
  const counselorData = localStorage.getItem("counselor_data");

  if (!token || !counselorData) {
    return <Navigate to="/counselor/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}