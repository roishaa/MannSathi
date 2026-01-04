import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAdminSession } from "../../utils/adminAuth";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Counselors", path: "/admin/counselors" },
    { name: "Appointments", path: "/admin/appointments" },
  ];

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="w-64 bg-[#215c4c] text-white min-h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

      <nav className="space-y-2 flex-1">
        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block px-4 py-2 rounded-lg ${
              location.pathname === item.path
                ? "bg-white text-[#215c4c]"
                : "hover:bg-[#1b4d40]"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-white text-[#215c4c] py-2 rounded-lg font-semibold hover:opacity-90"
      >
        Logout
      </button>
    </aside>
  );
}
