import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function UserRoute() {
  const location = useLocation();
  const token = localStorage.getItem("auth_token");
  const userRaw = localStorage.getItem("user");
  const hasUser = Boolean(userRaw);
  const isAuthed = Boolean(token);

  // Debug logs (temporary): show guard decision
  console.debug("[UserRoute] token:", token ? `${token.slice(0, 8)}...` : null);
  console.debug("[UserRoute] hasUser:", hasUser);
  console.debug("[UserRoute] allow:", isAuthed);

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
